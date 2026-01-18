<template>
  <div v-if="dialogueStore.isActive" class="dialogue-overlay" @click="handleOverlayClick">
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
</template>

<script setup>
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();
const dialogueStore = gameStore.dialogue;

const handleOverlayClick = () => {
  dialogueStore.advance();
};
</script>

<style scoped>
.dialogue-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 60px;
  z-index: 100;
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
</style>
