// src/stores/audio.js
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { audioManager } from '@/utils/AudioManager';

export const useAudioStore = defineStore('audio', () => {
  // 状态：使用 0-100 的整数，方便滑块控制
  const masterVolume = ref(80);
  const bgmVolume = ref(60);
  const sfxVolume = ref(100);

  // 初始化 Audio Manager
  function initAudio() {
    updateManager();
  }

  // 同步状态到 Manager
  function updateManager() {
    audioManager.setVolumes(
      masterVolume.value / 100, 
      bgmVolume.value / 100, 
      sfxVolume.value / 100
    );
  }

  // 监听变化自动更新
  watch([masterVolume, bgmVolume, sfxVolume], () => {
    updateManager();
  });

  // Actions
  function playBgm(key) {
    audioManager.playBgm(key);
  }

  function stopBgm() {
    audioManager.stopBgm();
  }

  function playSfx(key) {
    audioManager.playSfx(key);
  }

  // 通用点击音效
  function playClick() {
    playSfx('click');
  }

  function playHover() {
    playSfx('hover');
  }

  return {
    masterVolume,
    bgmVolume,
    sfxVolume,
    initAudio,
    playBgm,
    stopBgm,
    playSfx,
    playClick,
    playHover
  };
});

