<template>
  <div class="ui-overlay pointer-events-auto" v-if="debugInfo">
    <div><span v-t="'worldMap.position'"></span>: x={{ Math.round(debugInfo.x) }}, y={{ Math.round(debugInfo.y) }}</div>
    <div style="color: #60a5fa;">🖱️ 鼠标位置: x={{ Math.round(debugInfo.mouseX) }}, y={{ Math.round(debugInfo.mouseY) }}</div>
    <div><span v-t="'worldMap.lastInput'"></span>: {{ debugInfo.lastInput || $t('common.unknown') }}</div>

    <div v-if="debugInfo.chasingCount > 0" style="color: #ef4444; font-weight: bold;">
      ⚠️ {{ debugInfo.chasingCount }} Enemies Chasing!
    </div>

    <div v-t="'worldMap.moveControls'"></div>
  </div>

  <transition name="fade">
    <div v-if="dialogueStore.isActive" class="dialogue-overlay pointer-events-auto" @click="onOverlayClick">
      <div class="dialogue-box" @click.stop>
        <div class="dialogue-header">
          <span class="speaker-name">{{ $t(`roles.${dialogueStore.speaker}`) || dialogueStore.speaker }}</span>
        </div>

        <div class="dialogue-content">
          {{ $t(dialogueStore.currentText) }}
        </div>

        <div v-if="dialogueStore.currentOptions.length > 0" class="choices-container">
          <button
            v-for="(opt, idx) in dialogueStore.currentOptions"
            :key="idx"
            class="choice-btn"
            @click="dialogueStore.selectOption(opt.value)"
          >
            {{ $t(opt.label) }}
          </button>
        </div>

        <div v-else class="dialogue-hint" @click="dialogueStore.advance">
          Click to continue... ▼
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  debugInfo: any;
  dialogueStore: any;
  worldMapCtrl: { handleOverlayClick: () => void };
}>();

const onOverlayClick = () => {
  props.worldMapCtrl.handleOverlayClick();
};
</script>

<style scoped src="@styles/pages/GameUI.css"></style>
