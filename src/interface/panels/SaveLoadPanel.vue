<template>
  <div class="panel-container">
    <div class="content-area">
      <!-- 存档网格列表 -->
      <div class="save-grid custom-scrollbar">
        <div 
          v-for="(slot, index) in slots" 
          :key="index"
          class="save-card"
          :class="{ 'empty': !slot.data, 'active-card': selectedSlot === index }"
          @click="selectSlot(index)"
        >
          <div class="card-header">
            <span class="card-icon">{{ slot.data ? '💾' : '📦' }}</span>
            <span class="card-name">{{ $t('saveLoad.file') }} {{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <div class="card-footer">
            <span class="card-info">{{ slot.data ? slot.data.timestamp.split(' ')[0] : $t('saveLoad.empty') }}</span>
          </div>
          <div v-if="selectedSlot === index" class="selection-triangle"></div>
        </div>
      </div>

      <!-- 详情面板 -->
      <div class="detail-panel">
        <div v-if="currentSlotData" class="detail-content">
          <div class="detail-icon-box">💾</div>
          <div class="detail-info-box">
             <div class="detail-header">
                <h3 class="location-title">{{ currentSlotData.location }}</h3>
                <span class="play-time">{{ currentSlotData.playTime }}</span>
             </div>
             <div class="detail-stats">
                <div class="stat-row">
                  <span class="stat-label" v-t="'saveLoad.level'"></span>
                  <span class="stat-value">{{ currentSlotData.level }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label" v-t="'saveLoad.gold'"></span>
                  <span class="stat-value gold">{{ currentSlotData.gold }} G</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label" v-t="'saveLoad.date'"></span>
                  <span class="stat-value">{{ currentSlotData.timestamp }}</span>
                </div>
             </div>
          </div>
        </div>
        <div v-else class="empty-detail">
           <div class="detail-icon-box empty">📦</div>
           <div class="detail-info-box">
              <h3 class="location-title text-muted" v-t="'common.emptySlot'"></h3>
              <p class="desc-body">No data saved in this slot.</p>
           </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮栏 -->
    <div class="action-bar">
      <button 
        class="action-btn danger" 
        :disabled="!currentSlotData" 
        @click="deleteSave"
        v-t="'saveLoad.delete'"
      >
      </button>
      <button 
        class="action-btn primary" 
        @click="saveGame"
        v-t="'saveLoad.save'"
      >
      </button>
      <button 
        class="action-btn success" 
        :disabled="!currentSlotData" 
        @click="loadGame"
        v-t="'saveLoad.load'"
      >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SaveLoadPanel');
const selectedSlot = ref(0);

// 模拟存档数据，生成更多槽位以展示网格效果
const slots = ref(Array.from({ length: 16 }, (_, i) => {
  if (i === 0) {
    return {
      data: {
        location: 'Crystal Caverns - Depths',
        level: 45,
        gold: '54,300',
        playTime: '12:45:03',
        timestamp: '2023-10-24 20:30'
      }
    };
  }
  if (i === 1) {
    return {
      data: {
        location: 'Capital City - Inn',
        level: 42,
        gold: '48,100',
        playTime: '10:12:45',
        timestamp: '2023-10-23 18:15'
      }
    };
  }
  return { data: null };
}));

const selectSlot = (index) => {
  selectedSlot.value = index;
};

const currentSlotData = computed(() => {
  return slots.value[selectedSlot.value].data;
});

const saveGame = () => {
  // 模拟保存逻辑
  const now = new Date();
  const timeString = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
  
  slots.value[selectedSlot.value].data = {
    location: 'Current Location',
    level: 45,
    gold: '54,300',
    playTime: '12:46:10',
    timestamp: timeString
  };
};

const loadGame = () => {
  logger.info(`Loading slot ${selectedSlot.value + 1}...`);
};

const deleteSave = () => {
  if (confirm('Are you sure you want to delete this save file?')) {
    slots.value[selectedSlot.value].data = null;
  }
};
</script>

<style scoped src="@styles/panels/SaveLoadPanel.css"></style>
