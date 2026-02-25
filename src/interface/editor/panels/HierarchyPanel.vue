<template>
  <EditorPanel 
    :title="editorManager.getPanelTitle('scene-explorer')" 
    :icon="editorManager.getPanelIcon('scene-explorer')" 
    :is-enabled="editorManager.isPanelEnabled('scene-explorer')"
  >
    <template #header-actions>
      <div class="header-actions">
        <div class="panel-mode-toggle" title="显示模式">
          <button class="mode-btn" :class="{ active: panelMode !== 'explorer' }" @click="toggleRealtime" title="实时数据">🐞</button>
          <button class="mode-btn" :class="{ active: panelMode !== 'realtime' }" @click="toggleExplorer" title="实体列表">📝</button>
        </div>
        <button class="export-btn" @click="handleExport" title="导出场景数据 (JSON)">
          📥
        </button>
      </div>
    </template>

    <div class="explorer-stats">
      <div class="stats-left">
        <span>实体: {{ entities.length }}</span>
        <span v-if="mapId" class="map-tag">{{ mapId }}</span>
      </div>
    </div>

    <div class="realtime-panel" v-show="panelMode !== 'explorer'">
      <div class="realtime-header">
        <button class="collapse-toggle" @click="showRealtimePanel = !showRealtimePanel">
          {{ showRealtimePanel ? '▼' : '▶' }}
        </button>
        <span class="realtime-title">场景实时数据</span>
        <div class="realtime-actions">
          <button class="mini-btn" @click="refreshScenePreview" title="刷新场景实时数据">🔄</button>
          <button class="mini-btn" @click="handleExport" title="导出场景实时数据">💾</button>
        </div>
      </div>
      <div v-show="showRealtimePanel" class="realtime-content">
        <div class="realtime-hint">当前场景的实体与配置快照</div>
        <pre class="realtime-preview">{{ sceneRealtimePreview }}</pre>
      </div>
    </div>

    <div class="explorer-body" v-show="panelMode !== 'realtime'">
      <div 
        v-for="e in sortedEntities" 
        :key="e.id" 
        class="entity-item"
        :class="{ selected: selectedEntity === e }"
        @click="selectEntity(e)"
        @contextmenu="handleRightClick($event, e)"
      >
        <div class="entity-info">
          <span 
            class="entity-type" 
            :class="{ global: e.globalManager }"
            :style="e.inspector?.tagColor ? { backgroundColor: e.inspector.tagColor, color: 'white' } : {}"
          >
            {{ e.inspector?.tagName || e.type || 'Unknown' }}
          </span>
          <span class="entity-name">{{ e.name || (e.globalManager ? 'Global Manager' : '(无名称)') }}</span>
        </div>
        <div class="entity-meta">
          <template v-if="e.position">
            <span>x: {{ Math.round(e.position?.x || 0) }}</span>
            <span>y: {{ Math.round(e.position?.y || 0) }}</span>
          </template>
          <template v-else-if="e.globalManager">
            <span class="global-tag">系统实体</span>
          </template>
        </div>
        <!-- 删除按钮 -->
        <button 
          v-if="e.inspector?.allowDelete !== false" 
          class="delete-btn" 
          @click.stop="confirmDelete(e)"
          title="删除实体"
        >
          🗑️
        </button>
      </div>
    </div>
  </EditorPanel>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, toRaw } from 'vue'
import { world2d } from '@world2d/World2DFacade'
import { editorManager } from '@/game/editor'
import EditorPanel from '../components/EditorPanel.vue'

const { openContextMenu } = inject('editorContextMenu') as any;

const entities = ref<any[]>([])
const mapId = computed(() => world2d.getCurrentSceneInfo()?.mapId || '')
const selectedEntity = computed(() => editorManager.selectedEntity)
const sceneRealtimePreview = ref('')
const showRealtimePanel = ref(true)
const panelMode = ref<'all' | 'explorer' | 'realtime'>('all')
let previewTimer: any = 0
let syncTimer: any = 0

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

const sortedEntities = computed(() => {
  return [...entities.value].sort((a, b) => {
    // 1. 首先按优先级排序（高优先级在前）
    const priorityA = a.inspector?.priority ?? 0
    const priorityB = b.inspector?.priority ?? 0
    if (priorityA !== priorityB) return priorityB - priorityA
    
    // 2. 然后按类型排序
    const typeA = a.type || ''
    const typeB = b.type || ''
    if (typeA !== typeB) return typeA.localeCompare(typeB)
    
    // 3. 最后按名称排序
    return (a.name || '').localeCompare(b.name || '')
  })
})

const selectEntity = (entity: any) => {
  editorManager.selectedEntity = entity
}

const handleRightClick = (e: MouseEvent, entity: any) => {
  selectEntity(entity);
  const items = [
    { 
      label: '删除实体', 
      icon: '🗑️', 
      class: 'danger',
      disabled: entity.inspector?.allowDelete === false,
      action: () => confirmDelete(entity) 
    }
  ];
  openContextMenu(e, items);
}

const confirmDelete = (entity: any) => {
  if (entity.inspector?.allowDelete === false) {
    alert('该实体禁止删除');
    return;
  }
  
  const name = entity.name || entity.type || '未命名实体';
  if (confirm(`确定要删除实体 "${name}" 吗？`)) {
    // [FIX] 使用 toRaw 获取原始实体对象，而不是 Vue 的 Proxy
    const rawEntity = toRaw(entity);
    world2d.enqueueCommand({
      type: 'DELETE_ENTITY',
      payload: { entityId: rawEntity?.id, entity: rawEntity }
    });

    if (editorManager.selectedEntity === entity) {
      editorManager.selectedEntity = null;
    }
  }
}

const handleExport = () => {
  // ✅ 使用统一 API 导出场景
  const bundle = world2d.exportCurrentScene();
  if (!bundle) {
    console.error('Failed to export scene');
    return;
  }
  
  const mapId = world2d.getCurrentSceneInfo()?.mapId || 'unknown';
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${mapId}_scene_export_${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const refreshScenePreview = () => {
  const bundle = world2d.exportCurrentScene()
  if (!bundle) {
    sceneRealtimePreview.value = '暂无场景数据'
    return
  }
  sceneRealtimePreview.value = safeStringify(bundle, 2, 8000)
}

const shouldSyncEntities = () => {
  const panelVisible = panelMode.value !== 'realtime'
  return editorManager.editMode && panelVisible
}

const syncData = () => {
  if (shouldSyncEntities()) {
    entities.value = world2d.getEditorEntities()
  }
}

onMounted(() => {
  syncData()
  syncTimer = setInterval(syncData, 250)
  refreshScenePreview()
  previewTimer = setInterval(refreshScenePreview, 1200)
})

onUnmounted(() => {
  clearInterval(syncTimer)
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

<style scoped src="@styles/editor/SceneExplorer.css"></style>
<style scoped src="@styles/editor/EditorPanelCommon.css"></style>

