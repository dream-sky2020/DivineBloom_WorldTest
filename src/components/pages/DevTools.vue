<template>
  <div class="dev-tools">
    <div class="dev-header">
      <h1>🛠️ 开发工具</h1>
      <button @click="$emit('close')" class="btn-close">关闭</button>
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
          <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>: 打开/关闭开发工具</li>
          <li><kbd>Esc</kbd>: 关闭开发工具</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataValidator from '@/components/dev/DataValidator.vue';

defineEmits(['close']);

const currentTab = ref('validator');

const tabs = [
  { id: 'validator', label: '🔍 数据验证' },
  { id: 'info', label: 'ℹ️ 说明' }
];
</script>

<style scoped>
.dev-tools {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10000;
  overflow: auto;
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #2c3e50;
  color: white;
  border-bottom: 3px solid #34495e;
}

.dev-header h1 {
  margin: 0;
}

.btn-close {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #c0392b;
  transform: scale(1.05);
}

.tabs {
  display: flex;
  background: #ecf0f1;
  border-bottom: 2px solid #bdc3c7;
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
}

.tab-button:hover {
  background: #d5dbdb;
}

.tab-button.active {
  background: white;
  border-bottom-color: #3498db;
  color: #3498db;
}

.tab-content {
  padding: 20px;
}

.info-panel {
  max-width: 800px;
  margin: 0 auto;
}

.info-panel h2 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.info-panel h3 {
  color: #34495e;
  margin-top: 25px;
}

.info-panel ul {
  line-height: 1.8;
}

.info-panel kbd {
  display: inline-block;
  padding: 3px 8px;
  background: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
  box-shadow: 0 1px 1px rgba(0,0,0,0.1);
}
</style>
