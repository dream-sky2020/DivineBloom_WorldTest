<template>
  <div class="editor-sidebars-container">
    <!-- Left Sidebar -->
    <div 
      class="sidebar-container left-sidebar" 
      v-if="show"
      :class="{ 'is-collapsed': isLeftCollapsed }"
      :style="sidebarStyles.left"
    >
      <div class="sidebar-controls">
        <button v-if="!isLeftHidden" @click="resetSidebar('left')" class="control-btn reset-btn" title="重置宽度">
          ↺
        </button>
      </div>

      <div 
        class="sidebar-content" 
        v-show="!isLeftHidden"
        @dragover.prevent
        @drop="onDrop($event, 'left')"
      >
        <div v-for="group in editor.layout.left" :key="group.id" class="sidebar-panel-wrapper">
          <TabbedPanelGroup :group="group" side="left" />
        </div>
        <div v-if="editor.layout.left.length === 0" class="sidebar-placeholder">
          <h3 style="padding: 16px; color: #94a3b8; font-size: 14px;">左侧无面板</h3>
        </div>
      </div>

      <!-- Resize Handle -->
      <div class="resize-handle right" @mousedown.stop="startResizing('left')"></div>
    </div>

    <!-- Layout Spacers for Flex Layout (Optional, depends on how GameUI uses them) -->
    <!-- Note: We emit layout changes so GameUI can adjust its absolute positioning -->

    <!-- Right Sidebar -->
    <div 
      class="sidebar-container right-sidebar" 
      v-if="show"
      :class="{ 'is-collapsed': isRightCollapsed, 'is-hidden': isRightHidden }"
      :style="sidebarStyles.right"
    >
      <!-- Resize Handle -->
      <div class="resize-handle left" @mousedown.stop="startResizing('right')"></div>

      <div class="sidebar-controls">
        <button v-if="!isRightHidden" @click="resetSidebar('right')" class="control-btn reset-btn" title="重置宽度">
          ↺
        </button>
      </div>

      <div 
        class="sidebar-content" 
        v-show="!isRightHidden"
        @dragover.prevent
        @drop="onDrop($event, 'right')"
      >
        <div v-for="group in editor.layout.right" :key="group.id" class="sidebar-panel-wrapper">
          <TabbedPanelGroup :group="group" side="right" />
        </div>
        <div v-if="editor.layout.right.length === 0" class="sidebar-placeholder">
          <h3 style="padding: 16px; color: #94a3b8; font-size: 14px;">右侧无面板</h3>
        </div>
      </div>
    </div>

    <!-- Edge Triggers (Hidden State Indicators) -->
    <div 
      v-if="show && isLeftHidden" 
      class="edge-trigger left" 
      @mousedown="startResizing('left')"
      @click="restoreSidebar('left')"
    >
      <div class="blue-line"></div>
    </div>
    <div 
      v-if="show && isRightHidden" 
      class="edge-trigger right" 
      @mousedown="startResizing('right')"
      @click="restoreSidebar('right')"
    >
      <div class="blue-line"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { editor } from '@/game/editor';
import TabbedPanelGroup from '@/interface/editor/components/TabbedPanelGroup.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  editorCtrl: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:layout', 'resize-canvas', 'update:resizing']);

// Sidebar Resize & Collapse State
const DEFAULT_SIDEBAR_WIDTH = 320;

const leftSidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);
const rightSidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);
const isLeftHidden = ref(false);
const isRightHidden = ref(false);
const resizingSidebar = ref(null);

// Computed Styles
const sidebarStyles = computed(() => {
  const isOverlay = editor.sidebarMode === 'overlay';
  
  return {
    left: {
      width: isLeftHidden.value ? '0px' : `${leftSidebarWidth.value}px`,
      opacity: isLeftHidden.value ? 0 : (isOverlay ? 0.92 : 1),
      pointerEvents: isLeftHidden.value ? 'none' : 'auto',
      backgroundColor: isOverlay ? 'rgba(30, 41, 59, 0.8)' : '#1e293b',
      backdropFilter: isOverlay ? 'blur(8px)' : 'none'
    },
    right: {
      width: isRightHidden.value ? '0px' : `${rightSidebarWidth.value}px`,
      opacity: isRightHidden.value ? 0 : (isOverlay ? 0.92 : 1),
      pointerEvents: isRightHidden.value ? 'none' : 'auto',
      backgroundColor: isOverlay ? 'rgba(30, 41, 59, 0.8)' : '#1e293b',
      backdropFilter: isOverlay ? 'blur(8px)' : 'none'
    }
  };
});

