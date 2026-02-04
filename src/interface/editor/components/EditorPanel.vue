<template>
  <div class="editor-panel" :class="{ 'is-disabled': !isEnabled }">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="header-main">
        <slot name="header-icon">
          <span class="header-icon">{{ icon }}</span>
        </slot>
        <span class="header-title">{{ title }}</span>
      </div>
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Panel Content -->
    <div class="panel-main">
      <div class="panel-body">
        <slot></slot>
      </div>
      
      <!-- Lock Overlay -->
      <transition name="panel-fade">
        <div v-if="!isEnabled" class="panel-lock-overlay">
          <div class="lock-content">
            <span class="lock-icon">🔒</span>
            <p>功能受限</p>
            <small>{{ lockReason }}</small>
          </div>
        </div>
      </transition>
    </div>

    <!-- Panel Footer -->
    <div v-if="$slots.footer" class="panel-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  icon?: string;
  isEnabled?: boolean;
  lockReason?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📦',
  isEnabled: true,
  lockReason: '当前系统不支持此功能'
});
</script>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--editor-bg-panel);
  color: var(--editor-text-primary);
  position: relative;
  overflow: hidden;
}

.panel-header {
  height: 32px;
  min-height: 32px;
  padding: 0 var(--editor-spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--editor-bg-header);
  border-bottom: 1px solid var(--editor-border-light);
  user-select: none;
}

.header-main {
  display: flex;
  align-items: center;
  gap: var(--editor-spacing-sm);
}

.header-icon {
  font-size: 14px;
}

.header-title {
  font-size: var(--editor-font-header);
  font-weight: 600;
  color: var(--editor-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--editor-spacing-md);
}

.panel-footer {
  padding: var(--editor-spacing-sm) var(--editor-spacing-md);
  background: var(--editor-bg-header);
  border-top: 1px solid var(--editor-border-light);
  font-size: var(--editor-font-size-xs);
  color: var(--editor-text-dim);
}

/* Lock Overlay */
.panel-lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.lock-content {
  background: var(--editor-bg-panel);
  border: 1px solid var(--editor-border-medium);
  padding: var(--editor-spacing-lg);
  border-radius: var(--editor-radius-md);
  box-shadow: var(--editor-shadow-md);
}

.lock-icon {
  font-size: 24px;
  display: block;
  margin-bottom: var(--editor-spacing-sm);
}

.lock-content p {
  margin: 0;
  font-weight: 600;
  font-size: var(--editor-font-size-md);
}

.lock-content small {
  color: var(--editor-text-muted);
  font-size: var(--editor-font-size-xs);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.3s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}
</style>
