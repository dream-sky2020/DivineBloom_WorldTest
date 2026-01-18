<template>
  <div class="main-menu-overlay">
    <div class="content-container">
      <div class="title-section">
        <h1 class="main-title" v-t="'mainMenu.title'"></h1>
        <div class="sub-title-container">
          <h2 class="sub-title prefix" v-t="'mainMenu.subTitlePrefix'"></h2>
          <h2 class="sub-title main" v-t="'mainMenu.subTitleMain'"></h2>
        </div>
      </div>

      <div class="menu-options">
        <button 
          v-for="item in menuItems" 
          :key="item.id"
          class="menu-btn"
          :class="{ 'disabled': item.disabled }"
          @click="handleMenuClick(item)"
          @mouseenter="audioStore.playHover()"
        >
          <span class="btn-text" v-t="item.labelKey"></span>
          <span class="btn-subtext">{{ item.subLabel }}</span>
        </button>
      </div>
    </div>
    
    <div class="footer">
      <p v-t="'mainMenu.copyright'"></p>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted } from 'vue';
import { useGameStore } from '@/stores/game';
import { createLogger } from '@/utils/logger';

const logger = createLogger('MainMenu');
const emit = defineEmits(['change-system']);
const gameStore = useGameStore();
const audioStore = gameStore.audio;

// 进入主菜单播放 BGM
onMounted(() => {
  audioStore.playBgm('main_menu');
});

// 假设 GameUI 提供某种方式来切换系统，如果还没有，这里暂时只打印日志
// 在实际项目中，可能通过 emit 事件通知父组件，或者使用全局 store
// 这里暂时只用 console.log 模拟

const menuItems = [
  { id: 'start', labelKey: 'menu.start', subLabel: 'START', disabled: false, target: 'world-map' },
  { id: 'continue', labelKey: 'menu.continue', subLabel: 'CONTINUE', disabled: false, target: 'world-map' }, // 暂时也都去地图
  { id: 'encyclopedia', labelKey: 'panels.encyclopedia', subLabel: 'GALLERY', disabled: false, target: 'encyclopedia' },
  { id: 'settings', labelKey: 'menu.settings', subLabel: 'SETTINGS', disabled: false, target: null }
];

const handleMenuClick = (item) => {
  if (item.disabled) return;
  audioStore.playClick(); // 播放点击音效
  logger.info(`Menu selected: ${item.id}`);
  
  if (item.target) {
    emit('change-system', item.target);
  }
};
</script>

<style scoped src="@styles/pages/systems/MainMenuSystem.css"></style>
