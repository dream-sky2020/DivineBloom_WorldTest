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
          <div v-for="group in gameManager.editor.layout.left" :key="group.id" class="sidebar-panel-wrapper">
            <TabbedPanelGroup :group="group" side="left" />
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
              @contextmenu="handleContextMenu"
            ></canvas>

            <!-- Layer 1: Grid Overlay (Background/World Level) -->
            <div class="grid-overlay" v-show="showGrid"></div>

            <!-- Layer 2: System UI (Top Level) -->
            <div class="system-layer" :class="{ 'pass-through': currentSystem === 'world-map' }">
              <transition name="fade">
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
          <div v-for="group in gameManager.editor.layout.right" :key="group.id" class="sidebar-panel-wrapper">
            <TabbedPanelGroup :group="group" side="right" />
          </div>
          <div v-if="gameManager.editor.layout.right.length === 0" class="sidebar-placeholder">
            <h3 style="padding: 16px; color: #94a3b8; font-size: 14px;">右侧无面板</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Developer Tools Overlay -->
    <DevTools v-if="showDevTools" @close="showDevTools = false" />

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
                 <button 
                   @click="exportScene" 
                   :style="{ 
                     background: isEditMode ? '#059669' : '#1e40af', 
                     color: 'white' 
                   }"
                 >
                   {{ isEditMode ? '📥 导出场景布局' : '📸 捕捉运行快照' }}
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
import { ScenarioLoader } from '@/game/ecs/ScenarioLoader';
import { createLogger } from '@/utils/logger';

import MainMenuSystem from '@/interface/pages/systems/MainMenuSystem.vue';
import ListMenuSystem from '@/interface/pages/systems/ListMenuSystem.vue';
import ShopSystem from '@/interface/pages/systems/ShopSystem.vue';
import EncyclopediaSystem from '@/interface/pages/systems/EncyclopediaSystem.vue';
import WorldMapSystem from '@/interface/pages/systems/WorldMapSystem.vue';
import BattleSystem from '@/interface/pages/systems/BattleSystem.vue';
import DialogueSystem from '@/interface/pages/systems/DialogueSystem.vue';
import DevToolsSystem from '@/interface/pages/systems/DevToolsSystem.vue';
import DevTools from '@/interface/pages/DevTools.vue';
import TabbedPanelGroup from '@/interface/pages/editor/TabbedPanelGroup.vue';
import { getPanelTitle, getPanelComponent } from '@/game/interface/editor/PanelRegistry';

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

