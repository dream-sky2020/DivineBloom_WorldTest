<template>
  <EditorPanel 
    :title="editorManager.getPanelTitle('scene-manager')" 
    :icon="editorManager.getPanelIcon('scene-manager')" 
    :is-enabled="editorManager.isPanelEnabled('scene-manager')"
  >
    <template #header-actions>
      <div class="header-actions">
        <div class="panel-mode-toggle" title="显示模式">
          <button class="mode-btn" :class="{ active: panelMode !== 'explorer' }" @click="toggleRealtime" title="实时数据">🐞</button>
          <button class="mode-btn" :class="{ active: panelMode !== 'realtime' }" @click="toggleExplorer" title="列表模式">📝</button>
        </div>
        <button class="icon-btn" @click="showCreateModal = true" title="新建场景">
          ➕
        </button>
        <button class="icon-btn" @click="handleExportProject" title="导出全项目 (JSON)">
          📦
        </button>
        <label class="icon-btn import-label" title="导入项目数据">
          📥
          <input type="file" @change="handleImportProject" accept=".json" style="display: none;" />
        </label>
      </div>
    </template>

    <div class="realtime-panel" v-show="panelMode !== 'explorer'">
      <div class="realtime-header">
        <button class="collapse-toggle" @click="showRealtimePanel = !showRealtimePanel">
          {{ showRealtimePanel ? '▼' : '▶' }}
        </button>
        <span class="realtime-title">项目实时数据</span>
        <div class="realtime-actions">
          <button class="mini-btn" @click="refreshProjectPreview" title="刷新项目实时数据">🔄</button>
          <button class="mini-btn" @click="handleExportProject" title="导出全项目 (JSON)">💾</button>
        </div>
      </div>
      <div v-show="showRealtimePanel" class="realtime-content">
        <div class="realtime-hint">项目级场景列表与状态快照</div>
        <pre class="realtime-preview">{{ projectRealtimePreview }}</pre>
      </div>
    </div>

    <div class="panel-section" v-show="panelMode !== 'realtime'">
      <div class="section-header">
        <span>场景列表</span>
      </div>
      <div class="scene-list">
        <div 
          v-for="mapId in allMapIds" 
          :key="mapId" 
          class="scene-item"
          :class="{ 
            active: currentMapId === mapId,
            loading: isLoading && loadingMapId === mapId,
            disabled: isLoading
          }"
          @click="switchMap(mapId)"
          @contextmenu.prevent="handleRightClick($event, mapId)"
        >
          <div class="scene-icon">{{ isLoading && loadingMapId === mapId ? '⏳' : '🗺️' }}</div>
          <div class="scene-info">
            <div class="scene-name">{{ mapId }}</div>
            <div class="scene-status">
              <template v-if="isLoading && loadingMapId === mapId">
                加载中...
              </template>
              <template v-else>
                {{ worldStore.worldStates[mapId] ? '已修改' : '默认配置' }}
              </template>
            </div>
          </div>
          <div v-if="currentMapId === mapId && !isLoading" class="active-indicator">当前</div>
        </div>
      </div>
    </div>

    <!-- 新建场景模态框 -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-content">
        <h3>新建场景</h3>
        <div class="form-group">
          <label>场景 ID (唯一):</label>
          <input v-model="newSceneForm.id" type="text" placeholder="例如: dungeon_01" />
        </div>
        <div class="form-group">
          <label>场景名称:</label>
          <input v-model="newSceneForm.name" type="text" placeholder="例如: 地下城一层" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>宽度:</label>
            <input v-model.number="newSceneForm.width" type="number" />
          </div>
          <div class="form-group">
            <label>高度:</label>
            <input v-model.number="newSceneForm.height" type="number" />
          </div>
        </div>
        <div class="form-group">
          <label>背景色:</label>
          <input v-model="newSceneForm.groundColor" type="color" />
        </div>
        <div class="modal-actions">
          <button @click="showCreateModal = false">取消</button>
          <button class="primary" @click="confirmCreateScene">创建</button>
        </div>
      </div>
    </div>
  </EditorPanel>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, onUnmounted } from 'vue'
// import { schemasManager } from '@/schemas/SchemasManager'
import { useGameStore } from '@/stores/game'
import { world2d } from '@world2d/World2DFacade'
import { editorManager } from '@/game/editor'
import { createLogger } from '@/utils/logger'
import EditorPanel from '../components/EditorPanel.vue'

const { openContextMenu } = inject('editorContextMenu') as any;

const logger = createLogger('SceneSwitcherPanel')

const gameStore = useGameStore()
const worldStore = gameStore.world2d
// 合并 schemas 中的地图和 worldStore 中的动态地图
const allMapIds = computed(() => {
  const staticMaps: string[] = []; // schemasManager.mapIds;
  const dynamicMaps = Object.keys(worldStore.worldStates);
  // 🎯 [FIX] 确保当前地图 ID 即使未保存也出现在列表中
  const current = currentMapId.value ? [currentMapId.value] : [];
  return Array.from(new Set([...staticMaps, ...dynamicMaps, ...current]));
})
const currentMapId = computed(() => worldStore.currentMapId)
const isLoading = ref(false)
const loadingMapId = ref('')
const showCreateModal = ref(false)
const projectRealtimePreview = ref('')
const showRealtimePanel = ref(true)
const panelMode = ref<'all' | 'explorer' | 'realtime'>('all')
let previewTimer: any = 0
const newSceneForm = ref({
  id: '',
  name: '',
  width: 2000,
  height: 2000,
  groundColor: '#88aa88'
})

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

