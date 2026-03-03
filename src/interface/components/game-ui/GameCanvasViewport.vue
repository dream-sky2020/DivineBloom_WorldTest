<template>
  <div class="canvas-container" :class="{ 'immersive-mode': immersiveMode }" :style="containerStyle">
    <div id="game-canvas" :class="{ 'fullscreen-canvas': immersiveMode }">
      <canvas
        :ref="setCanvasRef"
        class="global-canvas"
        :style="canvasStyle"
        @contextmenu="emit('contextmenu', $event)"
      ></canvas>

      <div class="grid-overlay" v-show="showGrid"></div>

      <div class="system-layer" v-show="!immersiveMode">
        <slot name="system-layer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  immersiveMode: boolean;
  containerStyle: Record<string, string>;
  canvasStyle: Record<string, string | number>;
  showGrid: boolean;
  setCanvasRef: (el: Element | null) => void;
}>();

const emit = defineEmits<{
  (e: 'contextmenu', event: MouseEvent): void;
}>();
</script>

<style scoped src="@styles/pages/GameUI.css"></style>
