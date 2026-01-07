<template>
  <div class="dialogue-system-container">
    <!-- Controls Panel (Left Side) -->
    <div class="controls-panel">
      <h2>Dialogue Debugger</h2>
      
      <div class="control-group">
        <label>Select Script:</label>
        <select v-model="selectedScriptId" class="dialogue-select">
          <option v-for="(fn, key) in dialoguesDb" :key="key" :value="key">
            {{ key }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <button @click="runScript" class="play-btn" :disabled="dialogueStore.isActive">
          ▶ Play Script
        </button>
      </div>

      <hr class="separator"/>

      <!-- Quest State Debugger -->
      <div class="quest-debug">
        <h3>Quest Flags</h3>
        <div class="flag-list">
          <div v-for="flag in questStore.flags" :key="flag" class="flag-tag">
            {{ flag }}
            <span class="remove-x" @click="questStore.removeFlag(flag)">×</span>
          </div>
          <div v-if="questStore.flags.size === 0" class="empty-hint">No active flags</div>
        </div>
        
        <div class="add-flag-row">
           <input v-model="newFlagName" placeholder="New Flag Name" @keyup.enter="addCustomFlag"/>
           <button @click="addCustomFlag">+</button>
        </div>
        
        <button @click="questStore.reset()" class="reset-btn">Reset All Flags</button>
      </div>
    </div>

    <!-- Preview Area (Right Side) -->
    <div class="preview-area">
      <!-- Background placeholder -->
      <div class="game-view-placeholder">
        <div class="character-placeholder" :class="{ active: dialogueStore.isActive }">
          <img v-if="dialogueStore.speaker === 'elder'" src="/assets/characters/elder.png" alt="Elder" />
          <span v-else>NPC</span>
        </div>
      </div>

      <!-- Dialogue UI Overlay (The actual game UI component) -->
      <transition name="fade">
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
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDialogueStore } from '@/stores/dialogue';
import { useQuestStore } from '@/stores/quest';
import { dialoguesDb } from '@/data/dialogues';

const dialogueStore = useDialogueStore();
const questStore = useQuestStore();

const selectedScriptId = ref(Object.keys(dialoguesDb)[0] || '');
const newFlagName = ref('');

const runScript = () => {
  const scriptFn = dialoguesDb[selectedScriptId.value];
  if (scriptFn) {
    dialogueStore.startDialogue(scriptFn);
  }
};

const handleOverlayClick = () => {
  // Clicking outside the box advances dialogue if no choices are present
  dialogueStore.advance();
};

const addCustomFlag = () => {
  if (newFlagName.value.trim()) {
    questStore.addFlag(newFlagName.value.trim());
    newFlagName.value = '';
  }
};
</script>

<style scoped>
.dialogue-system-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f1f5f9;
  color: #334155;
  overflow: hidden;
}

/* --- Controls Panel --- */
.controls-panel {
  width: 320px;
  background: white;
  padding: 20px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  z-index: 10;
  overflow-y: auto;
}

.controls-panel h2, .controls-panel h3 {
  color: #0f172a;
  margin: 0;
}
.controls-panel h3 { font-size: 1rem; margin-bottom: 5px; }

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dialogue-select, input {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.9rem;
}

.play-btn {
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.play-btn:hover:not(:disabled) { background-color: #2563eb; transform: translateY(-1px); }
.play-btn:disabled { background-color: #94a3b8; cursor: not-allowed; transform: none; }

.separator { border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0; width: 100%; }

/* --- Debug Flags --- */
.flag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
  min-height: 30px;
}

.flag-tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-x { cursor: pointer; font-weight: bold; }
.remove-x:hover { color: #dc2626; }

.add-flag-row { display: flex; gap: 5px; }
.add-flag-row button {
  padding: 0 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.reset-btn {
  margin-top: 10px;
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

/* --- Preview Area --- */
.preview-area {
  flex: 1;
  position: relative;
  background-color: #334155;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-view-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, #475569 0%, #1e293b 100%);
}

.character-placeholder {
  width: 100px; /* Adjust based on asset */
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  transition: transform 0.3s;
}
.character-placeholder img {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
}
.character-placeholder.active {
  transform: scale(1.05);
}

/* --- Dialogue Overlay Styles --- */
.dialogue-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 60px;
  z-index: 100;
  background: rgba(0,0,0,0.2); /* Dim background slightly */
}

.dialogue-box {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #94a3b8;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(4px);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.dialogue-header {
  margin-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
  display: inline-block;
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

/* --- Choices --- */
.choices-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  margin-top: 10px;
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

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
