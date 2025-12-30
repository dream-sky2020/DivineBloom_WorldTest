<template>
  <div id="game-canvas">
      <!-- 背景层 -->
      <div class="background-layer">
          <h1 class="placeholder-text">Game Scene Placeholder</h1>
      </div>

      <!-- JRPG 菜单系统 -->
      <div class="menu-overlay">
          <div class="menu-container">
              
              <!-- 左侧：导航与队伍状态 -->
              <div class="left-panel">
                  
                  <!-- 金币/时间 -->
                  <div class="info-box">
                      <div class="info-row border-bottom">
                          <span class="info-label">Gold</span>
                          <span class="info-value gold-text">54,300 G</span>
                      </div>
                      <div class="info-row">
                          <span class="info-label">Time</span>
                          <span class="info-value">12:45:03</span>
                      </div>
                  </div>

                  <!-- 主导航菜单 -->
                  <div class="nav-menu">
                      <div 
                        v-for="item in menuItems"
                        :key="item.id"
                        class="nav-item"
                        :class="{ active: currentPanel === item.id }"
                        @click="currentPanel = item.id"
                      >
                          <span>{{ item.label }}</span>
                          <span v-if="currentPanel === item.id" class="arrow">▶</span>
                      </div>
                  </div>

              </div>

              <!-- 右侧：动态内容区域 -->
              <div class="right-panel">
                <component :is="activeComponent" />
              </div>
          </div>
      </div>

      <!-- 网格辅助线 -->
      <div class="grid-overlay"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import InventoryPanel from './InventoryPanel.vue';
import CharacterPanel from './CharacterPanel.vue';
import EquipmentPanel from './EquipmentPanel.vue';
import SkillsPanel from './SkillsPanel.vue';
import ThankPanel from './ThankPanel.vue';
import SystemPanel from './SystemPanel.vue';
import SaveLoadPanel from './SaveLoadPanel.vue';

const menuItems = [
  { id: 'items', label: 'ITEMS', component: InventoryPanel },
  { id: 'equip', label: 'EQUIP', component: EquipmentPanel },
  { id: 'skills', label: 'SKILLS', component: SkillsPanel },
  { id: 'status', label: 'STATUS', component: CharacterPanel },
  { id: 'thank', label: 'THANK', component: ThankPanel },
  { id: 'data', label: 'DATA', component: SaveLoadPanel },
  { id: 'system', label: 'SYSTEM', component: SystemPanel },
];

const currentPanel = ref('items');

const activeComponent = computed(() => {
  const item = menuItems.find(i => i.id === currentPanel.value);
  return item ? item.component : null;
});

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
  
  let scale = Math.min(scaleX, scaleY);
  scale = scale * 0.95; // 保持边距

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
</script>

<style scoped>
/* Reset & Base */
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

/* Background */
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

/* Menu Overlay */
.menu-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  pointer-events: auto;
}

.menu-container {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 1.5rem;
}

/* Left Panel */
.left-panel {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-box, .nav-menu {
  background-color: rgba(15, 23, 42, 0.9); /* slate-900/90 */
  border: 2px solid #475569; /* slate-600 */
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.info-box {
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.border-bottom {
  border-bottom: 1px solid var(--slate-700);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.info-label {
  color: var(--slate-400);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.info-value {
  font-family: monospace;
}

.gold-text {
  color: var(--yellow-400);
  font-size: 1.25rem;
}

/* Nav Menu */
.nav-menu {
  flex: 1;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 1rem 1.5rem;
  color: var(--slate-400);
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.2s;
  font-size: 1.125rem;
}

.nav-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: linear-gradient(to right, var(--blue-900), transparent);
  border-left-color: var(--blue-400);
  color: var(--blue-100);
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow {
  color: var(--blue-400);
}

/* Right Panel */
.right-panel {
  flex: 1;
  /* overflow: hidden; */ /* Removing overflow hidden to let children handle scrolling if needed, though they usually have fixed height containers */
  display: flex;
  flex-direction: column;
}

/* Grid Overlay */
.grid-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  opacity: 0.2;
  background-image: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 50px 50px;
}
</style>
