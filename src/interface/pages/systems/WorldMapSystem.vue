<template>
  <div class="root pointer-events-none">
    <!-- Canvas is now global in GameUI.vue -->

    <!-- UI 层完全与游戏逻辑解耦，只负责展示数据 -->
    <div class="ui pointer-events-auto" v-if="debugInfo">
      <div><span v-t="'worldMap.position'"></span>: x={{ Math.round(debugInfo.x) }}, y={{ Math.round(debugInfo.y) }}</div>
      <div style="color: #60a5fa;">🖱️ 鼠标位置: x={{ Math.round(debugInfo.mouseX) }}, y={{ Math.round(debugInfo.mouseY) }}</div>
      <div><span v-t="'worldMap.lastInput'"></span>: {{ debugInfo.lastInput || $t('common.unknown') }}</div>
      
      <!-- Enemy Alert Status -->
      <div v-if="debugInfo.chasingCount > 0" style="color: #ef4444; font-weight: bold;">
        ⚠️ {{ debugInfo.chasingCount }} Enemies Chasing!
      </div>
      
      <div v-t="'worldMap.moveControls'"></div>
    </div>

    <!-- NEW Dialogue Overlay (Connected to DialogueStore) -->
    <transition name="fade">
      <div v-if="dialogueStore.isActive" class="dialogue-overlay pointer-events-auto" @click="ctrl.handleOverlayClick()">
        <div class="dialogue-box" @click.stop>
          
          <!-- Speaker Name -->
          <div class="dialogue-header">
            <span class="speaker-name">{{ $t(`roles.${dialogueStore.speaker}`) || dialogueStore.speaker }}</span>
          </div>
          
          <!-- Text Content -->
          <div class="dialogue-content">
            {{ $t(dialogueStore.currentText) }}
          </div>

          <!-- Choices Area -->
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

          <!-- Continue Hint (Only if no choices) -->
          <div v-else class="dialogue-hint" @click="dialogueStore.advance">
            Click to continue... ▼
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { WorldMapController } from '@/game/interface/world/WorldMapController'

const emit = defineEmits(['change-system'])
const ctrl = new WorldMapController()

const debugInfo = ctrl.debugInfo
const dialogueStore = ctrl.dialogueStore

onMounted(async () => {
  await ctrl.start()
})

onUnmounted(() => {
  ctrl.stop()
})
</script>

<style scoped src="@styles/pages/systems/WorldMapSystem.css"></style>

<style scoped>
/* Reuse the dialogue styles we designed */
.dialogue-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 60px;
  z-index: 100;
  /* background: rgba(0,0,0,0.2);  Maybe simpler in game? */
}

.dialogue-box {
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid #94a3b8;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  pointer-events: auto; /* Ensure clicks work */
  will-change: transform, opacity;
}

.dialogue-header {
  margin-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
  align-self: flex-start;
}

.speaker-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 4px;
}

.dialogue-content {
  font-size: 1.25rem;
  color: #334155;
  line-height: 1.6;
  min-height: 3rem;
  margin-bottom: 20px;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.choice-btn {
  padding: 12px 20px;
  background: white;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  text-align: left;
}
.choice-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
  transform: translateX(5px);
}

.dialogue-hint {
  align-self: flex-end;
  font-size: 0.9rem;
  color: #94a3b8;
  cursor: pointer;
  animation: pulse 2s infinite;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.2s ease; 
  will-change: opacity;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
