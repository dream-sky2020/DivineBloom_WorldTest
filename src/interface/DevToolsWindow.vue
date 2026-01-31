<template>
  <div class="dev-tools-window">
    <div class="dev-header">
      <h2 v-t="'dev.title'"></h2>
      <div class="connection-status" :class="{ connected: isConnected }">
        {{ isConnected ? '● 已连接游戏' : '○ 等待游戏连接...' }}
      </div>
    </div>
    
    <div class="dev-grid">
      <!-- 调试操作 -->
      <div class="dev-card">
        <h3 v-t="'dev.debugActions'"></h3>
        <div class="btn-group">
           <button @click="sendCommand('logState')" v-t="'dev.actions.logState'"></button>
           <button @click="sendCommand('toggleEditMode')" :class="{ active: gameState.isEditMode }">
             {{ gameState.isEditMode ? '关闭编辑模式' : '开启编辑模式' }}
           </button>
           <button @click="sendCommand('toggleSidebars')" :class="{ active: gameState.showSidebars }">
             {{ gameState.showSidebars ? '隐藏侧边栏' : '显示侧边栏' }}
           </button>
           <button @click="sendCommand('resetLayout')">
             🔄 重置编辑器布局
           </button>
           
           <!-- 大地图专属操作 -->
           <template v-if="gameState.currentSystem === 'world-map'">
            <button @click="sendCommand('togglePause')" :class="{ warn: gameState.isPaused }">
              {{ gameState.isPaused ? '恢复运行' : '暂停运行' }}
             </button>
             <button @click="sendCommand('exportScene')" style="background: #1e40af; color: white;">
               {{ gameState.isEditMode ? '📥 导出场景布局' : '📸 捕捉运行快照' }}
             </button>
           </template>
        </div>
      </div>

      <!-- 语言设置 -->
      <div class="dev-card">
        <h3 v-t="'system.language'"></h3>
        <div class="btn-group">
          <button 
            v-for="lang in ['zh', 'zh-TW', 'en', 'ja', 'ko']" 
            :key="lang"
            :class="{ active: gameState.language === lang }" 
            @click="sendCommand('setLanguage', lang)"
          >
            {{ getLangLabel(lang) }}
          </button>
        </div>
      </div>

      <!-- 状态监控 -->
      <div class="dev-card status-card">
        <h3>实时状态</h3>
        <div class="status-info">
          <div class="status-item">
            <span>当前系统:</span>
            <span class="value">{{ gameState.currentSystem || '未知' }}</span>
          </div>
          <div class="status-item">
            <span>玩家位置:</span>
            <span class="value" v-if="gameState.playerPos">X: {{ Math.round(gameState.playerPos.x) }}, Y: {{ Math.round(gameState.playerPos.y) }}</span>
            <span class="value" v-else>未知</span>
          </div>
          <div class="status-item">
            <span>追逐中敌人:</span>
            <span class="value" :class="{ danger: gameState.chasingCount > 0 }">{{ gameState.chasingCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { WindowBridge } from '@/utils/WindowBridge';

const { t, locale } = useI18n();
const isConnected = ref(false);
const lastHeartbeat = ref(0);

const gameState = reactive({
  isEditMode: false,
  showSidebars: false,
  isPaused: false,
  language: 'zh',
  currentSystem: '',
  playerPos: null,
  chasingCount: 0
});

let bridge = null;

const getLangLabel = (lang) => {
  const labels = {
    'zh': '简体中文',
    'zh-TW': '繁體中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어'
  };
  return labels[lang] || lang;
};

const sendCommand = (type, payload) => {
  if (bridge) {
    bridge.send('COMMAND', { type, payload }, 'MAIN_WINDOW');
  }
};

const handleMessage = ({ sourceId, type, payload }) => {
  if (type === 'STATE_UPDATE') {
    isConnected.value = true;
    lastHeartbeat.value = Date.now();
    Object.assign(gameState, payload);
    
    // 同步本地语言环境
    if (payload.language && locale.value !== payload.language) {
      locale.value = payload.language;
    }
  }
};

// 心跳检测，如果 3 秒没收到消息则认为断开
let heartbeatTimer = null;
const checkConnection = () => {
  if (Date.now() - lastHeartbeat.value > 3000) {
    isConnected.value = false;
  }
};

onMounted(() => {
  bridge = new WindowBridge('DEV_TOOLS', handleMessage);
  // 请求初始状态
  bridge.send('REQUEST_STATE', null, 'MAIN_WINDOW');
  heartbeatTimer = setInterval(checkConnection, 1000);
});

onUnmounted(() => {
  if (bridge) bridge.close();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
});
</script>

<style scoped>
.dev-tools-window {
  padding: 20px;
  background-color: #0f172a;
  color: #f1f5f9;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 16px;
}

.connection-status {
  font-size: 14px;
  color: #94a3b8;
}

.connection-status.connected {
  color: #10b981;
}

.dev-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.dev-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #334155;
}

.dev-card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #94a3b8;
  border-bottom: 1px solid #334155;
  padding-bottom: 8px;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

button {
  background: #334155;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

button:hover {
  background: #475569;
}

button.active {
  background: #2563eb;
}

button.warn {
  background: #991b1b;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.status-item .value {
  color: #60a5fa;
  font-family: 'JetBrains Mono', monospace;
}

.status-item .value.danger {
  color: #ef4444;
  font-weight: bold;
}
</style>
