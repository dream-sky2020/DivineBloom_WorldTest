<template>
  <div class="page-scroller">
    <!-- Viewport 1: Game Canvas (100vh) -->
    <div class="viewport-section" :class="{ 'is-resizing': !!resizingSidebar }">
      <!-- Left Sidebar -->
      <div 
        class="sidebar-container left-sidebar" 
        v-if="shouldShowSidebars"
        :class="{ 'is-collapsed': isLeftCollapsed }"
        :style="sidebarStyles.left"
      >
        <div class="sidebar-controls">
          <button @click="toggleCollapse('left')" class="control-btn collapse-btn" :title="isLeftCollapsed ? '展开' : '折叠'">
            {{ isLeftCollapsed ? '▶' : '◀' }}
          </button>
          <button v-if="!isLeftCollapsed" @click="resetSidebar('left')" class="control-btn reset-btn" title="重置宽度">
            ↺
          </button>
        </div>

        <div 
          class="sidebar-content" 
          v-show="!isLeftCollapsed"
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

      <!-- Main Canvas Area (Isolated Absolute Layer) -->
      <div class="canvas-container" :style="canvasContainerStyle">
        <div id="game-canvas">
            <!-- Global Game Canvas -->
            <canvas 
              ref="gameCanvas" 
              class="global-canvas"
              :style="canvasStyle"
              @contextmenu="handleContextMenu"
            ></canvas>

            <!-- Layer 1: Grid Overlay (Background/World Level) -->
            <div class="grid-overlay" v-show="showGrid"></div>

            <!-- Layer 2: System UI (Top Level) -->
            <div class="system-layer">
              <!-- UI 层完全与游戏逻辑解耦，只负责展示数据 -->
              <div class="ui-overlay pointer-events-auto" v-if="debugInfo">
                <div><span v-t="'worldMap.position'"></span>: x={{ Math.round(debugInfo.x) }}, y={{ Math.round(debugInfo.y) }}</div>
                <div style="color: #60a5fa;">🖱️ 鼠标位置: x={{ Math.round(debugInfo.mouseX) }}, y={{ Math.round(debugInfo.mouseY) }}</div>
                <div><span v-t="'worldMap.lastInput'"></span>: {{ debugInfo.lastInput || $t('common.unknown') }}</div>
                
                <!-- Enemy Alert Status -->
                <div v-if="debugInfo.chasingCount > 0" style="color: #ef4444; font-weight: bold;">
                  ⚠️ {{ debugInfo.chasingCount }} Enemies Chasing!
                </div>
                
                <div v-t="'worldMap.moveControls'"></div>
              </div>

              <!-- NEW Dialogue Overlay (Connected to DialogueStore) -->
              <transition name="fade">
                <div v-if="dialogueStore.isActive" class="dialogue-overlay pointer-events-auto" @click="worldMapCtrl.handleOverlayClick()">
                  <div class="dialogue-box" @click.stop>
                    
                    <!-- Speaker Name -->
                    <div class="dialogue-header">
                      <span class="speaker-name">{{ $t(`roles.${dialogueStore.speaker}`) || dialogueStore.speaker }}</span>
                    </div>
                    
                    <!-- Text Content -->
                    <div class="dialogue-content">
                      {{ $t(dialogueStore.currentText) }}
                    </div>

                    <!-- Choices Area -->
                    <div v-if="dialogueStore.currentOptions.length > 0" class="choices-container">
                      <button 
                        v-for="(opt, idx) in dialogueStore.currentOptions" 
                        :key="idx"
                        class="choice-btn"
                        @click="dialogueStore.selectOption(opt.value)"
                      >
                        {{ $t(opt.label) }}
                      </button>
                    </div>

                    <!-- Continue Hint (Only if no choices) -->
                    <div v-else class="dialogue-hint" @click="dialogueStore.advance">
                      Click to continue... ▼
                    </div>

                  </div>
                </div>
              </transition>
            </div>
        </div>
      </div>

      <!-- Layout Spacer (Maintains flex flow and provides size reference) -->
      <div class="layout-spacer"></div>

      <!-- Right Sidebar -->
      <div 
        class="sidebar-container right-sidebar" 
        v-if="shouldShowSidebars"
        :class="{ 'is-collapsed': isRightCollapsed }"
        :style="sidebarStyles.right"
      >
        <!-- Resize Handle -->
        <div class="resize-handle left" @mousedown.stop="startResizing('right')"></div>

        <div class="sidebar-controls">
          <button v-if="!isRightCollapsed" @click="resetSidebar('right')" class="control-btn reset-btn" title="重置宽度">
            ↺
          </button>
          <button @click="toggleCollapse('right')" class="control-btn collapse-btn" :title="isRightCollapsed ? '展开' : '折叠'">
            {{ isRightCollapsed ? '◀' : '▶' }}
          </button>
        </div>

        <div 
          class="sidebar-content" 
          v-show="!isRightCollapsed"
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
    </div>

    <!-- Developer Tools Overlay removed -->

    <!-- Context Menu -->
    <div 
      v-if="contextMenu.show" 
      class="context-menu" 
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div 
        v-for="(item, index) in contextMenu.items" 
        :key="index"
        class="context-menu-item"
        :class="[item.class, { disabled: item.disabled }]"
        @click="!item.disabled && (item.action(), closeContextMenu())"
      >
        <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
        <span class="item-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- Viewport 2: Developer Dashboard (Local) -->
    <DevDashboard 
      :show-sidebars="showSidebars"
      @toggle-sidebars="toggleSidebars"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, provide } from 'vue';
