<template>
  <div class="scene-explorer">
    <div class="explorer-stats">
      <span>实体总数: {{ entities.length }}</span>
      <span v-if="mapId">地图: {{ mapId }}</span>
    </div>

    <div class="explorer-body">
      <div 
        v-for="e in sortedEntities" 
        :key="e.uuid || e.id" 
        class="entity-item"
        :class="{ selected: selectedEntity === e }"
        @click="selectEntity(e)"
      >
        <div class="entity-info">
          <span class="entity-type">{{ e.type || 'Unknown' }}</span>
          <span class="entity-name">{{ e.name || '(无名称)' }}</span>
        </div>
        <div class="entity-meta">
          <span>x: {{ Math.round(e.position?.x || 0) }}</span>
          <span>y: {{ Math.round(e.position?.y || 0) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { world } from '@/game/ecs/world'
import { gameManager } from '@/game/ecs/GameManager'

const entities = ref([])
const mapId = computed(() => gameManager.currentScene.value?.mapData?.id || '')
const selectedEntity = computed(() => gameManager.editor.selectedEntity)

const sortedEntities = computed(() => {
  return [...entities.value].sort((a, b) => {
    const typeA = a.type || ''
    const typeB = b.type || ''
    if (typeA !== typeB) return typeA.localeCompare(typeB)
    return (a.name || '').localeCompare(b.name || '')
  })
})

const selectEntity = (entity) => {
  gameManager.editor.selectedEntity = entity
}

let rafId = 0
const syncData = () => {
  const allEntities = []
  for (const entity of world) {
    if (entity.globalManager) continue 
    allEntities.push(entity)
  }
  entities.value = allEntities
  rafId = requestAnimationFrame(syncData)
}

onMounted(() => {
  syncData()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.scene-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.explorer-stats {
  padding: 4px 12px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  font-size: 11px;
  color: #64748b;
  display: flex;
  justify-content: space-between;
}

.explorer-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.entity-item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.entity-item:hover {
  background: #334155;
}

.entity-item.selected {
  background: #1e40af;
  border-color: #3b82f6;
}

.entity-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.entity-type {
  font-size: 9px;
  background: #0f172a;
  color: #3b82f6;
  padding: 1px 4px;
  border-radius: 3px;
  text-transform: uppercase;
}

.entity-name {
  font-size: 12px;
  color: #f1f5f9;
}

.entity-meta {
  font-size: 10px;
  color: #64748b;
  display: flex;
  gap: 8px;
}
</style>
