<template>
  <div class="scene-explorer">
    <div class="explorer-stats">
      <div class="stats-left">
        <span>实体: {{ entities.length }}</span>
        <span v-if="mapId" class="map-tag">{{ mapId }}</span>
      </div>
      <button class="export-btn" @click="handleExport" title="导出场景数据 (JSON)">
        📥
      </button>
    </div>

    <div class="explorer-body">
      <div 
        v-for="e in sortedEntities" 
        :key="e.uuid || e.id" 
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, toRaw } from 'vue'
import { world } from '@/game/ecs/world'
import { gameManager } from '@/game/ecs/GameManager'
import { ScenarioLoader } from '@/game/ecs/ScenarioLoader'

const { openContextMenu } = inject('editorContextMenu');

const entities = ref([])
const mapId = computed(() => gameManager.currentScene.value?.mapData?.id || '')
const selectedEntity = computed(() => gameManager.editor.selectedEntity)

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

const selectEntity = (entity) => {
  gameManager.editor.selectedEntity = entity
}

const handleRightClick = (e, entity) => {
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

const confirmDelete = (entity) => {
  if (entity.inspector?.allowDelete === false) {
    alert('该实体禁止删除');
    return;
  }
  
  const name = entity.name || entity.type || '未命名实体';
  if (confirm(`确定要删除实体 "${name}" 吗？`)) {
    // [FIX] 使用 toRaw 获取原始实体对象，而不是 Vue 的 Proxy
    const rawEntity = toRaw(entity);
    
    // 发送命令给 ExecuteSystem
    const globalEntity = world.with('commands').first;
    if (globalEntity) {
      globalEntity.commands.queue.push({
        type: 'DELETE_ENTITY',
        payload: { entity: rawEntity }
      });
    } else {
      // 降级方案（如果全局实体还没初始化）
      world.remove(rawEntity);
    }

    if (gameManager.editor.selectedEntity === entity) {
      gameManager.editor.selectedEntity = null;
    }
  }
}

const handleExport = () => {
  const mapId = gameManager.currentScene.value?.mapData?.id || 'unknown';
  const bundle = ScenarioLoader.exportScene(gameManager.engine, mapId);
  
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${mapId}_scene_export_${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

let rafId = 0
const syncData = () => {
  const allEntities = []
  for (const entity of world) {
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

<style scoped src="@styles/editor/SceneExplorer.css"></style>
