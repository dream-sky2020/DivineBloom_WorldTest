<template>
  <div v-if="error" class="panel-error">
    <div class="error-header">
      <span class="error-icon">💥</span>
      <h4>面板崩溃</h4>
    </div>
    <div class="error-details">
      <p>{{ error.message }}</p>
    </div>
    <button @click="retry" class="retry-btn">尝试重启</button>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((e: Error) => {
  console.error('Panel crashed:', e)
  error.value = e
  return false // 阻止错误继续向上传播
})

const retry = () => {
  error.value = null
}
</script>

<style scoped>
.panel-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  background: #451a1a;
  color: #fecaca;
  text-align: center;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.error-icon {
  font-size: 24px;
}

h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.error-details {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 300px;
  overflow: hidden;
}

.error-details p {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  text-align: left;
}

.retry-btn {
  padding: 6px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #dc2626;
}
</style>