// Provide context menu to children
import { provide } from 'vue';
import { world } from '@/game/ecs/world';
import { entityTemplateRegistry } from '@/game/ecs/entities/internal/EntityTemplateRegistry';
import { EditorInteractionSystem } from '@/game/ecs/systems/editor/EditorInteractionSystem';
import { toRaw } from 'vue';
provide('editorContextMenu', { openContextMenu, closeContextMenu });

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
const isLeftCollapsed = ref(false);
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
watch(isEditMode, (newVal) => {
  if (newVal) {
    isLeftCollapsed.value = false;
    isRightCollapsed.value = false;
  }
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
  // When in World Map, canvas is fully visible
  if (currentSystem.value === 'world-map') {
    return { 
      opacity: 1,
      visibility: 'visible'
    };
  }
  
  // For other systems (Menu, etc.), hide canvas to save performance
  return { 
    opacity: 0,
    visibility: 'hidden'
  };
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

  // 设置右键点击回调（统一在 EditorInteractionSystem 中处理）
  EditorInteractionSystem.onEntityRightClick = handleEntityRightClick;
  EditorInteractionSystem.onEmptyRightClick = handleEmptyRightClick;
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

const exportScene = () => {
  const mapId = gameManager.currentScene.value?.mapData?.id || 'unknown';
  const bundle = ScenarioLoader.exportScene(gameManager.engine, mapId);
  
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${mapId}_scene_export_${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  logger.info('Scene data exported:', mapId);
};

const setLanguage = (lang) => {
  settingsStore.setLanguage(lang);
};

// 处理 canvas 右键菜单事件
const handleContextMenu = (e) => {
  // 在编辑模式下，禁用浏览器默认右键菜单
  if (isEditMode.value && currentSystem.value === 'world-map') {
    e.preventDefault();
  }
  // 非编辑模式或非世界地图系统，允许默认行为
};

// 处理空白地面右键点击
const handleEmptyRightClick = (mouseInfo) => {
  const worldX = Math.round(mouseInfo.worldX);
  const worldY = Math.round(mouseInfo.worldY);

  // 获取所有实体模板
  const templates = entityTemplateRegistry.getAll();

  // 构建右键菜单
  const menuItems = [
    {
      icon: '📍',
      label: `位置: X=${worldX}, Y=${worldY}`,
      disabled: true,
      class: 'menu-header'
    },
    {
      icon: '➕',
      label: '在此位置创建实体',
      disabled: true,
      class: 'menu-divider'
    }
  ];

  // 添加实体模板选项（分组）
  const gameplayTemplates = templates.filter(t => t.category === 'gameplay');
  const envTemplates = templates.filter(t => t.category === 'environment');

  if (gameplayTemplates.length > 0) {
    menuItems.push({
      icon: '🎮',
      label: '游戏玩法',
      disabled: true,
      class: 'menu-category'
    });
    gameplayTemplates.forEach(template => {
      menuItems.push({
        icon: template.icon || '📦',
        label: template.name,
        action: () => createEntityAtPosition(template.id, worldX, worldY)
      });
    });
  }

  if (envTemplates.length > 0) {
    menuItems.push({
      icon: '🌲',
      label: '环境装饰',
      disabled: true,
      class: 'menu-category'
    });
    envTemplates.forEach(template => {
      menuItems.push({
        icon: template.icon || '📦',
        label: template.name,
        action: () => createEntityAtPosition(template.id, worldX, worldY)
      });
    });
  }

  // 显示菜单（使用屏幕坐标）
  const fakeEvent = {
    preventDefault: () => {},
    clientX: mouseInfo.screenX,
    clientY: mouseInfo.screenY
  };
  
  openContextMenu(fakeEvent, menuItems);
};

// 在指定位置创建实体
const createEntityAtPosition = (templateId, x, y) => {
  try {
    // 通过命令系统创建实体
    const globalEntity = world.with('commands').first;
    if (globalEntity) {
      globalEntity.commands.queue.push({
        type: 'CREATE_ENTITY',
        payload: {
          templateId: templateId,
          position: { x, y }
        }
      });
      logger.info(`Entity creation requested at (${x}, ${y})`);
    } else {
      // 降级方案：直接创建
      const entity = entityTemplateRegistry.createEntity(templateId, null, { x, y });
      if (entity) {
        logger.info(`Entity created at (${x}, ${y})`, entity);
        gameManager.editor.selectedEntity = entity;
      }
    }
  } catch (error) {
    logger.error('Failed to create entity:', error);
    alert(`创建实体失败: ${error.message}`);
  }
};

// 处理实体右键点击
const handleEntityRightClick = (entity, mouseInfo) => {
  if (!entity) return;

  // 构建实体信息
  const entityName = entity.name || '未命名实体';
  const entityType = entity.type || '未知类型';
  const posX = entity.position ? Math.round(entity.position.x) : 'N/A';
  const posY = entity.position ? Math.round(entity.position.y) : 'N/A';
  const canDelete = entity.inspector?.allowDelete !== false;

  // 构建右键菜单
  const menuItems = [
    {
      icon: '📋',
      label: entityName,
      disabled: true,
      class: 'menu-header'
    },
    {
      icon: '🏷️',
      label: `类型: ${entityType}`,
      disabled: true,
      class: 'menu-info'
    },
    {
      icon: '📍',
      label: `位置: X=${posX}, Y=${posY}`,
      disabled: true,
      class: 'menu-info'
    }
  ];

  // 添加操作选项
  if (canDelete) {
    menuItems.push({
      icon: '🗑️',
      label: '删除实体',
      class: 'danger',
      action: () => deleteEntity(entity)
    });
  } else {
    menuItems.push({
      icon: '🔒',
      label: '此实体禁止删除',
      disabled: true,
      class: 'menu-info'
    });
  }

  // 显示菜单（使用屏幕坐标）
  const fakeEvent = {
    preventDefault: () => {},
    clientX: mouseInfo.screenX,
    clientY: mouseInfo.screenY
  };
  
  openContextMenu(fakeEvent, menuItems);
};

// 删除实体
const deleteEntity = (entity) => {
  if (!entity) return;
  
  if (entity.inspector?.allowDelete === false) {
    alert('该实体禁止删除');
    return;
  }
  
  const name = entity.name || entity.type || '未命名实体';
  if (confirm(`确定要删除实体 "${name}" 吗？`)) {
    // 使用 toRaw 获取原始实体对象
    const rawEntity = toRaw(entity);
    
    // 发送删除命令
    const globalEntity = world.with('commands').first;
    if (globalEntity) {
      globalEntity.commands.queue.push({
        type: 'DELETE_ENTITY',
        payload: { entity: rawEntity }
      });
      logger.info('Entity deletion requested:', name);
    } else {
      world.remove(rawEntity);
      logger.info('Entity deleted directly:', name);
    }
    
    // 清除选中状态
    gameManager.editor.selectedEntity = null;
  }
};

// Panel Management Helpers
const onDrop = (e, targetSide) => {
  const panelId = e.dataTransfer.getData('panelId');
  const sourceGroupId = e.dataTransfer.getData('sourceGroupId');
  const sourceSide = e.dataTransfer.getData('sourceSide');
  
  if (!panelId) return;

  const layout = gameManager.editor.layout;

  // 1. 如果源和目标侧边栏不同，或者是在侧边栏空白处释放
  // 我们创建一个新组并把面板移过去
  
  // 从原组移除
  if (sourceGroupId) {
    const sourceGroup = layout[sourceSide].find(g => g.id === sourceGroupId);
    if (sourceGroup) {
      sourceGroup.panels = sourceGroup.panels.filter(id => id !== panelId);
      if (sourceGroup.activeId === panelId) {
        sourceGroup.activeId = sourceGroup.panels[0];
      }
      if (sourceGroup.panels.length === 0) {
        layout[sourceSide] = layout[sourceSide].filter(g => g.id !== sourceGroupId);
      }
    }
  }

  // 2. 在目标侧边栏创建新组
  const newGroup = {
    id: `group-${Date.now()}`,
    activeId: panelId,
    panels: [panelId]
  };
  layout[targetSide].push(newGroup);
};
</script>

<style scoped src="@styles/pages/GameUI.css"></style>
<style scoped src="@styles/editor/Sidebar.css"></style>
<style src="@styles/ui/ContextMenu.css"></style>
