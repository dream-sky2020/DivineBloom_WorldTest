<template>
  <div class="speed-control" ref="containerRef">
    <div class="current-speed" @click="toggleMenu" title="调整游戏速度">
      <span class="icon">⏩</span>
      <span class="value">x{{ speed }}</span>
    </div>
    
    <div v-if="isOpen" class="speed-menu">
      <div 
        v-for="s in speeds" 
        :key="s" 
        class="speed-option"
        :class="{ active: speed === s }"
        @click="selectSpeed(s)"
      >
        x{{ s }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  speed: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:speed']);

const isOpen = ref(false);
const containerRef = ref(null);
const speeds = [0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 10, 20];

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const selectSpeed = (speed) => {
  emit('update:speed', speed);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped src="@styles/ui/BattleSpeedControl.css"></style>
