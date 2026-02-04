<template>
  <EditorPanel 
    :title="editorManager.getPanelTitle('entity-properties')" 
    :icon="editorManager.getPanelIcon('entity-properties')" 
    :is-enabled="editorManager.isPanelEnabled('entity-properties')"
  >
    <template #header-actions>
      <div class="panel-mode-toggle" title="显示模式">
        <button class="mode-btn" :class="{ active: panelMode !== 'explorer' }" @click="toggleRealtime" title="实时数据">🐞</button>
        <button class="mode-btn" :class="{ active: panelMode !== 'realtime' }" @click="toggleExplorer" title="属性面板">📝</button>
      </div>
    </template>
    <template v-if="localEntityState">
      <div class="realtime-panel" v-show="panelMode !== 'explorer'">
        <div class="realtime-header">
          <button class="collapse-toggle" @click="showRealtimePanel = !showRealtimePanel">
            {{ showRealtimePanel ? '▼' : '▶' }}
          </button>
          <span class="realtime-title">实时数据预览</span>
          <div class="realtime-actions">
            <button class="mini-btn" @click="refreshEntityPreview" title="刷新实体实时数据">🔄</button>
            <button class="mini-btn export-btn" @click="exportEntitySnapshot" title="导出当前实体实时数据">
              💾
            </button>
          </div>
        </div>
        <div v-show="showRealtimePanel" class="realtime-content">
          <div class="realtime-hint">当前选中实体的实时快照</div>
          <pre class="realtime-preview">{{ entityRealtimePreview }}</pre>
        </div>
      </div>
      <div class="inspector-header">
        <div class="header-left">
          <span 
            class="entity-type-tag"
            :style="localEntityState.inspector?.tagColor ? { backgroundColor: localEntityState.inspector.tagColor, color: 'white' } : {}"
          >
            {{ localEntityState.inspector?.tagName || localEntityState.type || 'ENTITY' }}
          </span>
          <span v-if="activeEditingGroup" class="unsaved-dot" title="正在编辑中">•</span>
        </div>
        <div class="header-actions">
          <button 
            v-if="localEntityState.inspector?.allowDelete !== false" 
            class="action-btn delete-btn" 
            @click="confirmDelete"
            title="删除实体"
          >
            🗑️ 删除
          </button>
        </div>
      </div>
      <div class="inspector-body" v-show="panelMode !== 'realtime'">
        <!-- 🎯 方案：局部声明式 Inspector 映射 -->
        <template v-if="localEntityState.inspector">
          <div v-for="group in groupedFields" :key="group.name" class="inspector-group-section" :class="{ 'is-editing': activeEditingGroup === group.name }">
            <div class="group-header">
              <div class="header-main" @click="toggleGroup(group.name)">
                <span class="group-icon">{{ collapsedGroups[group.name] ? '▶' : '▼' }}</span>
                <span class="group-title">{{ group.name }}</span>
              </div>
              
              <!-- 分组操作按钮 -->
              <div class="group-actions">
                <template v-if="activeEditingGroup === group.name">
                  <button class="mini-btn confirm-btn" @click.stop="saveGroupEdit(group.fields)" title="保存修改">✔</button>
                  <button class="mini-btn cancel-btn" @click.stop="cancelGroupEdit()" title="取消修改">✖</button>
                </template>
                <button v-else class="mini-btn edit-btn" @click.stop="enterGroupEdit(group.name, group.fields)" title="编辑该组">✎</button>
              </div>
            </div>
            
            <div v-show="!collapsedGroups[group.name]" class="group-content">
              <div v-for="field in group.fields" :key="field.path" class="prop-group" :class="{ 'checkbox-group': field.type === 'checkbox' || field.type === 'boolean' }">
                <div v-if="field.type !== 'checkbox' && field.type !== 'boolean'" class="label-row">
                  <label>{{ field.label }}</label>
                  <span v-if="field.tip" class="info-icon" :title="field.tip">?</span>
                </div>

                <!-- 根据类型渲染不同的 Input -->
                <!-- 核心逻辑：如果是正在编辑的分组，绑定到 groupDraftData；否则从 localEntityState 实时读取 -->
                
                <!-- 数字类型 -->
                <input 
                  v-if="field.type === 'number'"
                  :value="formatNumber(getNestedValue(activeEditingGroup === group.name ? groupDraftData : localEntityState, field.path, lastUpdate), field.props)"
                  @input="activeEditingGroup === group.name && setNestedValue(groupDraftData, field.path, Number($event.target.value))"
                  :readonly="activeEditingGroup !== group.name"
                  :class="{ 'readonly-input': activeEditingGroup !== group.name }"
                  type="number"
                  v-bind="field.props"
                />

                <!-- 文本类型 -->
                <input 
                  v-else-if="field.type === 'text'"
                  :value="getNestedValue(activeEditingGroup === group.name ? groupDraftData : localEntityState, field.path, lastUpdate)"
                  @input="activeEditingGroup === group.name && setNestedValue(groupDraftData, field.path, $event.target.value)"
                  :readonly="activeEditingGroup !== group.name"
                  :class="{ 'readonly-input': activeEditingGroup !== group.name }"
                  type="text"
                  v-bind="field.props"
                />

                <!-- 布尔/复选框类型 -->
                <div v-else-if="field.type === 'checkbox' || field.type === 'boolean'" class="checkbox-container">
                  <label class="checkbox-label" :class="{ 'is-disabled': activeEditingGroup !== group.name }">
                    <input 
                      :checked="getNestedValue(activeEditingGroup === group.name ? groupDraftData : localEntityState, field.path, lastUpdate)"
                      @change="activeEditingGroup === group.name && setNestedValue(groupDraftData, field.path, $event.target.checked)"
                      :disabled="activeEditingGroup !== group.name"
                      type="checkbox"
                      v-bind="field.props"
                    />
                    <span class="checkbox-text">{{ field.label }}</span>
                  </label>
                  <span v-if="field.tip" class="info-icon" :title="field.tip">?</span>
                </div>

                <!-- JSON 类型 (用于对象/数组) -->
                <textarea 
                  v-else-if="field.type === 'json'"
                  class="json-textarea"
                  :class="{ 'readonly-input': activeEditingGroup !== group.name }"
                  :value="formatJson(getNestedValue(activeEditingGroup === group.name ? groupDraftData : localEntityState, field.path, lastUpdate))"
                  @change="activeEditingGroup === group.name && updateJsonValue(groupDraftData, field.path, $event.target.value)"
                  :readonly="activeEditingGroup !== group.name"
                  v-bind="field.props"
                  rows="5"
                ></textarea>

                <!-- 只读文本 -->
                <div v-else-if="field.type === 'readonly'" class="readonly-text">
                  {{ getNestedValue(activeEditingGroup === group.name ? groupDraftData : localEntityState, field.path, lastUpdate) }}
                </div>

                <!-- 颜色类型 -->
                <input 
                  v-else-if="field.type === 'color'"
                  :value="getNestedValue(activeEditingGroup === group.name ? groupDraftData : localEntityState, field.path, lastUpdate)"
                  @input="activeEditingGroup === group.name && setNestedValue(groupDraftData, field.path, $event.target.value)"
                  :disabled="activeEditingGroup !== group.name"
                  type="color"
                  v-bind="field.props"
                />

                <!-- 枚举/Select 类型 -->
                <select 
                  v-else-if="field.type === 'enum' || field.type === 'select'"
                  :value="getNestedValue(activeEditingGroup === group.name ? groupDraftData : localEntityState, field.path, lastUpdate)"
                  @change="activeEditingGroup === group.name && setNestedValue(groupDraftData, field.path, parseSelectValue($event.target.value, field))"
                  :disabled="activeEditingGroup !== group.name"
                  v-bind="field.props"
                >
                  <option v-for="(opt, idx) in getOptions(field)" :key="idx" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>

                <!-- 其他类型占位 -->
                <div v-else class="unsupported-type">
                  不支持的字段类型: {{ field.type }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 只有在没有 inspector 时才显示旧的硬编码内容 (或者作为兜底) -->
        <template v-else>
          <!-- 基础属性 -->
          <section class="prop-section">
            <h4>基础属性</h4>
            <div class="prop-group">
              <label>名称</label>
              <input 
                :value="localEntityState.name" 
                @input="localEntityState.name = $event.target.value"
                type="text" 
                :placeholder="localEntityState.globalManager ? 'Global Manager' : ''" 
              />
            </div>
            <div v-if="localEntityState.position" class="prop-group inline">
              <div class="field">
                <label>X (实时)</label>
                <input 
                  :value="localEntityState.position.x" 
                  @input="localEntityState.position.x = Number($event.target.value)"
                  type="number" 
                />
              </div>
              <div class="field">
                <label>Y</label>
                <input 
                  :value="localEntityState.position.y" 
                  @input="localEntityState.position.y = Number($event.target.value)"
                  type="number" 
                />
              </div>
            </div>
            <div v-if="localEntityState.globalManager" class="prop-group">
              <span class="global-badge">全局管理实体</span>
            </div>
          </section>

          <!-- 全局计时器 -->
          <section v-if="localEntityState.timer" class="prop-section">
            <h4>计时器系统</h4>
            <div class="prop-group">
              <label>总时长 (秒)</label>
              <input :value="localEntityState.timer.totalTime.toFixed(2)" type="text" readonly class="readonly-input" />
            </div>
            <div class="prop-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  :checked="localEntityState.timer.running" 
                  @change="localEntityState.timer.running = $event.target.checked"
                  type="checkbox" 
                />
                正在运行
              </label>
            </div>
          </section>

          <!-- 相机配置 (如果存在) -->
          <section v-if="localEntityState.camera" class="prop-section">
            <h4>相机系统</h4>
            <div class="prop-group inline">
              <div class="field">
                <label>当前 X</label>
                <input 
                  :value="localEntityState.camera.x" 
                  @input="localEntityState.camera.x = Number($event.target.value)"
                  type="number" 
                />
              </div>
              <div class="field">
                <label>当前 Y</label>
                <input 
                  :value="localEntityState.camera.y" 
                  @input="localEntityState.camera.y = Number($event.target.value)"
                  type="number" 
                />
              </div>
            </div>
            <div class="prop-group">
              <label>平滑系数 (Lerp)</label>
              <input 
                :value="localEntityState.camera.lerp" 
                @input="localEntityState.camera.lerp = Number($event.target.value)"
                type="number" 
                step="0.01" 
              />
            </div>
          </section>

          <!-- NPC 配置 -->
          <section v-if="localEntityState.npc" class="prop-section">
            <h4>NPC配置</h4>
            <div class="prop-group">
              <label>对话 ID</label>
              <input 
                :value="localEntityState.actionDialogue?.dialogueId" 
                @input="localEntityState.actionDialogue.dialogueId = $event.target.value; syncLegacyInteraction()"
                type="text" 
              />
            </div>
            <div class="prop-group">
              <label>对话范围</label>
              <input 
                :value="localEntityState.detectArea?.radius" 
                @input="localEntityState.detectArea.radius = Number($event.target.value); syncLegacyInteraction()"
                type="number" 
              />
            </div>
          </section>

          <!-- 传送门配置 -->
          <section v-if="localEntityState.type === 'portal'" class="prop-section">
            <h4>传送门配置</h4>
            <div class="prop-group">
              <label>目标地图</label>
              <input 
                :value="localEntityState.actionTeleport?.mapId" 
                @input="localEntityState.actionTeleport.mapId = $event.target.value"
                type="text" 
              />
            </div>
            <div class="prop-group">
              <label>目标入口</label>
              <input 
                :value="localEntityState.actionTeleport?.entryId" 
                @input="localEntityState.actionTeleport.entryId = $event.target.value"
                type="text" 
              />
            </div>
            <div class="prop-group inline">
              <div class="field">
                <label>宽度</label>
                <input 
                  :value="localEntityState.detectArea?.width ?? localEntityState.detectArea?.size?.w" 
                  @input="localEntityState.detectArea.width = Number($event.target.value)"
                  type="number" 
                />
              </div>
              <div class="field">
                <label>高度</label>
                <input 
                  :value="localEntityState.detectArea?.height ?? localEntityState.detectArea?.size?.h" 
                  @input="localEntityState.detectArea.height = Number($event.target.value)"
                  type="number" 
                />
              </div>
            </div>
          </section>

          <!-- 视觉/缩放 -->
          <section v-if="localEntityState.visual" class="prop-section">
            <h4>视觉</h4>
            <div class="prop-group">
              <label>资源 ID</label>
              <input 
                :value="localEntityState.visual.id" 
                @input="localEntityState.visual.id = $event.target.value"
                type="text" 
              />
            </div>
            <div class="prop-group">
              <label>缩放</label>
              <input 
                :value="localEntityState.visual.scale" 
                @input="localEntityState.visual.scale = Number($event.target.value)"
                type="number" 
                step="0.1" 
              />
            </div>
          </section>
        </template>
      </div>
    </template>
    <div v-else class="empty-state">
      <p>请选择一个实体进行编辑</p>
    </div>
  </EditorPanel>
</template>

<script setup>
import { ref, onMounted, onUnmounted, toRaw, computed, watch } from 'vue'
import { world2d } from '@world2d' // ✅ 使用统一接口
import { editorManager } from '@/game/editor/core/EditorCore'
import EditorPanel from '../components/EditorPanel.vue'

// ✅ 延迟获取函数（避免循环依赖）
const getWorld = () => world2d.getWorld()

// 属性编辑同步
const localEntityState = ref(null)
const lastUpdate = ref(Date.now())
const showRealtimePanel = ref(true)
const panelMode = ref('all')

const toggleRealtime = () => {
  if (panelMode.value === 'all') panelMode.value = 'explorer';
  else if (panelMode.value === 'realtime') panelMode.value = 'explorer';
  else panelMode.value = 'all';
}

const toggleExplorer = () => {
  if (panelMode.value === 'all') panelMode.value = 'realtime';
  else if (panelMode.value === 'explorer') panelMode.value = 'realtime';
  else panelMode.value = 'all';
}

const refreshEntityPreview = () => {
  lastUpdate.value = Date.now()
}

const entityRealtimePreview = computed(() => {
  if (!localEntityState.value) return ''
  // 依赖 lastUpdate 以保持实时刷新
  lastUpdate.value
  const snapshot = buildEntitySnapshot(localEntityState.value)
  return safeStringify(snapshot, 2, 7000)
})

// 局部编辑状态管理
const activeEditingGroup = ref(null)
const groupDraftData = ref({})

// 分组展开收起状态
const collapsedGroups = ref({})

const toggleGroup = (groupName) => {
  collapsedGroups.value[groupName] = !collapsedGroups.value[groupName];
}

const groupedFields = computed(() => {
  if (!localEntityState.value?.inspector?.fields) return [];
  
  const fields = localEntityState.value.inspector.fields;
  const groups = [];
  const groupMap = {};

  fields.forEach(field => {
    const groupName = field.group || '基本属性'; // 默认分组
    if (!groupMap[groupName]) {
      groupMap[groupName] = { name: groupName, fields: [] };
      groups.push(groupMap[groupName]);
    }
    groupMap[groupName].fields.push(field);
  });

  return groups;
});

/**
 * 进入分组编辑模式
 */
const enterGroupEdit = (groupName, fields) => {
  // 如果当前已经在编辑别的组，先提示或自动保存（这里选择先切换）
  activeEditingGroup.value = groupName;
  const draft = {};
  fields.forEach(field => {
    const val = getNestedValue(localEntityState.value, field.path);
    // 简单的深拷贝实现 (处理对象和基本类型)
    setNestedValue(draft, field.path, val !== undefined ? JSON.parse(JSON.stringify(val)) : undefined);
  });
  groupDraftData.value = draft;
};

/**
 * 保存分组修改
 */
const saveGroupEdit = (fields) => {
  if (!localEntityState.value) return;
  
  fields.forEach(field => {
    const draftVal = getNestedValue(groupDraftData.value, field.path, null, field);
    const oldVal = getNestedValue(localEntityState.value, field.path, null, field);
    
    if (draftVal !== oldVal || !field.path) {
      if (field.path) {
        setNestedValue(localEntityState.value, field.path, draftVal, field);
      }
      
      if (field.onUpdate) {
        field.onUpdate(localEntityState.value, draftVal, oldVal);
      }
    }
  });
  
  activeEditingGroup.value = null;
  groupDraftData.value = {};
  console.log('Inspector: Group changes saved');
};

/**
 * 取消分组编辑
 */
const cancelGroupEdit = () => {
  activeEditingGroup.value = null;
  groupDraftData.value = {};
};

// 监听实体切换 (重置编辑状态)
watch(() => editorManager.selectedEntity, (newEntity) => {
  localEntityState.value = newEntity;
  activeEditingGroup.value = null;
  groupDraftData.value = {};
}, { immediate: true });

const confirmDelete = () => {
  const entity = localEntityState.value;
  if (!entity) return;
  
  if (entity.inspector?.allowDelete === false) {
    alert('该实体禁止删除');
    return;
  }
  
  const name = entity.name || entity.type || '未命名实体';
  if (confirm(`确定要删除实体 "${name}" 吗？`)) {
    // [FIX] 使用 toRaw 获取原始实体对象，而不是 Vue 的 Proxy
    const rawEntity = toRaw(entity);
    
    // 发送命令
    const globalEntity = getWorld().with('commands').first;
    if (globalEntity) {
      globalEntity.commands.queue.push({
        type: 'DELETE_ENTITY',
        payload: { entity: rawEntity }
      });
    } else {
      getWorld().remove(rawEntity);
    }
    editorManager.selectedEntity = null;
  }
}

const buildEntitySnapshot = (entity) => {
  if (!entity) return null
  return toRaw(entity)
}

const exportEntitySnapshot = () => {
  if (!localEntityState.value) return
  const snapshot = buildEntitySnapshot(localEntityState.value)
  const json = safeStringify(snapshot, 2, 200000)
  const name = localEntityState.value.name || localEntityState.value.type || 'entity'
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}_realtime_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// 刷新频率控制
let rafId = 0
const syncEntityData = () => {
  // 不再在这里直接赋值 localEntityState.value，而是通过上面的 watch 监听
  // 但我们仍然可以保持 RAF 来刷新 UI 上的时间戳或其他动态数据
  lastUpdate.value = Date.now()
  rafId = requestAnimationFrame(syncEntityData)
}

onMounted(() => {
  syncEntityData()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})

// 同步旧系统的辅助函数
const syncLegacyInteraction = () => {
  if (localEntityState.value && localEntityState.value.interaction) {
    if (localEntityState.value.actionDialogue) {
      localEntityState.value.interaction.id = localEntityState.value.actionDialogue.dialogueId
    }
    if (localEntityState.value.detectArea && localEntityState.value.detectArea.radius) {
      localEntityState.value.interaction.range = localEntityState.value.detectArea.radius
    }
  }
}

/**
 * 获取嵌套对象属性
 * @param {Object} obj 目标对象
 * @param {string} path 属性路径
 * @param {number} [_trigger] 额外的响应式触发器 (如 lastUpdate)
 * @param {Object} [field] 字段定义对象，支持自定义 getValue
 */
const getNestedValue = (obj, path, _trigger, field) => {
  if (!obj) return undefined;
  const targetObj = obj.value || obj;

  if (field?.getValue) return field.getValue(targetObj);
  if (!path) return undefined;

  return path.split('.').reduce((prev, curr) => prev ? prev[curr] : undefined, targetObj);
}

/**
 * 设置嵌套对象属性
 * @param {Object} obj 目标对象
 * @param {string} path 属性路径
 * @param {any} value 值
 * @param {Object} [field] 字段定义对象，支持自定义 setValue
 */
const setNestedValue = (obj, path, value, field) => {
  if (!obj) return;
  const targetRoot = obj.value || obj;

  if (field?.setValue) {
    field.setValue(targetRoot, value);
    return;
  }

  if (!path) return;
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((prev, curr) => {
    if (!prev[curr]) prev[curr] = {};
    return prev[curr];
  }, targetRoot);
  target[last] = value;
}

/**
 * 格式化 JSON 数据
 */
const formatJson = (value) => {
  if (value === undefined || value === null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
}

/**
 * 更新 JSON 数据
 */
const updateJsonValue = (obj, path, value) => {
  try {
    const parsed = JSON.parse(value);
    setNestedValue(obj, path, parsed);
  } catch (e) {
    console.error('Invalid JSON input', e);
  }
}

/**
 * 格式化数字，防止出现超长浮点数
 */
const formatNumber = (value, props = {}) => {
  if (typeof value !== 'number') return value;
  
  // 如果是只读的或者是计时器这种高频变动的，限制小数位数
  if (props.readonly || value.toString().length > 10) {
    return Number(value.toFixed(3));
  }
  return value;
}

/**
 * 获取枚举选项列表
 * 支持多种格式：
 * 1. options: ['A', 'B'], values: [0, 1]
 * 2. options: [{label: 'A', value: 0}, {label: 'B', value: 1}]
 * 3. options: ['A', 'B'] (值等于标签)
 * 4. options: { A: 0, B: 1 } (对象键值对)
 */
const getOptions = (field) => {
  if (!field) return [];
  
  // 1. 分离的 label 和 value 数组
  if (Array.isArray(field.options) && Array.isArray(field.values)) {
    return field.options.map((label, i) => ({ 
      label, 
      value: field.values[i] 
    }));
  }
  
  // 2/3. 数组格式
  if (Array.isArray(field.options)) {
    if (field.options.length === 0) return [];
    
    // 对象数组 [{label, value}]
    if (typeof field.options[0] === 'object') {
      return field.options;
    }
    
    // 字符串数组
    return field.options.map(o => ({ label: o, value: o }));
  }
  
  // 4. 对象格式 { KEY: value }
  if (field.options && typeof field.options === 'object') {
    return Object.entries(field.options).map(([key, val]) => ({ 
      label: key, 
      value: val 
    }));
  }
  
  return [];
}

/**
 * 解析 Select 的值
 * 因为 select change 事件传回的都是字符串，需要根据选项转换回原始类型 (如数字)
 */
const parseSelectValue = (domValue, field) => {
   const options = getOptions(field);
   const matched = options.find(o => String(o.value) === domValue);
   return matched ? matched.value : domValue;
}

const safeStringify = (value, space = 2, maxLength = 6000) => {
  if (value === undefined) return ''
  const seen = new WeakSet()
  let json = ''
  try {
    json = JSON.stringify(value, (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]'
        seen.add(val)
      }
      if (typeof val === 'function') return `[Function ${val.name || 'anonymous'}]`
      return val
    }, space)
  } catch (e) {
    json = String(value)
  }
  if (json.length > maxLength) {
    return `${json.slice(0, maxLength)}\n...省略...`
  }
  return json
}
</script>

<style scoped src="@styles/editor/EntityProperties.css"></style>
<style scoped src="@styles/editor/EditorPanelCommon.css"></style>