// Calculate current layout offsets to send back to GameUI
const layoutOffsets = computed(() => {
  if (!props.show) return { left: 0, right: 0 };
  
  return {
    left: isLeftHidden.value ? 0 : leftSidebarWidth.value,
    right: isRightHidden.value ? 0 : rightSidebarWidth.value
  };
});

// Notify parent whenever layout changes
watch([layoutOffsets, () => editor.sidebarMode], ([newOffsets]) => {
  emit('update:layout', newOffsets);
  nextTick(() => emit('resize-canvas'));
}, { immediate: true });

// Sync with editor editMode
watch(() => editor.editMode, (newVal) => {
  if (newVal) {
    isLeftHidden.value = false;
    isRightHidden.value = false;
  }
});

// Resize Handlers
const startResizing = (side) => {
  resizingSidebar.value = side;
  emit('update:resizing', side);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResizing);
  document.body.style.cursor = 'col-resize';
};

const handleMouseMove = (e) => {
  if (!resizingSidebar.value) return;

  const HIDE_THRESHOLD = 30; // 拖动到小于 30px 时隐藏

  if (resizingSidebar.value === 'left') {
    const newWidth = e.clientX;
    if (newWidth < HIDE_THRESHOLD) {
      isLeftHidden.value = true;
    } else {
      isLeftHidden.value = false;
      leftSidebarWidth.value = Math.max(150, Math.min(600, newWidth));
    }
  } else {
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth < HIDE_THRESHOLD) {
      isRightHidden.value = true;
    } else {
      isRightHidden.value = false;
      rightSidebarWidth.value = Math.max(150, Math.min(600, newWidth));
    }
  }
};

const stopResizing = () => {
  resizingSidebar.value = null;
  emit('update:resizing', null);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
  document.body.style.cursor = '';
  emit('resize-canvas');
};

const restoreSidebar = (side) => {
  if (side === 'left') {
    isLeftHidden.value = false;
    if (leftSidebarWidth.value < 100) leftSidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
  } else {
    isRightHidden.value = false;
    if (rightSidebarWidth.value < 100) rightSidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
  }
  emit('resize-canvas');
};

const resetSidebar = (side) => {
  if (side === 'left') {
    leftSidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
    isLeftHidden.value = false;
  } else {
    rightSidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
    isRightHidden.value = false;
  }
  emit('resize-canvas');
};

const onDrop = (e, side) => props.editorCtrl.handlePanelDrop(e, side);

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
});
</script>

<style scoped>
@import "@/styles/editor/Sidebar.css";

/* Ensure container allows sidebar placement but doesn't interfere with absolute positioning of canvas */
.editor-sidebars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass through to canvas container if not over a sidebar */
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.sidebar-container {
  pointer-events: auto; /* Re-enable for sidebars */
  position: relative;
  height: 100%;
  background: #1e293b;
  display: flex;
  flex-direction: column;
  border-color: #334155;
}

/* Correct positioning in the flex container */
.left-sidebar {
  border-right-width: 1px;
}

.right-sidebar {
  border-left-width: 1px;
}

/* Edge Triggers for Hidden Sidebars */
.edge-trigger {
  position: absolute;
  top: 0;
  width: 12px; /* 感应区域宽度 */
  height: 100%;
  pointer-events: auto;
  cursor: col-resize;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edge-trigger.left {
  left: 0;
}

.edge-trigger.right {
  right: 0;
}

.blue-line {
  width: 2px;
  height: 100%;
  background-color: #3b82f6; /* 蓝色线条 */
  opacity: 0;
}

.edge-trigger:hover .blue-line {
  opacity: 1;
  width: 4px;
}

.sidebar-container.is-hidden {
  border: none;
  overflow: hidden;
}
</style>