import { world2d, getSystem } from '@world2d'; 
import { editor } from '@/game/editor';
import { createLogger } from '@/utils/logger';
import { WorldMapController } from '@/game/interface/WorldMapController';
import { CanvasManager } from '@/game/interface/CanvasManager';
import { EditorInteractionController } from '@/game/editor/core/EditorInteractionController';
import DevDashboard from './DevDashboard.vue';

import TabbedPanelGroup from '@/interface/editor/components/TabbedPanelGroup.vue';

const logger = createLogger('GameUI');
const currentSystem = ref(world2d.state.system);
const gameCanvas = ref(null);

// Canvas Manager Integration
const canvasMgr = new CanvasManager('game-canvas');

// World Map Controller Integration
const worldMapCtrl = new WorldMapController();
const debugInfo = worldMapCtrl.debugInfo;
const dialogueStore = worldMapCtrl.dialogueStore;

// Editor Interaction Controller Integration
const editorCtrl = new EditorInteractionController({
  openContextMenu: (e, items) => openContextMenu(e, items),
  closeContextMenu: () => closeContextMenu()
});

// Context Menu State
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  items: []
});

const closeContextMenu = () => {
  contextMenu.value.show = false;
};

const openContextMenu = (e, items) => {
  e.preventDefault();
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    items
  };
  
  // Close menu on click outside
  const handleOutsideClick = () => {
    closeContextMenu();
    document.removeEventListener('click', handleOutsideClick);
  };
  setTimeout(() => document.addEventListener('click', handleOutsideClick), 0);
};

provide('editorContextMenu', { openContextMenu, closeContextMenu });

// Sidebar Resize & Collapse State
const DEFAULT_SIDEBAR_WIDTH = 320;
const leftSidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);
const rightSidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);
const isLeftCollapsed = ref(false);
const isRightCollapsed = ref(false);
const resizingSidebar = ref(null);
const showSidebars = ref(false);

// Reactive Edit Mode State
const isEditMode = computed(() => editor.editMode);

// Determine if sidebars should be visible
const shouldShowSidebars = computed(() => {
  if (showSidebars.value) return true;
  if (isEditMode.value) return true;
  return false;
});

const canvasContainerStyle = computed(() => {
  const left = shouldShowSidebars.value ? (isLeftCollapsed.value ? 40 : leftSidebarWidth.value) : 0;
  const right = shouldShowSidebars.value ? (isRightCollapsed.value ? 40 : rightSidebarWidth.value) : 0;
  
  return {
    left: `${left}px`,
    right: `${right}px`
  };
});

const sidebarStyles = computed(() => {
  return {
    left: {
      width: isLeftCollapsed.value ? '40px' : `${leftSidebarWidth.value}px`,
      transition: 'none'
    },
    right: {
      width: isRightCollapsed.value ? '40px' : `${rightSidebarWidth.value}px`,
      transition: 'none'
    }
  };
});

// Sidebar Interaction Handlers
const startResizing = (side) => {
  resizingSidebar.value = side;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResizing);
  document.body.style.cursor = 'col-resize';
};

