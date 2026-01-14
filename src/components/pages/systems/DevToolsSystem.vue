<template>
  <div class="dev-tools-system">
    <div class="dev-tools-container">
      <div class="dev-tools-header">
        <h1>🛠️ 开发工具</h1>
        <button @click="$emit('change-system', 'main-menu')" class="btn-back">
          返回主菜单
        </button>
      </div>

      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="currentTab = tab.id"
          :class="{ active: currentTab === tab.id }"
          class="tab-button"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <DataValidator v-if="currentTab === 'validator'" />
        <div v-else-if="currentTab === 'info'" class="info-panel">
          <h2>📝 使用说明</h2>
          <p>这是游戏开发工具集，用于验证和调试游戏数据。</p>
          
          <h3>数据验证器</h3>
          <ul>
            <li>点击"开始验证"按钮验证所有游戏数据</li>
            <li>自动检查技能和状态数据是否符合 Schema 定义</li>
            <li>显示详细的错误信息和修复建议</li>
          </ul>

          <h3>快捷键</h3>
          <ul>
            <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>: 快速切换到开发工具</li>
            <li>通过下方 Developer Dashboard 的按钮也可以打开</li>
          </ul>

          <h3>其他功能</h3>
          <ul>
            <li>使用 Developer Dashboard 切换不同的游戏界面</li>
            <li>测试各个系统的功能和数据</li>
            <li>调试游戏逻辑和数据流</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataValidator from '@/components/dev/DataValidator.vue';

defineEmits(['change-system']);

const currentTab = ref('validator');

const tabs = [
  { id: 'validator', label: '🔍 数据验证' },
  { id: 'info', label: 'ℹ️ 说明' }
];
</script>

<style scoped>
.dev-tools-system {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dev-tools-container {
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dev-tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border-bottom: 3px solid #1a252f;
}

.dev-tools-header h1 {
  margin: 0;
  font-size: 28px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.btn-back {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.5);
}

.btn-back:active {
  transform: translateY(0);
}

.tabs {
  display: flex;
  background: #ecf0f1;
  border-bottom: 2px solid #bdc3c7;
  padding: 0 10px;
}

.tab-button {
  padding: 15px 30px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  color: #34495e;
  margin: 0 5px;
  border-radius: 8px 8px 0 0;
}

.tab-button:hover {
  background: #d5dbdb;
  color: #2c3e50;
}

.tab-button.active {
  background: white;
  border-bottom-color: #3498db;
  color: #3498db;
}

.tab-content {
  flex: 1;
  overflow: auto;
  padding: 30px;
  background: #f8f9fa;
}

.info-panel {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-panel h2 {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 12px;
  margin-bottom: 20px;
  font-size: 24px;
}

.info-panel h3 {
  color: #2c3e50;
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
}

.info-panel p {
  color: #2c3e50;
  line-height: 1.8;
  font-size: 16px;
}

.info-panel ul {
  line-height: 2;
  color: #2c3e50;
  padding-left: 20px;
}

.info-panel li {
  margin-bottom: 8px;
  color: #34495e;
}

.info-panel kbd {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #f4f4f4 0%, #e8e8e8 100%);
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
  font-weight: bold;
}

/* 滚动条美化 */
.tab-content::-webkit-scrollbar {
  width: 10px;
}

.tab-content::-webkit-scrollbar-track {
  background: #ecf0f1;
  border-radius: 10px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 10px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
}
</style>
