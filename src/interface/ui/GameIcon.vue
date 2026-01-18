<template>
  <span class="game-icon" :class="[iconClass, { 'is-image': isImage }]">
    <img v-if="isImage" :src="resolvedIcon" :alt="name" class="icon-img" />
    <template v-else>{{ resolvedIcon }}</template>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { getIcon, isImageIcon } from '@/utils/iconMap';

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  // 可选：传入额外的 class
  iconClass: {
    type: String,
    default: ''
  }
});

const resolvedIcon = computed(() => getIcon(props.name));
const isImage = computed(() => isImageIcon(resolvedIcon.value));
</script>

<style scoped src="@styles/ui/GameIcon.css"></style>
