<template>
  <div class="panel-container">
    <div class="system-card">
      <h2 class="title">SYSTEM</h2>

      <div class="settings-list">
        
        <!-- Audio Section -->
        <div class="settings-section">
          <h3 class="section-title">{{ $t('system.volume') }}</h3>

          <div class="setting-row">
            <span class="setting-label">{{ $t('system.language') }}</span>
            <div class="toggle-group">
                <button :class="{ active: settingsStore.language === 'en' }" @click="settingsStore.setLanguage('en')">ENG</button>
                <button :class="{ active: settingsStore.language === 'zh' }" @click="settingsStore.setLanguage('zh')">简体</button>
                <button :class="{ active: settingsStore.language === 'zh-TW' }" @click="settingsStore.setLanguage('zh-TW')">繁体</button>
                <button :class="{ active: settingsStore.language === 'ja' }" @click="settingsStore.setLanguage('ja')">日本語</button>
                <button :class="{ active: settingsStore.language === 'ko' }" @click="settingsStore.setLanguage('ko')">한국어</button>
            </div>
          </div>
          
          <div class="setting-row">
            <span class="setting-label">{{ $t('systemSettings.masterVolume') }}</span>
            <input type="range" class="setting-slider" v-model.number="audioStore.masterVolume" min="0" max="100">
            <span class="setting-value">{{ audioStore.masterVolume }}%</span>
          </div>
          
          <div class="setting-row">
            <span class="setting-label">{{ $t('systemSettings.music') }}</span>
            <input type="range" class="setting-slider" v-model.number="audioStore.bgmVolume" min="0" max="100">
            <span class="setting-value">{{ audioStore.bgmVolume }}%</span>
          </div>
          
          <div class="setting-row">
            <span class="setting-label">{{ $t('systemSettings.soundEffects') }}</span>
            <input type="range" class="setting-slider" v-model.number="audioStore.sfxVolume" min="0" max="100">
            <span class="setting-value">{{ audioStore.sfxVolume }}%</span>
          </div>
        </div>

        <!-- Gameplay Section -->
        <div class="settings-section">
          <h3 class="section-title" v-t="'systemSettings.gameplay'"></h3>
          
          <div class="setting-row">
            <span class="setting-label" v-t="'systemSettings.textSpeed'"></span>
             <div class="toggle-group">
                <button :class="{ active: settingsStore.textSpeed === 'slow' }" @click="settingsStore.textSpeed = 'slow'" v-t="'systemSettings.speeds.slow'"></button>
                <button :class="{ active: settingsStore.textSpeed === 'normal' }" @click="settingsStore.textSpeed = 'normal'" v-t="'systemSettings.speeds.normal'"></button>
                <button :class="{ active: settingsStore.textSpeed === 'fast' }" @click="settingsStore.textSpeed = 'fast'" v-t="'systemSettings.speeds.fast'"></button>
             </div>
          </div>

          <div class="setting-row">
            <span class="setting-label">{{ $t('systemSettings.battleSpeed') }}</span>
             <div class="toggle-group" style="flex-wrap: wrap;">
                <button 
                  v-for="speed in battleSpeeds" 
                  :key="speed"
                  :class="{ active: settingsStore.battleSpeed === speed }" 
                  @click="settingsStore.battleSpeed = speed"
                >
                  x{{ speed }}
                </button>
             </div>
          </div>
          
          <div class="setting-row">
            <span class="setting-label" v-t="'systemSettings.autoSave'"></span>
            <label class="switch">
              <input type="checkbox" v-model="settingsStore.autoSave">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
        
         <!-- Actions -->
        <div class="action-buttons">
            <button class="sys-btn danger" v-t="'systemSettings.toTitle'"></button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();
const audioStore = gameStore.audio;
const settingsStore = gameStore.settings;

const battleSpeeds = [0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 10, 20];

// 初始化音频（确保音量设置生效）
onMounted(() => {
  audioStore.initAudio();
});

// settings moved to store
</script>

<style scoped src="@styles/panels/SystemPanel.css"></style>

