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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import MainMenuSystem from '@/components/pages/systems/MainMenuSystem.vue';
import ListMenuSystem from '@/components/pages/systems/ListMenuSystem.vue';
import ListMenuPreviewsSystem from '@/components/pages/systems/ListMenuPreviewsSystem.vue';
import ShopSystem from '@/components/pages/systems/ShopSystem.vue';
import EncyclopediaSystem from '@/components/pages/systems/EncyclopediaSystem.vue';
import WorldMapSystem from '@/components/pages/systems/WorldMapSystem.vue';
import BattleSystem from '@/components/pages/systems/BattleSystem.vue';
import DialogueSystem from '@/components/pages/systems/DialogueSystem.vue';

const { locale } = useI18n();
const settingsStore = useSettingsStore();
const currentSystem = ref('main-menu'); // Default to Main Menu

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
  settingsStore.setLanguage(lang);
};
</script>

<style scoped src="@styles/components/pages/GameUI.css"></style>
