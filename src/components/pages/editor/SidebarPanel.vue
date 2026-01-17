<template>
  <div class="sidebar-panel">
    <div 
      class="panel-header" 
      draggable="true" 
      @dragstart="onDragStart"
    >
      <div class="panel-title">
        <span class="drag-handle">⋮⋮</span>
        {{ title }}
      </div>
      <div class="panel-actions">
        <button class="action-btn" @click="moveSide" :title="side === 'left' ? '移至右侧' : '移至左侧'">
          {{ side === 'left' ? '→' : '←' }}
        </button>
      </div>
    </div>
    <div class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { gameManager } from '@/game/GameManager'

const props = defineProps({
  id: String,
  title: String,
  side: String
})

const moveSide = () => {
  const layout = gameManager.editor.layout
  const sourceSide = props.side
  const targetSide = sourceSide === 'left' ? 'right' : 'left'
  
  // 从原侧边栏移除
  layout[sourceSide] = layout[sourceSide].filter(panelId => panelId !== props.id)
  
  // 添加到目标侧边栏
  if (!layout[targetSide].includes(props.id)) {
    layout[targetSide].push(props.id)
  }
}

const onDragStart = (e) => {
  // 存储面板 ID 和来源侧边栏
  e.dataTransfer.setData('panelId', props.id)
   e.dataTransfer.setData('sourceSide', props.side)
  e.dataTransfer.effectAllowed = 'move'
}
</script>

<style scoped>
.sidebar-panel {
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid #334155;
  height: 100%;
}

.panel-header {
  padding: 8px 12px;
  background: #0f172a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
  cursor: grab; /* 整个头部都可以抓取 */
}

.panel-header:active {
  cursor: grabbing;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  cursor: grab;
  color: #475569;
  user-select: none;
}

.action-btn {
  background: none;
  border: 1px solid #334155;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #1e293b;
  color: #3b82f6;
  border-color: #3b82f6;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}
</style>
