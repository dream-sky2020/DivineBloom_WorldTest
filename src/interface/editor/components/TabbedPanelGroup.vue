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
        <span class="tab-title">{{ editorManager.getPanelTitle(panelId) }}</span>
      </div>
      <div class="tab-actions">
        <button class="action-btn" @click="moveGroupSide" :title="side === 'left' ? '移至右侧' : '移至左侧'">
          {{ side === 'left' ? '→' : '←' }}
        </button>
      </div>
    </div>

    <!-- 面板内容 -->
    <div class="panel-content" :class="{ 'drop-target': dropPos === 'bottom' }">
      <PanelErrorBoundary v-if="group.activeId" :key="group.activeId">
        <component :is="editorManager.getPanelComponent(group.activeId)" />
      </PanelErrorBoundary>
    </div>

    <!-- 顶部感应线：处理拆分到上方 -->
    <div class="drop-indicator-top" :class="{ active: dropPos === 'top' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { editorManager } from '../../../game/editor/core/EditorCore'
import { type PanelGroup } from '@/game/editor/config/WorkspacePresets'
import PanelErrorBoundary from './PanelErrorBoundary.vue'

const props = defineProps<{
  group: PanelGroup,
  side: 'left' | 'right'
}>()

const dropPos = ref<'top' | 'tabs' | 'bottom' | null>(null)

const moveGroupSide = () => {
  const layout = editorManager.layout
  const sourceSide = props.side
  const targetSide = sourceSide === 'left' ? 'right' : 'left'
  
  layout[sourceSide] = layout[sourceSide].filter(g => g.id !== props.group.id)
  layout[targetSide].push(props.group)
}

const onDragStartTab = (e: DragEvent, panelId: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('panelId', panelId)
    e.dataTransfer.setData('sourceGroupId', props.group.id)
    e.dataTransfer.setData('sourceSide', props.side)
    e.dataTransfer.effectAllowed = 'move'
  }
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  const currentTarget = e.currentTarget as HTMLElement
  const rect = currentTarget.getBoundingClientRect()
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

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (e.dataTransfer) {
    const panelId = e.dataTransfer.getData('panelId')
    const sourceGroupId = e.dataTransfer.getData('sourceGroupId')
    const sourceSide = e.dataTransfer.getData('sourceSide') as 'left' | 'right'
    const pos = dropPos.value
    
    dropPos.value = null
    if (!panelId) return
    
    // 使用中心化的移动逻辑
    editorManager.movePanel({
      panelId,
      sourceSide,
      sourceGroupId,
      targetSide: props.side,
      targetGroupId: props.group.id,
      position: pos as any
    });
  }
}
</script>

<style scoped src="@styles/editor/TabbedPanelGroup.css"></style>

<style scoped>
/* 简单的淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
