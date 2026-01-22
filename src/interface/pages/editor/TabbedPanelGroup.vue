<template>
  <div 
    class="panel-group" 
    :class="[dropPos ? `drop-highlight-${dropPos}` : '']"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- 标签栏：处理合并 -->
    <div class="panel-tabs" :class="{ 'drop-target': dropPos === 'tabs' }">
      <div 
        v-for="panelId in group.panels" 
        :key="panelId"
        class="panel-tab"
        :class="{ active: group.activeId === panelId }"
        draggable="true"
        @dragstart="onDragStartTab($event, panelId)"
        @click="group.activeId = panelId"
      >
        <span class="tab-title">{{ getPanelTitle(panelId) }}</span>
      </div>
      <div class="tab-actions">
        <button class="action-btn" @click="moveGroupSide" :title="side === 'left' ? '移至右侧' : '移至左侧'">
          {{ side === 'left' ? '→' : '←' }}
        </button>
      </div>
    </div>

    <!-- 面板内容：处理拆分到下方 -->
    <div class="panel-content" :class="{ 'drop-target': dropPos === 'bottom' }">
      <component :is="getPanelComponent(group.activeId)" />
    </div>

    <!-- 顶部感应线：处理拆分到上方 -->
    <div class="drop-indicator-top" :class="{ active: dropPos === 'top' }"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { gameManager } from '@/game/ecs/GameManager'
import { getPanelTitle, getPanelComponent } from '@/game/interface/editor/PanelRegistry'

const props = defineProps({
  group: Object,
  side: String
})

const dropPos = ref(null) // 'top', 'tabs', 'bottom'

const moveGroupSide = () => {
  const layout = gameManager.editor.layout
  const sourceSide = props.side
  const targetSide = sourceSide === 'left' ? 'right' : 'left'
  
  layout[sourceSide] = layout[sourceSide].filter(g => g.id !== props.group.id)
  layout[targetSide].push(props.group)
}

const onDragStartTab = (e, panelId) => {
  e.dataTransfer.setData('panelId', panelId)
  e.dataTransfer.setData('sourceGroupId', props.group.id)
  e.dataTransfer.setData('sourceSide', props.side)
  e.dataTransfer.effectAllowed = 'move'
}

const onDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  const rect = e.currentTarget.getBoundingClientRect()
  const y = e.clientY - rect.top
  
  // 划分区域
  if (y < 10) {
    dropPos.value = 'top'
  } else if (y < 40) { // 标签栏高度约为 30-40px
    dropPos.value = 'tabs'
  } else {
    dropPos.value = 'bottom'
  }
}

const onDragLeave = () => {
  dropPos.value = null
}

const onDrop = (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  const panelId = e.dataTransfer.getData('panelId')
  const sourceGroupId = e.dataTransfer.getData('sourceGroupId')
  const sourceSide = e.dataTransfer.getData('sourceSide')
  const pos = dropPos.value
  
  dropPos.value = null
  if (!panelId) return

  const layout = gameManager.editor.layout
  const side = props.side

  // 1. 从原位置移除
  let movingPanelId = panelId
  const sourceGroup = layout[sourceSide].find(g => g.id === sourceGroupId)
  if (sourceGroup) {
    sourceGroup.panels = sourceGroup.panels.filter(id => id !== panelId)
    if (sourceGroup.activeId === panelId) {
      sourceGroup.activeId = sourceGroup.panels[0]
    }
    if (sourceGroup.panels.length === 0) {
      layout[sourceSide] = layout[sourceSide].filter(g => g.id !== sourceGroupId)
    }
  }

  // 2. 根据落点处理
  if (pos === 'tabs') {
    // 合并到当前组
    if (!props.group.panels.includes(movingPanelId)) {
      props.group.panels.push(movingPanelId)
      props.group.activeId = movingPanelId
    }
  } else {
    // 拆分出新组
    const newGroup = {
      id: `group-${Date.now()}`,
      activeId: movingPanelId,
      panels: [movingPanelId]
    }
    
    const currentIndex = layout[side].findIndex(g => g.id === props.group.id)
    if (pos === 'top') {
      layout[side].splice(currentIndex, 0, newGroup)
    } else {
      layout[side].splice(currentIndex + 1, 0, newGroup)
    }
  }
}
</script>

<style scoped src="@styles/editor/TabbedPanelGroup.css"></style>
