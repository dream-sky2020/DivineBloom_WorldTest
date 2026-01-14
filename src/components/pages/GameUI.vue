<template>
  <div class="page-scroller">
    <!-- Viewport 1: Game Canvas (100vh) -->
    <div class="viewport-section">
      <div id="game-canvas">
          <!-- Global Game Canvas -->
          <canvas 
            ref="gameCanvas" 
            class="global-canvas"
            :style="canvasStyle"
          ></canvas>

          <!-- Layer 1: Grid Overlay (Background/World Level) -->
          <!-- Only show grid when we are in a system that needs it (like World Map) or isn't opaque -->
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
                @click="currentSystem = 'main-menu'"
                v-t="'dev.systems.mainMenu'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'list-menu' }" 
                @click="currentSystem = 'list-menu'"
                v-t="'dev.systems.listMenu'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'list-menu-previews' }" 
                @click="currentSystem = 'list-menu-previews'"
                v-t="'dev.systems.listMenuPreview'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'shop' }" 
                @click="currentSystem = 'shop'"
                v-t="'dev.systems.shop'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'encyclopedia' }" 
                @click="currentSystem = 'encyclopedia'"
                v-t="'dev.systems.encyclopedia'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'battle' }" 
                @click="currentSystem = 'battle'"
                v-t="'dev.systems.battle'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'world-map' }" 
                @click="currentSystem = 'world-map'"
                v-t="'dev.systems.worldMap'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'dialogue' }" 
                @click="currentSystem = 'dialogue'"
                v-t="'dev.systems.dialogue'"
              >
              </button>
              <button 
                :class="{ active: currentSystem === 'dev-tools' }" 
                @click="currentSystem = 'dev-tools'"
                class="dev-tools-btn"
              >
                🛠️ 开发工具
              </button>
            </div>
          </div>

          <div class="dev-card">
            <h3 v-t="'dev.debugActions'"></h3>
            <div class="btn-group">
               <button @click="addGold" v-t="'dev.actions.addGold'"></button>
               <button @click="logState" v-t="'dev.actions.logState'"></button>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';
import { gameManager } from '@/game/GameManager';
import { createLogger } from '@/utils/logger';

import MainMenuSystem from '@/components/pages/systems/MainMenuSystem.vue';
import ListMenuSystem from '@/components/pages/systems/ListMenuSystem.vue';
import ListMenuPreviewsSystem from '@/components/pages/systems/ListMenuPreviewsSystem.vue';
import ShopSystem from '@/components/pages/systems/ShopSystem.vue';
import EncyclopediaSystem from '@/components/pages/systems/EncyclopediaSystem.vue';
import WorldMapSystem from '@/components/pages/systems/WorldMapSystem.vue';
import BattleSystem from '@/components/pages/systems/BattleSystem.vue';
import DialogueSystem from '@/components/pages/systems/DialogueSystem.vue';
import DevToolsSystem from '@/components/pages/systems/DevToolsSystem.vue';
import DevTools from '@/components/pages/DevTools.vue';

const logger = createLogger('GameUI');
const { locale } = useI18n();
const gameStore = useGameStore();
const settingsStore = gameStore.settings;
const currentSystem = ref(gameManager.state.system); // Initialize from GameManager
const gameCanvas = ref(null);
const showDevTools = ref(false);

// Sync with GameManager state
watch(() => gameManager.state.system, (newSystem) => {
  if (newSystem && currentSystem.value !== newSystem) {
    currentSystem.value = newSystem;
  }
});

const activeSystemComponent = computed(() => {
  switch (currentSystem.value) {
    case 'main-menu': return MainMenuSystem;
    case 'list-menu': return ListMenuSystem;
    case 'list-menu-previews': return ListMenuPreviewsSystem;
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
    'list-menu-previews',
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
  if (!canvas) return;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  if (windowWidth === 0 || windowHeight === 0) {
      requestAnimationFrame(resizeCanvas);
      return;
  }

  const targetWidth = 1920;
  const targetHeight = 1080;
  
  const scaleX = windowWidth / targetWidth;
  const scaleY = windowHeight / targetHeight;
  
  // Scale to fit within the viewport
  let scale = Math.min(scaleX, scaleY);
  scale = scale * 0.95; // Margin

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
const addGold = () => {
  logger.info('Adding gold...');
  // In real implementation, call store.addGold(1000)
};

const logState = () => {
  logger.info('Current System:', currentSystem.value);
};

const setLanguage = (lang) => {
  settingsStore.setLanguage(lang);
};
</script>

<style scoped src="@styles/components/pages/GameUI.css"></style>
