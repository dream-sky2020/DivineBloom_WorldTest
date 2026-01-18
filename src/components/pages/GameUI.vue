<template>
  <div class="page-scroller">
    <!-- Viewport 1: Game Canvas (100vh) -->
    <div class="viewport-section" :class="{ 'is-resizing': !!resizingSidebar }">
      <!-- Left Sidebar -->
      <div 
        class="sidebar-container left-sidebar" 
        v-if="isEditMode"
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
          <div v-for="panelId in gameManager.editor.layout.left" :key="panelId" class="sidebar-panel-wrapper">
            <SidebarPanel :id="panelId" :title="getPanelTitle(panelId)" side="left">
              <component :is="getPanelComponent(panelId)" />
            </SidebarPanel>
          </div>
          <div v-if="gameManager.editor.layout.left.length === 0" class="sidebar-placeholder">
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
            ></canvas>

            <!-- Layer 1: Grid Overlay (Background/World Level) -->
            <div class="grid-overlay" v-show="showGrid"></div>

            <!-- Layer 2: System UI (Top Level) -->
            <div class="system-layer" :class="{ 'pass-through': currentSystem === 'world-map' }">
              <transition name="fade" mode="out-in">
                <component 
                  :is="activeSystemComponent" 
                  @change-system="handleSystemChange"
                />
              </transition>
            </div>
        </div>
      </div>

      <!-- Layout Spacer (Maintains flex flow and provides size reference) -->
      <div class="layout-spacer"></div>

      <!-- Right Sidebar -->
      <div 
        class="sidebar-container right-sidebar" 
        v-if="isEditMode"
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
          <div v-for="panelId in gameManager.editor.layout.right" :key="panelId" class="sidebar-panel-wrapper">
            <SidebarPanel :id="panelId" :title="getPanelTitle(panelId)" side="right">
              <component :is="getPanelComponent(panelId)" />
            </SidebarPanel>
          </div>
          <div v-if="gameManager.editor.layout.right.length === 0" class="sidebar-placeholder">
            <h3 style="padding: 16px; color: #94a3b8; font-size: 14px;">右侧无面板</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Developer Tools Overlay -->
    <DevTools v-if="showDevTools" @close="showDevTools = false" />

    <!-- Viewport 2: Developer Dashboard -->
    <div class="dev-panel-section">
      <div class="dev-container">
        <h2 class="dev-title" v-t="'dev.title'"></h2>
        
        <div class="dev-grid">
          <div class="dev-card">
            <h3 v-t="'dev.systemSwitcher'"></h3>
            <div class="btn-group">
              <button 
                :class="{ active: currentSystem === 'main-menu' }" 
                @click="handleSystemChange('main-menu')"
                v-t="'dev.systems.mainMenu'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'world-map' }" 
                @click="handleSystemChange('world-map')"
                v-t="'dev.systems.worldMap'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'battle' }" 
                @click="handleSystemChange('battle')"
                v-t="'dev.systems.battle'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'shop' }" 
                @click="handleSystemChange('shop')"
                v-t="'dev.systems.shop'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'encyclopedia' }" 
                @click="handleSystemChange('encyclopedia')"
                v-t="'dev.systems.encyclopedia'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'list-menu' }" 
                @click="handleSystemChange('list-menu')"
                v-t="'dev.systems.listMenu'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'dev-tools' }" 
                @click="handleSystemChange('dev-tools')"
                class="dev-tools-btn"
              >
                🛠️ 实验性工具
              </button>
            </div>
          </div>

          <div class="dev-card">
            <h3 v-t="'dev.debugActions'"></h3>
            <div class="btn-group">
               <!-- 全局按钮 -->
               <button @click="logState" v-t="'dev.actions.logState'"></button>
               
               <!-- 大地图专属操作 -->
               <template v-if="currentSystem === 'world-map'">
                 <button @click="toggleEditMode" :class="{ active: isEditMode }">
                   {{ isEditMode ? '关闭编辑器' : '开启编辑器' }}
                 </button>
                 <button @click="togglePause" :class="{ warn: gameManager.state.isPaused }">
                   {{ gameManager.state.isPaused ? '恢复运行' : '暂停运行' }}
                 </button>
               </template>

               <!-- 战斗专属操作 (预留) -->
               <template v-if="currentSystem === 'battle'">
                 <!-- 可以在这里添加：一键胜利、伤害测试等 -->
               </template>
            </div>
          </div>

          <div class="dev-card">
            <h3 v-t="'system.language'"></h3>
            <div class="btn-group">
              <button 
                :class="{ active: settingsStore.language === 'zh' }" 
                @click="setLanguage('zh')"
              >
                简体中文
              </button>
              <button 
                :class="{ active: settingsStore.language === 'zh-TW' }" 
                @click="setLanguage('zh-TW')"
              >
                繁體中文
              </button>
              <button 
                :class="{ active: settingsStore.language === 'en' }" 
                @click="setLanguage('en')"
              >
                English
              </button>
              <button 
                :class="{ active: settingsStore.language === 'ja' }" 
                @click="setLanguage('ja')"
              >
                日本語
              </button>
              <button 
                :class="{ active: settingsStore.language === 'ko' }" 
                @click="setLanguage('ko')"
              >
                한국어
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';
import { gameManager } from '@/game/ecs/GameManager';
import { createLogger } from '@/utils/logger';

