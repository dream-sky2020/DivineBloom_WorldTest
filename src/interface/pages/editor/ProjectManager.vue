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
import { computed, ref } from 'vue'
import { maps } from '@/data/maps'
import { useGameStore } from '@/stores/game'
import { ScenarioLoader } from '@/game/ecs/ScenarioLoader'
import { gameManager } from '@/game/ecs/GameManager'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ProjectManager')

const gameStore = useGameStore()
const worldStore = gameStore.world
const availableMaps = Object.keys(maps)
const currentMapId = computed(() => worldStore.currentMapId)
const isLoading = ref(false)
const loadingMapId = ref('')

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

<style scoped>
.project-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  color: #f1f5f9;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  font-size: 11px;
  font-weight: bold;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
  padding-bottom: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: #1e293b;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #334155;
  border-color: #3b82f6;
  color: #f1f5f9;
}

.import-label {
  display: inline-block;
}

.scene-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scene-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.scene-item:hover {
  background: #334155;
  border-color: #475569;
}

.scene-item.active {
  background: #1e3a8a;
  border-color: #3b82f6;
}

.scene-item.loading {
  background: #1e293b;
  border-color: #facc15;
  animation: pulse 1.5s ease-in-out infinite;
}

.scene-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.scene-item.disabled:not(.loading) {
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.scene-icon {
  font-size: 20px;
}

.scene-info {
  flex: 1;
}

.scene-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.scene-status {
  font-size: 10px;
  color: #94a3b8;
}

.active-indicator {
  font-size: 10px;
  background: #3b82f6;
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
