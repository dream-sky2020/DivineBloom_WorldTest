<template>
  <div
    v-if="!immersiveMode && contextMenu.show"
    class="context-menu"
    :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
  >
    <div
      v-for="(item, index) in contextMenu.items"
      :key="index"
      class="context-menu-item"
      :class="[item.class, { disabled: item.disabled }]"
      @click="onItemClick(item)"
    >
      <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
      <span class="item-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/game/editor';

const props = defineProps<{
  immersiveMode: boolean;
  contextMenu: {
    show: boolean;
    x: number;
    y: number;
    items: MenuItem[];
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const onItemClick = (item: MenuItem) => {
  if (item.disabled) return;
  if (item.action) item.action();
  emit('close');
};
</script>