import MainMenuSystem from '@/components/pages/systems/MainMenuSystem.vue';
import ListMenuSystem from '@/components/pages/systems/ListMenuSystem.vue';
import ShopSystem from '@/components/pages/systems/ShopSystem.vue';
import EncyclopediaSystem from '@/components/pages/systems/EncyclopediaSystem.vue';
import WorldMapSystem from '@/components/pages/systems/WorldMapSystem.vue';
import BattleSystem from '@/components/pages/systems/BattleSystem.vue';
import DialogueSystem from '@/components/pages/systems/DialogueSystem.vue';
import DevToolsSystem from '@/components/pages/systems/DevToolsSystem.vue';
import DevTools from '@/components/pages/DevTools.vue';
import SidebarPanel from '@/components/pages/editor/SidebarPanel.vue';
import SceneExplorer from '@/components/pages/editor/SceneExplorer.vue';
import EntityProperties from '@/components/pages/editor/EntityProperties.vue';

const logger = createLogger('GameUI');
const { locale } = useI18n();
const gameStore = useGameStore();
const settingsStore = gameStore.settings;
const currentSystem = ref(gameManager.state.system); // Initialize from GameManager
const gameCanvas = ref(null);
const showDevTools = ref(false);

// Sidebar Resize & Collapse State
const DEFAULT_SIDEBAR_WIDTH = 320;
const leftSidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);
const rightSidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);
const isLeftCollapsed = ref(true);
const isRightCollapsed = ref(false);
const resizingSidebar = ref(null); // 'left' or 'right'

// Reactive Edit Mode State
const isEditMode = computed(() => gameManager.editor.editMode);

