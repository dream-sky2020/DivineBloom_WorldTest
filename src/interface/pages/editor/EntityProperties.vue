<template>
  <div class="entity-properties">
    <template v-if="localEntityState">
      <div class="inspector-header">
        <span 
          class="entity-type-tag"
          :style="localEntityState.inspector?.tagColor ? { backgroundColor: localEntityState.inspector.tagColor, color: 'white' } : {}"
        >
          {{ localEntityState.inspector?.tagName || localEntityState.type || 'ENTITY' }}
        </span>
        <button 
          v-if="localEntityState.inspector?.allowDelete !== false" 
          class="header-delete-btn" 
          @click="confirmDelete"
          title="删除实体"
        >
          🗑️ 删除
        </button>
      </div>
      <div class="inspector-body">
        <!-- 🎯 方案：声明式 Inspector 映射 -->
        <template v-if="localEntityState.inspector">
          <section class="prop-section">
            <h4>实体属性 (Inspector)</h4>
            
            <div v-for="field in localEntityState.inspector.fields" :key="field.path" class="prop-group">
              <div class="label-row">
                <label>{{ field.label }}</label>
                <span v-if="field.tip" class="info-icon" :title="field.tip">?</span>
              </div>

              <!-- 根据类型渲染不同的 Input -->
              <!-- 数字类型 -->
              <input 
                v-if="field.type === 'number'"
                :value="getNestedValue(localEntityState, field.path)"
                @input="setNestedValue(localEntityState, field.path, Number($event.target.value))"
                type="number"
                v-bind="field.props"
              />

              <!-- 文本类型 -->
              <input 
                v-else-if="field.type === 'text'"
                :value="getNestedValue(localEntityState, field.path)"
                @input="setNestedValue(localEntityState, field.path, $event.target.value)"
                type="text"
                v-bind="field.props"
              />

              <!-- 布尔/复选框类型 -->
              <label v-else-if="field.type === 'checkbox'" class="checkbox-label">
                <input 
                  :checked="getNestedValue(localEntityState, field.path)"
                  @change="setNestedValue(localEntityState, field.path, $event.target.checked)"
                  type="checkbox"
                  v-bind="field.props"
                />
                {{ field.label }}
              </label>

              <!-- 其他类型占位 -->
              <div v-else class="unsupported-type">
                不支持的字段类型: {{ field.type }}
              </div>
            </div>
          </section>
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
                  :value="localEntityState.detectArea?.size?.w" 
                  @input="localEntityState.detectArea.size.w = Number($event.target.value)"
                  type="number" 
                />
              </div>
              <div class="field">
                <label>高度</label>
                <input 
                  :value="localEntityState.detectArea?.size?.h" 
                  @input="localEntityState.detectArea.size.h = Number($event.target.value)"
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, toRaw } from 'vue'
import { world } from '@/game/ecs/world'
import { gameManager } from '@/game/ecs/GameManager'

// 属性编辑同步
const localEntityState = ref(null)
const lastUpdate = ref(Date.now())

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
    const globalEntity = world.with('commands').first;
    if (globalEntity) {
      globalEntity.commands.queue.push({
        type: 'DELETE_ENTITY',
        payload: { entity: rawEntity }
      });
    } else {
      world.remove(rawEntity);
    }
    gameManager.editor.selectedEntity = null;
  }
}

// 刷新频率控制
let rafId = 0
const syncEntityData = () => {
  const currentSelected = gameManager.editor.selectedEntity
  if (currentSelected) {
    localEntityState.value = currentSelected
    // 更新时间戳，触发那些依赖它的计算属性或显示
    lastUpdate.value = Date.now()
  } else {
    localEntityState.value = null
  }
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
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((prev, curr) => prev ? prev[curr] : undefined, obj);
}

/**
 * 设置嵌套对象属性
 */
const setNestedValue = (obj, path, value) => {
  if (!obj || !path) return;
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((prev, curr) => {
    if (!prev[curr]) prev[curr] = {};
    return prev[curr];
  }, obj);
  target[last] = value;
}
</script>

<style scoped>
.entity-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inspector-header {
  padding: 12px 16px;
  background: #0f172a;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entity-type-tag {
  font-size: 10px;
  background: #334155;
  color: #94a3b8;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}

.header-delete-btn {
  background: #450a0a;
  color: #fca5a5;
  border: 1px solid #7f1d1d;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-delete-btn:hover {
  background: #7f1d1d;
  color: white;
  border-color: #ef4444;
}

.inspector-body {
  padding: 16px;
  overflow-y: auto;
}

.prop-section {
  margin-bottom: 20px;
}

.prop-section h4 {
  margin: 0 0 10px 0;
  font-size: 12px;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.05em;
}

.prop-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-icon {
  width: 14px;
  height: 14px;
  background: #334155;
  color: #94a3b8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: help;
  transition: all 0.2s;
}

.info-icon:hover {
  background: #3b82f6;
  color: white;
}

.prop-group.inline {
  flex-direction: row;
  gap: 12px;
}

.prop-group.inline .field {
  flex: 1;
}

label {
  font-size: 11px;
  color: #64748b;
}

input {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 6px 8px;
  color: #f1f5f9;
  font-size: 13px;
  width: 100%;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

.readonly-input {
  background: #0f172a;
  color: #94a3b8;
  cursor: default;
}

.global-badge {
  display: inline-block;
  background: #7c3aed;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #f1f5f9;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.unsupported-type {
  font-size: 11px;
  color: #ef4444;
  font-style: italic;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}
</style>
