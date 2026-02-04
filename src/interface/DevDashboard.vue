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

            <!-- 侧边栏模式选择 - 使用与上方统一的按钮样式 -->
            <div class="dev-sub-section">
              <h4 class="sub-title">侧边栏布局模式</h4>
              <div class="btn-group half-split">
                <button 
                  @click="editor.sidebarMode = 'push'" 
                  :class="{ active: editor.sidebarMode === 'push' }"
                >
                  <span class="icon">📐</span> 挤占空间
                </button>
                <button 
                  @click="editor.sidebarMode = 'overlay'" 
                  :class="{ active: editor.sidebarMode === 'overlay' }"
                >
                  <span class="icon">🖼️</span> 覆盖画面
                </button>
              </div>
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
  
  <script setup lang="ts">
import { world2d } from '@world2d'; 
import { editor } from '@/game/editor';
import { useGameStore } from '@/stores/game';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DevDashboard');
const gameStore = useGameStore();
const settingsStore = gameStore.settings;

defineProps<{
  showSidebars: boolean
}>();

defineEmits<{
  (e: 'toggle-sidebars'): void
}>();

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
  @import "@/styles/pages/GameUI.css"; 
  
  .dev-sub-section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .sub-title {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  /* 统一按钮样式，使其与 GameUI.css 中的按钮一致 */
  .btn-group.half-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .btn-group button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    background: #1e293b;
    border: 1px solid #334155;
    color: #94a3b8;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-group button:hover {
    background: #334155;
    color: white;
  }

  .btn-group button.active {
    background: #3b82f6 !important;
    color: white !important;
    border-color: #60a5fa !important;
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
  }

  .icon {
    font-size: 14px;
  }
  </style>