const handleMouseMove = (e) => {
  if (!resizingSidebar.value) return;

  if (resizingSidebar.value === 'left') {
    const newWidth = Math.max(150, Math.min(600, e.clientX));
    leftSidebarWidth.value = newWidth;
    if (isLeftCollapsed.value && newWidth > 60) isLeftCollapsed.value = false;
  } else {
    const newWidth = Math.max(150, Math.min(600, window.innerWidth - e.clientX));
    rightSidebarWidth.value = newWidth;
    if (isRightCollapsed.value && newWidth > 60) isRightCollapsed.value = false;
  }
  
  nextTick(resizeCanvas);
};

const stopResizing = () => {
  resizingSidebar.value = null;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
  document.body.style.cursor = '';
  nextTick(resizeCanvas);
};

const resetSidebar = (side) => {
  if (side === 'left') {
    leftSidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
    isLeftCollapsed.value = false;
  } else {
    rightSidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
    isRightCollapsed.value = false;
  }
  nextTick(resizeCanvas);
};

const toggleCollapse = (side) => {
  if (side === 'left') isLeftCollapsed.value = !isLeftCollapsed.value;
  else isRightCollapsed.value = !isRightCollapsed.value;
  nextTick(resizeCanvas);
};

// Sync with GameManager state
watch(() => world2d.state.system, (newSystem) => {
  if (newSystem && currentSystem.value !== newSystem) {
    currentSystem.value = newSystem;
    nextTick(resizeCanvas);
  }
});

// 同步编辑模式下的侧边栏显示
watch(() => editor.editMode, (newVal) => {
  if (newVal) {
    isLeftCollapsed.value = false;
    isRightCollapsed.value = false;
    showSidebars.value = true;
  }
  setTimeout(resizeCanvas, 0);
});

// Determine if we should show the background grid
const showGrid = computed(() => {
  if (isEditMode.value) return true;
  return true;
});

const canvasStyle = computed(() => {
  return { 
    opacity: 1,
    visibility: 'visible'
  };
});

// Canvas Resizing Logic
const resizeCanvas = () => {
  const canvas = document.getElementById('game-canvas');
  const container = canvas?.parentElement;
  if (!canvas || !container) return;

  const rect = container.getBoundingClientRect();
  const availableWidth = rect.width;
  const availableHeight = rect.height;
  
  if (availableWidth === 0 || availableHeight === 0) {
    requestAnimationFrame(resizeCanvas);
    return;
  }

  const targetWidth = 1920;
  const targetHeight = 1080;
  
  const scaleX = availableWidth / targetWidth;
  const scaleY = availableHeight / targetHeight;
  
  let scale = Math.min(scaleX, scaleY);
  scale = scale * 0.98;

  canvas.style.transform = `scale(${scale})`;
}

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'e') {
    e.preventDefault();
    toggleEditMode();
    logger.info('Edit mode toggled via shortcut');
  }
};

onMounted(async () => {
  // 1. Canvas Manager Setup
  window.addEventListener('resize', () => canvasMgr.resize());
  canvasMgr.resize();
  setTimeout(() => canvasMgr.resize(), 0);

  // 2. Event Listeners
  window.addEventListener('keydown', handleKeyDown);

  // 3. World2D Engine Init
  if (gameCanvas.value) {
    world2d.init(gameCanvas.value);
  }

  // 4. World Map Controller Start
  await worldMapCtrl.start();

  // 5. Editor Interaction Setup
  const editorInteraction = getSystem('editor-interaction')
  if (editorInteraction) {
    editorInteraction.onEntityRightClick = (entity, info) => editorCtrl.handleEntityRightClick(entity, info);
    editorInteraction.onEmptyRightClick = (info) => editorCtrl.handleEmptyRightClick(info);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', () => canvasMgr.resize());
  window.removeEventListener('keydown', handleKeyDown);
  worldMapCtrl.stop();
});

const toggleEditMode = () => {
  editor.toggleEditMode();
};

const toggleSidebars = () => {
  showSidebars.value = !showSidebars.value;
  nextTick(resizeCanvas);
};

const handleContextMenu = (e) => {
  if (isEditMode.value && currentSystem.value === 'world-map') {
    e.preventDefault();
  }
};

const onDrop = (e, side) => editorCtrl.handlePanelDrop(e, side);

</script>

<style scoped src="@styles/pages/GameUI.css"></style>
<style scoped src="@styles/editor/Sidebar.css"></style>
<style src="@styles/ui/ContextMenu.css"></style>
