<template>
  <div class="panel-container">
    <div class="system-card">
      <h2 class="title">SYSTEM</h2>

      <div class="settings-list">
        
        <!-- Audio Section -->
        <div class="settings-section">
          <h3 class="section-title">AUDIO</h3>
          
          <div class="setting-row">
            <span class="setting-label">Master Volume</span>
            <input type="range" class="setting-slider" v-model="settings.masterVolume" min="0" max="100">
            <span class="setting-value">{{ settings.masterVolume }}%</span>
          </div>
          
          <div class="setting-row">
            <span class="setting-label">Music</span>
            <input type="range" class="setting-slider" v-model="settings.musicVolume" min="0" max="100">
            <span class="setting-value">{{ settings.musicVolume }}%</span>
          </div>
          
          <div class="setting-row">
            <span class="setting-label">Sound Effects</span>
            <input type="range" class="setting-slider" v-model="settings.sfxVolume" min="0" max="100">
            <span class="setting-value">{{ settings.sfxVolume }}%</span>
          </div>
        </div>

        <!-- Gameplay Section -->
        <div class="settings-section">
          <h3 class="section-title">GAMEPLAY</h3>
          
          <div class="setting-row">
            <span class="setting-label">Text Speed</span>
             <div class="toggle-group">
                <button :class="{ active: settings.textSpeed === 'slow' }" @click="settings.textSpeed = 'slow'">Slow</button>
                <button :class="{ active: settings.textSpeed === 'normal' }" @click="settings.textSpeed = 'normal'">Normal</button>
                <button :class="{ active: settings.textSpeed === 'fast' }" @click="settings.textSpeed = 'fast'">Fast</button>
             </div>
          </div>
          
          <div class="setting-row">
            <span class="setting-label">Auto Save</span>
            <label class="switch">
              <input type="checkbox" v-model="settings.autoSave">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
        
         <!-- Actions -->
        <div class="action-buttons">
            <button class="sys-btn danger">To Title</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const settings = reactive({
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 100,
  textSpeed: 'normal',
  autoSave: true
});
</script>

<style scoped>
.panel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.system-card {
  width: 100%;
  max-width: 800px;
  height: 100%;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  border-bottom: 2px solid var(--blue-500);
  padding-bottom: 1rem;
}

.settings-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  flex: 1;
}

.section-title {
  color: var(--blue-400);
  font-size: 1.25rem;
  margin-bottom: 1rem;
  border-left: 4px solid var(--blue-500);
  padding-left: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: rgba(255, 255, 255, 0.03);
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.setting-label {
  color: var(--slate-300);
  font-weight: 600;
  font-size: 1.1rem;
}

.setting-value {
  color: var(--blue-300);
  font-family: monospace;
  width: 3rem;
  text-align: right;
}

/* Slider Style */
.setting-slider {
  -webkit-appearance: none;
  width: 40%;
  height: 6px;
  background: var(--slate-700);
  border-radius: 3px;
  outline: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--blue-500);
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  transition: transform 0.1s;
}

.setting-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Toggle Group */
.toggle-group {
  display: flex;
  gap: 0.25rem;
  background: var(--slate-900);
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.toggle-group button {
  background: transparent;
  border: none;
  color: var(--slate-400);
  padding: 0.25rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.25rem;
  font-weight: 600;
}

.toggle-group button:hover {
  color: var(--slate-200);
}

.toggle-group button.active {
  background: var(--blue-600);
  color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--slate-700);
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: var(--blue-600);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Action Buttons */
.action-buttons {
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.sys-btn {
  background: linear-gradient(to bottom, var(--slate-700), var(--slate-800));
  border: 1px solid var(--slate-500);
  color: white;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 150px;
}

.sys-btn:hover {
  background: linear-gradient(to bottom, var(--slate-600), var(--slate-700));
  border-color: var(--blue-400);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.sys-btn.danger {
  border-color: #7f1d1d; /* red-900 like */
  color: #fca5a5; /* red-300 */
}

.sys-btn.danger:hover {
  background: linear-gradient(to bottom, #7f1d1d, #450a0a);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  color: white;
}
</style>

