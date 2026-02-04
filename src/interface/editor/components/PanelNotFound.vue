<template>
  <EditorPanel 
    title="面板未找到" 
    icon="❌" 
    :is-enabled="false"
    :lock-reason="`面板组件 '${panelId}' 不存在`"
  >
    <div class="not-found-content">
      <p>该面板组件尚未注册或已被移除</p>
      <code>{{ panelId }}</code>
    </div>
  </EditorPanel>
</template>

<script setup lang="ts">
import EditorPanel from './EditorPanel.vue';

defineProps<{
  panelId: string
}>();
</script>

<style scoped>
.not-found-content {
  text-align: center;
  color: var(--editor-text-muted);
}

.not-found-content code {
  display: block;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>