const canvasContainerStyle = computed(() => {
  const left = isEditMode.value ? (isLeftCollapsed.value ? 40 : leftSidebarWidth.value) : 0;
  const right = isEditMode.value ? (isRightCollapsed.value ? 40 : rightSidebarWidth.value) : 0;
  
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
  
  // Update canvas size during resize
  nextTick(resizeCanvas);
};

const stopResizing = () => {
  resizingSidebar.value = null;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
  document.body.style.cursor = '';
  // Final sync
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
watch(() => gameManager.state.system, (newSystem) => {
  if (newSystem && currentSystem.value !== newSystem) {
    currentSystem.value = newSystem;
  }
});

// Watch for edit mode changes to resize canvas
watch(isEditMode, () => {
  // Wait for DOM updates
  setTimeout(resizeCanvas, 0);
});

const activeSystemComponent = computed(() => {
  switch (currentSystem.value) {
    case 'main-menu': return MainMenuSystem;
    case 'list-menu': return ListMenuSystem;
    case 'shop': return ShopSystem;
    case 'encyclopedia': return EncyclopediaSystem;
    case 'world-map': return WorldMapSystem;
    case 'battle': return BattleSystem;
    case 'dialogue': return DialogueSystem;
    case 'dev-tools': return DevToolsSystem;
    default: return MainMenuSystem;
  }
});

// Determine if we should show the background grid
const showGrid = computed(() => {
  // Hide grid for opaque full-screen systems to prevent "white line" artifacts at edges
  const opaqueSystems = [
    'main-menu', 
    'battle', 
    'encyclopedia', 
    'shop', // Has blur, but better to hide grid to be clean
    'list-menu', 
    'dev-tools' // Hide grid for dev tools
  ];
  return !opaqueSystems.includes(currentSystem.value);
});

// Control Canvas Opacity based on current system
const canvasStyle = computed(() => {
  // When in World Map, canvas is fully visible (Opacity 1)
  if (currentSystem.value === 'world-map') {
    return { opacity: 1, transition: 'opacity 0.3s ease' };
  }
  
  // For other systems (Menu, etc.), user requested 100% transparency (Opacity 0)
  // If you meant "100% visible", change this to 1.
  return { opacity: 0, transition: 'opacity 0.3s ease' };
});

const handleSystemChange = (systemId) => {
  logger.info('System change requested:', systemId);
  // Update local state (for immediate feedback if needed)
  currentSystem.value = systemId;
  // Also update GameManager state to keep them in sync
  gameManager.state.system = systemId;
};

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
  
  // Scale to fit within the viewport
  let scale = Math.min(scaleX, scaleY);
  scale = scale * 0.98; // Slightly more margin for the new layout

  canvas.style.transform = `scale(${scale})`;
}

// Keyboard shortcuts
const handleKeyDown = (e) => {
  // Ctrl+Shift+D: Toggle Dev Tools (switch to dev-tools system)
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    if (currentSystem.value === 'dev-tools') {
      // If already in dev-tools, go back to main menu
      currentSystem.value = 'main-menu';
      gameManager.state.system = 'main-menu';
    } else {
      // Switch to dev-tools
      currentSystem.value = 'dev-tools';
      gameManager.state.system = 'dev-tools';
    }
    logger.info('Dev Tools system toggled:', currentSystem.value);
  }
  // Keep the overlay dev tools for quick access
  if (e.ctrlKey && e.shiftKey && e.key === 'X') {
    e.preventDefault();
    showDevTools.value = !showDevTools.value;
  }
  // Escape: Close Dev Tools overlay
  if (e.key === 'Escape' && showDevTools.value) {
    showDevTools.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', handleKeyDown);
  resizeCanvas();
  setTimeout(resizeCanvas, 0);

  if (gameCanvas.value) {
    gameManager.init(gameCanvas.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('keydown', handleKeyDown);
});

// Debug Actions
const logState = () => {
  logger.info('Current System:', currentSystem.value);
};

const toggleEditMode = () => {
  gameManager.toggleEditMode();
};

const togglePause = () => {
  if (gameManager.state.isPaused) {
    gameManager.resume();
  } else {
    gameManager.pause();
  }
};

const setLanguage = (lang) => {
  settingsStore.setLanguage(lang);
};

// Panel Management Helpers
const getPanelTitle = (id) => {
  const titles = {
    'scene-explorer': '场景浏览器',
    'entity-properties': '属性编辑'
  };
  return titles[id] || id;
};

const getPanelComponent = (id) => {
  const components = {
    'scene-explorer': SceneExplorer,
    'entity-properties': EntityProperties
  };
  return components[id];
};

const onDrop = (e, targetSide) => {
  const panelId = e.dataTransfer.getData('panelId');
  const sourceSide = e.dataTransfer.getData('sourceSide');
  
  if (!panelId || sourceSide === targetSide) return;

  const layout = gameManager.editor.layout;
  
  // 从来源移除
  layout[sourceSide] = layout[sourceSide].filter(id => id !== panelId);
  
  // 添加到目标
  if (!layout[targetSide].includes(panelId)) {
    layout[targetSide].push(panelId);
  }
};
</script>

<style scoped src="@styles/components/pages/GameUI.css"></style>
