<!-- src/interface/DevDashboard.vue -->
<template>
    <div class="dev-panel-section">
      <div class="dev-container">
        <div class="dev-header-inline">
          <h2 class="dev-title" v-t="'dev.title'"></h2>
        </div>
        
        <div class="dev-grid">
          <!-- 调试操作 -->
          <div class="dev-card">
            <h3 v-t="'dev.debugActions'"></h3>
            <div class="btn-group">
               <button @click="logState" v-t="'dev.actions.logState'"></button>
               <button @click="toggleEditMode" :class="{ active: editor.editMode }">
                 {{ editor.editMode ? '关闭编辑模式 (Ctrl+E)' : '开启编辑模式 (Ctrl+E)' }}
               </button>
               <button @click="$emit('toggle-sidebars')" :class="{ active: showSidebars }">
                 {{ showSidebars ? '隐藏侧边栏' : '显示侧边栏' }}
               </button>
               <button @click="editor.resetLayout('world-editor')">
                 🔄 重置编辑器布局
               </button>
               
               <template v-if="world2d.state.system === 'world-map'">
                <button @click="togglePause" :class="{ warn: world2d.state.isPaused }">
                  {{ world2d.state.isPaused ? '恢复运行' : '暂停运行' }}
                 </button>
                 <button 
                   @click="editor.exportCurrentScene()" 
                   :style="{ background: editor.editMode ? '#059669' : '#1e40af', color: 'white' }"
                 >
                   {{ editor.editMode ? '📥 导出场景布局' : '📸 捕捉运行快照' }}
                 </button>
               </template>
            </div>
          </div>
  
          <!-- 语言设置 -->
          <div class="dev-card">
            <h3 v-t="'system.language'"></h3>
            <div class="btn-group">
              <button v-for="l in languages" :key="l.id"
                :class="{ active: settingsStore.language === l.id }" 
                @click="settingsStore.setLanguage(l.id)"
              >
                {{ l.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { world2d } from '@world2d'; 
  import { editor } from '@/game/editor';
  import { useGameStore } from '@/stores/game';
  import { createLogger } from '@/utils/logger';
  
  const logger = createLogger('DevDashboard');
  const gameStore = useGameStore();
  const settingsStore = gameStore.settings;
  
  defineProps({
    showSidebars: Boolean
  });
  
  defineEmits(['toggle-sidebars']);
  
  const languages = [
    { id: 'zh', label: '简体中文' },
    { id: 'zh-TW', label: '繁體中文' },
    { id: 'en', label: 'English' },
    { id: 'ja', label: '日本語' },
    { id: 'ko', label: '한국어' }
  ];
  
  const logState = () => logger.info('Current System:', world2d.state.system);
  const toggleEditMode = () => editor.toggleEditMode();
  const togglePause = () => world2d.state.isPaused ? world2d.resume() : world2d.pause();
  </script>
  
  <style scoped>
  /* 这里放置原本在 GameUI.css 中关于 .dev-panel-section 及其内部的所有样式 */
  @import "@/styles/pages/GameUI.css"; 
  /* 注意：实际操作时，我会建议将相关的 CSS 从 GameUI.css 彻底搬迁到这个组件的 <style> 里 */
  </style>