const handleRightClick = (e: MouseEvent, mapId: string) => {
  const hasState = !!worldStore.worldStates[mapId];
  const items = [
    { 
      label: '重置场景数据', 
      icon: '♻️', 
      class: 'danger',
      disabled: !hasState,
      action: () => confirmResetMap(mapId) 
    },
    {
      label: '删除场景',
      icon: '🗑️',
      class: 'danger',
      action: () => confirmDeleteMap(mapId)
    }
  ];
  openContextMenu(e, items);
}

const confirmDeleteMap = async (mapId: string) => {
  if (confirm(`确定要彻底删除场景 "${mapId}" 吗？此操作不可撤销。`)) {
    // 1. 删除持久化状态
    delete worldStore.worldStates[mapId];
    
    // 2. 如果是当前场景，切换到默认场景
    if (currentMapId.value === mapId) {
      const otherMap = allMapIds.value.find(id => id !== mapId) || 'demo_plains';
      if (otherMap !== mapId) {
        await switchMap(otherMap);
      } else {
        alert('无法删除最后一个场景！');
        return;
      }
    }
    
    // 3. 强制刷新列表（Vue computed 会自动处理）
    logger.info('Map deleted:', mapId);
  }
}

const confirmCreateScene = async () => {
  const { id, name, width, height, groundColor } = newSceneForm.value;
  if (!id) {
    alert('请输入场景 ID');
    return;
  }
  if (allMapIds.value.includes(id)) {
    alert('场景 ID 已存在');
    return;
  }

  // 创建初始状态
  const newSceneState = {
    header: {
      version: '1.1.0',
      config: {
        id,
        name,
        width,
        height,
        background: { groundColor }
      }
    },
    entities: [] // 空实体列表
  };

  // 保存到 store
  worldStore.worldStates[id] = newSceneState;
  
  // 关闭模态框并重置表单
  showCreateModal.value = false;
  newSceneForm.value = { id: '', name: '', width: 2000, height: 2000, groundColor: '#88aa88' };

  // 自动切换到新场景
  await switchMap(id);
}

const confirmResetMap = (mapId: string) => {
  if (confirm(`确定要重置场景 "${mapId}" 的所有修改吗？此操作不可撤销。`)) {
    delete worldStore.worldStates[mapId];
    if (currentMapId.value === mapId) {
      // ✅ 使用统一 API 重新加载
      world2d.loadMap(mapId);
    }
    logger.info('Map state reset:', mapId);
  }
}

const switchMap = async (mapId: string) => {
  if (currentMapId.value === mapId || isLoading.value) return
  
  try {
    isLoading.value = true
    loadingMapId.value = mapId
    
    // 1. 保存当前地图状态
    if (world2d.getCurrentSceneInfo()) {
      worldStore.saveState()
    }
    
    // 2. ✅ 使用统一 API 切换场景
    await world2d.loadMap(mapId)
  } catch (error: any) {
    logger.error('Failed to switch map:', error)
    alert(`切换地图失败: ${error.message}`)
  } finally {
    isLoading.value = false
    loadingMapId.value = ''
  }
}

const handleExportProject = async () => {
  const bundle = await world2d.exportProject(worldStore.worldStates, {} /* schemasManager.mapLoaders */)
  if (!bundle) {
    alert('导出失败：引擎未初始化')
    return
  }
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `scene_full_export_${new Date().getTime()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const buildProjectSnapshot = () => {
  return {
    currentMapId: currentMapId.value,
    mapIds: allMapIds.value,
    worldStates: worldStore.worldStates
  }
}

const refreshProjectPreview = () => {
  projectRealtimePreview.value = safeStringify(buildProjectSnapshot(), 2, 9000)
}

const handleImportProject = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e: any) => {
    try {
      const bundle = JSON.parse(e.target.result)
      const newStates = world2d.importProject(bundle)
      worldStore.bulkUpdateStates(newStates)
      alert('场景导入成功！请重新加载或切换地图。')
    } catch (err) {
      logger.error('Failed to import scene:', err)
      alert('导入失败：文件格式不正确')
    }
  }
  reader.readAsText(file)
}

onMounted(() => {
  refreshProjectPreview()
  previewTimer = setInterval(refreshProjectPreview, 1500)
})

onUnmounted(() => {
  clearInterval(previewTimer)
})

const safeStringify = (value: any, space = 2, maxLength = 6000) => {
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

<style scoped src="@styles/editor/SceneManager.css"></style>
<style scoped src="@styles/editor/EditorPanelCommon.css"></style>

<style scoped>
/* Specific styles for SceneSwitcher that are not in common */
.import-label {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
