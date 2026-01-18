<template>
  <div class="root pointer-events-none">
    <!-- Canvas is now global in GameUI.vue -->

    <!-- UI 层完全与游戏逻辑解耦，只负责展示数据 -->
    <div class="ui pointer-events-auto" v-if="debugInfo">
      <div><span v-t="'worldMap.position'"></span>: x={{ Math.round(debugInfo.x) }}, y={{ Math.round(debugInfo.y) }}</div>
      <div><span v-t="'worldMap.lastInput'"></span>: {{ debugInfo.lastInput || $t('common.unknown') }}</div>
      
      <!-- Enemy Alert Status -->
      <div v-if="debugInfo.chasingCount > 0" style="color: #ef4444; font-weight: bold;">
        ⚠️ {{ debugInfo.chasingCount }} Enemies Chasing!
      </div>
      
      <div v-t="'worldMap.moveControls'"></div>
    </div>

    <!-- NEW Dialogue Overlay (Connected to DialogueStore) -->
    <transition name="fade">
      <div v-if="dialogueStore.isActive" class="dialogue-overlay pointer-events-auto" @click="handleOverlayClick">
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
import { onMounted, onUnmounted, ref } from 'vue'
import { gameManager } from '@/game/ecs/GameManager'
import { useGameStore } from '@/stores/game'

const emit = defineEmits(['change-system'])
const gameStore = useGameStore()
const worldStore = gameStore.world
const dialogueStore = gameStore.dialogue

// 专门用于 UI 展示的响应式数据
const debugInfo = ref({ x: 0, y: 0, lastInput: '' })

const handleOverlayClick = () => {
  dialogueStore.advance()
}

// UI Sync Loop (independent of GameEngine loop)
let uiRafId = 0
function syncUI() {
  const scene = gameManager.currentScene.value
  const engine = gameManager.engine

  if (!scene || !engine) {
      uiRafId = requestAnimationFrame(syncUI)
      return
  }
  
  const player = scene.player
  if (!player) { // Player might not be ready
      uiRafId = requestAnimationFrame(syncUI)
      return
  }
  
  // Count chasing enemies
  let chasingCount = 0
  if (scene.gameEntities) {
      const entities = scene.gameEntities
      for (let i = 0; i < entities.length; i++) {
          const e = entities[i]
          if (e.entity && e.entity.aiState && e.entity.aiState.state === 'chase') {
              chasingCount++
          }
      }
  }

  // Update Reactive State
  debugInfo.value = {
    x: player.position ? player.position.x : 0,
    y: player.position ? player.position.y : 0,
    lastInput: engine.input.lastInput,
    chasingCount
  }
  
  uiRafId = requestAnimationFrame(syncUI)
}

onMounted(async () => {
  // 1. Start/Resume World Map
  // Canvas is handled globally in GameUI.vue
  await gameManager.startWorldMap()

  // 2. Start UI Loop
  syncUI()
})

onUnmounted(() => {
  cancelAnimationFrame(uiRafId)

  // Save State when leaving
  if (gameManager.currentScene.value) {
    worldStore.saveState(gameManager.currentScene.value)
  }
})
</script>

<style scoped src="@styles/components/pages/systems/WorldMapSystem.css"></style>

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
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #94a3b8;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  pointer-events: auto; /* Ensure clicks work */
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
  transition: all 0.2s;
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

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
