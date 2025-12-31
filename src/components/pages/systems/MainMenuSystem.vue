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
import { useAudioStore } from '@/stores/audio';

const emit = defineEmits(['change-system']);
const audioStore = useAudioStore();

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
  console.log(`Menu selected: ${item.id}`);
  
  if (item.target) {
    emit('change-system', item.target);
  }
};
</script>

<style scoped>
.main-menu-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a0b2e 0%, #000000 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 100;
  font-family: var(--font-main, sans-serif);
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
  width: 100%;
  max-width: 600px;
}

.title-section {
  text-align: center;
  animation: fadeInDown 1s ease-out;
}

.main-title {
  font-size: 5rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(to bottom, #ff0055, #990033);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 30px rgba(255, 0, 85, 0.5);
  letter-spacing: 0.2em;
}

.sub-title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.sub-title {
  font-weight: 300;
  margin: 0;
  color: #ccc;
  letter-spacing: 0.5em;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.sub-title.prefix {
  font-size: 1.5rem;
  opacity: 0.8;
}

.sub-title.main {
  font-size: 2.5rem;
  letter-spacing: 0.8em;
  margin-left: 0.8em; /* Offset for letter-spacing to visual center */
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding: 0 2rem;
  animation: fadeInUp 1s ease-out 0.3s backwards;
}

.menu-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.menu-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: #ff0055;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 0, 85, 0.5);
  transform: translateX(10px);
  box-shadow: 0 0 20px rgba(255, 0, 85, 0.2);
}

.menu-btn:hover::before {
  transform: scaleY(1);
}

.btn-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.btn-subtext {
  font-size: 0.9rem;
  color: #888;
  letter-spacing: 0.1em;
}

.menu-btn:active {
  transform: scale(0.98) translateX(10px);
}

.footer {
  position: absolute;
  bottom: 2rem;
  color: #555;
  font-size: 0.8rem;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

