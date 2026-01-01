<template>
  <div class="page-scroller">
    <!-- Viewport 1: Game Canvas (100vh) -->
    <div class="viewport-section">
      <div id="game-canvas">
          <!-- 背景层 (Global Background) -->
          <div class="background-layer">
              <h1 class="placeholder-text" v-t="'common.unknown'"></h1>
          </div>

          <!-- Dynamic System Component -->
          <transition name="fade" mode="out-in">
            <component 
              :is="activeSystemComponent" 
              @change-system="handleSystemChange"
            />
          </transition>

          <!-- 网格辅助线 -->
          <div class="grid-overlay"></div>
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
                :class="{ active: $i18n.locale === 'zh' }" 
                @click="setLanguage('zh')"
              >
                简体中文
              </button>
              <button 
                :class="{ active: $i18n.locale === 'zh-TW' }" 
                @click="setLanguage('zh-TW')"
              >
                繁體中文
              </button>
              <button 
                :class="{ active: $i18n.locale === 'en' }" 
                @click="setLanguage('en')"
              >
                English
              </button>
              <button 
                :class="{ active: $i18n.locale === 'ja' }" 
                @click="setLanguage('ja')"
              >
                日本語
              </button>
              <button 
                :class="{ active: $i18n.locale === 'ko' }" 
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import MainMenuSystem from '@/components/pages/systems/MainMenuSystem.vue';
import ListMenuSystem from '@/components/pages/systems/ListMenuSystem.vue';
import ShopSystem from '@/components/pages/systems/ShopSystem.vue';
import EncyclopediaSystem from '@/components/pages/systems/EncyclopediaSystem.vue';
import WorldMapSystem from '@/components/pages/systems/WorldMapSystem.vue';
import BattleSystem from '@/components/pages/systems/BattleSystem.vue';

const { locale } = useI18n();
const currentSystem = ref('main-menu'); // Default to Main Menu

const activeSystemComponent = computed(() => {
  switch (currentSystem.value) {
    case 'main-menu': return MainMenuSystem;
    case 'list-menu': return ListMenuSystem;
    case 'shop': return ShopSystem;
    case 'encyclopedia': return EncyclopediaSystem;
    case 'world-map': return WorldMapSystem;
    case 'battle': return BattleSystem;
    default: return MainMenuSystem;
  }
});

const handleSystemChange = (systemId) => {
  console.log('System change requested:', systemId);
  currentSystem.value = systemId;
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

onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  setTimeout(resizeCanvas, 0);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
});

// Debug Actions
const addGold = () => {
  console.log('Adding gold...');
  // In real implementation, call store.addGold(1000)
};

const logState = () => {
  console.log('Current System:', currentSystem.value);
};

const setLanguage = (lang) => {
  locale.value = lang;
};
</script>

<style scoped>
/* Page Scroller Wrapper */
.page-scroller {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #0f172a; /* matches body bg */
  scroll-behavior: smooth;
}

/* Viewport 1 */
.viewport-section {
  height: 100vh; /* Takes full window height */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* Ensure this section is the "stop" for scrolling initially */
}

#game-canvas {
  position: relative;
  width: 1920px;
  height: 1080px;
  background-color: var(--slate-900);
  overflow: hidden;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
  transform-origin: center center;
  flex-shrink: 0;
  font-family: var(--font-main);
  color: #fff;
}

/* Background Layer (reused) */
.background-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, var(--slate-800), var(--slate-900));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  z-index: 0;
}
.placeholder-text {
  font-size: 4rem;
  font-weight: 700;
  color: var(--slate-700);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Grid Overlay (reused) */
.grid-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  opacity: 0.2;
  background-image: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Viewport 2: Dev Panel */
.dev-panel-section {
  min-height: 100vh; /* Another full screen height */
  background-color: #1e293b;
  border-top: 4px solid #334155;
  padding: 4rem;
  color: white;
}

.dev-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dev-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  border-bottom: 1px solid #475569;
  padding-bottom: 1rem;
}

.dev-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dev-card {
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 2rem;
}

.dev-card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-group button {
  padding: 1rem;
  background-color: #1e293b;
  border: 1px solid #475569;
  color: #e2e8f0;
  cursor: pointer;
  border-radius: 0.25rem;
  text-align: left;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-group button:hover:not(:disabled) {
  background-color: #334155;
  border-color: #64748b;
}

.btn-group button.active {
  background-color: #2563eb; /* blue-600 */
  border-color: #3b82f6;
  color: white;
}

.btn-group button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
