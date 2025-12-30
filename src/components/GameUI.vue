<template>
  <div class="page-scroller">
    <!-- Viewport 1: Game Canvas (100vh) -->
    <div class="viewport-section">
      <div id="game-canvas">
          <!-- 背景层 (Global Background) -->
          <div class="background-layer">
              <h1 class="placeholder-text">Game Scene Placeholder</h1>
          </div>

          <!-- Dynamic System Component -->
          <transition name="fade" mode="out-in">
            <component :is="activeSystemComponent" />
          </transition>

          <!-- 网格辅助线 -->
          <div class="grid-overlay"></div>
      </div>
    </div>

    <!-- Viewport 2: Developer Dashboard -->
    <div class="dev-panel-section">
      <div class="dev-container">
        <h2 class="dev-title">Developer Operations Panel</h2>
        
        <div class="dev-grid">
          <div class="dev-card">
            <h3>System Switcher</h3>
            <div class="btn-group">
              <button 
                :class="{ active: currentSystem === 'list-menu' }" 
                @click="currentSystem = 'list-menu'"
              >
                Menu System (ListMenu)
              </button>
              <button 
                :class="{ active: currentSystem === 'shop' }" 
                @click="currentSystem = 'shop'"
              >
                Shop System
              </button>
              <button 
                :class="{ active: currentSystem === 'encyclopedia' }" 
                @click="currentSystem = 'encyclopedia'"
              >
                Encyclopedia System
              </button>
              <button disabled>Battle System (WIP)</button>
              <button 
                :class="{ active: currentSystem === 'world-map' }" 
                @click="currentSystem = 'world-map'"
              >
                World Map System
              </button>
            </div>
          </div>

          <div class="dev-card">
            <h3>Debug Actions</h3>
            <div class="btn-group">
               <button @click="addGold">Add 1000 Gold</button>
               <button @click="logState">Log State</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ListMenuSystem from './systems/ListMenuSystem.vue';
import ShopSystem from './systems/ShopSystem.vue';
import EncyclopediaSystem from './systems/EncyclopediaSystem.vue';
import WorldMapSystem from './systems/WorldMapSystem.vue';

const currentSystem = ref('world-map'); // 默认改为地图方便测试，或保持 'list-menu'

const activeSystemComponent = computed(() => {
  switch (currentSystem.value) {
    case 'list-menu': return ListMenuSystem;
    case 'shop': return ShopSystem;
    case 'encyclopedia': return EncyclopediaSystem;
    case 'world-map': return WorldMapSystem;
    default: return ListMenuSystem;
  }
});

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
