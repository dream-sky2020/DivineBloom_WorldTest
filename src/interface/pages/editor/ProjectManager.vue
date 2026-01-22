<template>
  <div class="project-manager">
    <div class="panel-section">
      <div class="section-header">
        <span>项目控制</span>
        <div class="header-actions">
          <button class="icon-btn" @click="handleExportProject" title="导出全项目 (JSON)">
            📦 导出项目
          </button>
          <label class="icon-btn import-label" title="导入项目数据">
            📥 导入项目
            <input type="file" @change="handleImportProject" accept=".json" style="display: none;" />
          </label>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-header">
        <span>场景列表</span>
      </div>
      <div class="scene-list">
        <div 
          v-for="mapId in availableMaps" 
          :key="mapId" 
          class="scene-item"
          :class="{ 
            active: currentMapId === mapId,
            loading: isLoading && loadingMapId === mapId,
            disabled: isLoading
          }"
          @click="switchMap(mapId)"
          @contextmenu="handleRightClick($event, mapId)"
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
  </div>
</template>

<script setup>
import { computed, ref, inject } from 'vue'
import { maps } from '@/data/maps'
import { useGameStore } from '@/stores/game'
import { ScenarioLoader } from '@/game/ecs/ScenarioLoader'
import { gameManager } from '@/game/ecs/GameManager'
import { createLogger } from '@/utils/logger'

const { openContextMenu } = inject('editorContextMenu');

const logger = createLogger('ProjectManager')

const gameStore = useGameStore()
const worldStore = gameStore.world
const availableMaps = Object.keys(maps)
const currentMapId = computed(() => worldStore.currentMapId)
const isLoading = ref(false)
const loadingMapId = ref('')

const handleRightClick = (e, mapId) => {
  const hasState = !!worldStore.worldStates[mapId];
  const items = [
    { 
      label: '重置场景数据', 
      icon: '♻️', 
      class: 'danger',
      disabled: !hasState,
      action: () => confirmResetMap(mapId) 
    }
  ];
  openContextMenu(e, items);
}

const confirmResetMap = (mapId) => {
  if (confirm(`确定要重置场景 "${mapId}" 的所有修改吗？此操作不可撤销。`)) {
    delete worldStore.worldStates[mapId];
    if (currentMapId.value === mapId) {
      // 如果重置的是当前场景，重新加载
      gameManager.loadMap(mapId);
    }
    logger.info('Map state reset:', mapId);
  }
}

const switchMap = async (mapId) => {
  if (currentMapId.value === mapId || isLoading.value) return
  
  try {
    isLoading.value = true
    loadingMapId.value = mapId
    
    // 1. 保存当前地图状态
    if (gameManager.currentScene.value) {
      worldStore.saveState(gameManager.currentScene.value)
    }
    
    // 2. 切换场景 (使用 loadMap 强制加载新地图)
    await gameManager.loadMap(mapId)
  } catch (error) {
    logger.error('Failed to switch map:', error)
    alert(`切换地图失败: ${error.message}`)
  } finally {
    isLoading.value = false
    loadingMapId.value = ''
  }
}

const handleExportProject = async () => {
  const bundle = await ScenarioLoader.exportProject(gameManager.engine, worldStore.worldStates, maps)
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `project_full_export_${new Date().getTime()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const handleImportProject = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const bundle = JSON.parse(e.target.result)
      const newStates = ScenarioLoader.importProject(bundle)
      worldStore.bulkUpdateStates(newStates)
      alert('项目导入成功！请重新加载或切换地图。')
    } catch (err) {
      logger.error('Failed to import project:', err)
      alert('导入失败：文件格式不正确')
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped src="@styles/editor/ProjectManager.css"></style>
