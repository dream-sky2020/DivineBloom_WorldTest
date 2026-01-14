<template>
  <div 
    class="marquee-container" 
    :class="{ 
      'is-overflowing': isOverflowing, 
      'is-active': active,
      'is-paused': isPaused 
    }"
    ref="container"
  >
    <div 
      class="marquee-content" 
      ref="content"
      :style="scrollStyle"
      @animationend="handleAnimationEnd"
    >
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, computed, nextTick, watch } from 'vue';

const props = defineProps({
  text: { 
    type: String, 
    default: '' 
  },
  active: { 
    type: Boolean, 
    default: false 
  },
  speed: { 
    type: Number, 
    default: 50 
  }
});

const container = ref(null);
const content = ref(null);
const isOverflowing = ref(false);
const duration = ref(0);
const isPaused = ref(false);
const extraScroll = 14; // 额外滚动的像素，用于避开半透明遮罩

const checkOverflow = () => {
  if (container.value && content.value) {
    const containerWidth = container.value.clientWidth;
    const contentWidth = content.value.scrollWidth;
    
    // Check if content width is greater than container width
    isOverflowing.value = contentWidth > containerWidth + 0.5;
    
    if (isOverflowing.value) {
      duration.value = (contentWidth - containerWidth + extraScroll) / props.speed;
    } else {
      duration.value = 0;
    }
  }
};

const handleAnimationEnd = () => {
  if (!isOverflowing.value || !props.active) return;

  isPaused.value = true;
  
  setTimeout(() => {
    if (props.active) {
      resetAnimation();
    }
  }, 3000);
};

const resetAnimation = () => {
  isPaused.value = true;
  nextTick(() => {
    isPaused.value = false;
  });
};

watch(() => props.active, (newVal) => {
  if (newVal) {
    isPaused.value = false;
  }
});

const scrollStyle = computed(() => {
  if (!isOverflowing.value || !container.value || !content.value) return {};
  
  return {
    '--scroll-duration': `${duration.value}s`,
    '--scroll-distance': `-${content.value.scrollWidth - container.value.offsetWidth + extraScroll}px`
  };
});

onMounted(() => {
  // Delay slightly to ensure layout is complete
  setTimeout(checkOverflow, 50);
});

onUpdated(() => {
  nextTick(checkOverflow);
});

// For dynamic content that might change without a full update
defineExpose({ refresh: checkOverflow });
</script>

<style scoped src="@styles/components/ui/MarqueeText.css"></style>
