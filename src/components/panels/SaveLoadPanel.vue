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
  console.log(`Loading slot ${selectedSlot.value + 1}...`);
};

const deleteSave = () => {
  if (confirm('Are you sure you want to delete this save file?')) {
    slots.value[selectedSlot.value].data = null;
  }
};
</script>

<style scoped>
.panel-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.content-area {
  flex: 1;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Save Grid */
.save-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.save-card {
  position: relative;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid #475569;
  padding: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.save-card:hover {
  background-color: var(--slate-700);
  border-color: rgba(255, 255, 255, 0.5);
}

.save-card.active-card {
  background-color: rgba(30, 58, 138, 0.6);
  border: 2px solid var(--blue-400);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

.card-name {
  font-weight: 500;
  color: var(--slate-300);
  font-size: 1.1rem;
}

.save-card:hover .card-name {
  color: white;
}

.active-card .card-name {
  color: var(--blue-100);
  font-weight: 700;
}

.card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.card-info {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--slate-400);
}

.active-card .card-info {
  color: var(--blue-200);
}

/* Empty State */
.empty .card-icon {
  opacity: 0.3;
}
.empty .card-name {
  color: var(--slate-600);
}
.empty:hover .card-name {
  color: white;
}

.selection-triangle {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 0.75rem;
  height: 0.75rem;
  background-color: var(--blue-400);
  transform: rotate(45deg);
}

/* Detail Panel */
.detail-panel {
  height: 10rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 2px solid var(--slate-700);
  padding: 1.5rem;
}

.detail-content, .empty-detail {
  display: flex;
  gap: 1.5rem;
  height: 100%;
}

.detail-icon-box {
  width: 6rem;
  height: 100%;
  background-color: var(--slate-800);
  border: 1px solid #475569;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  flex-shrink: 0;
}

.detail-icon-box.empty {
  opacity: 0.3;
}

.detail-info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.location-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.text-muted {
  color: var(--slate-500);
}

.play-time {
  font-family: monospace;
  color: var(--slate-300);
  font-size: 1.2rem;
}

.desc-body {
  color: var(--slate-400);
  font-style: italic;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.stat-row {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: var(--slate-500);
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 700;
}

.stat-value {
  color: var(--slate-200);
  font-size: 1.2rem;
  font-weight: 600;
}

.stat-value.gold {
  color: var(--yellow-400);
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 1rem;
}

.action-btn {
  padding: 0.75rem 3rem;
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  background: var(--slate-700);
  border-radius: 0.25rem;
  min-width: 150px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--slate-800);
  color: var(--slate-600);
}

.action-btn.primary {
  background: var(--blue-600);
}
.action-btn.primary:hover {
  background: var(--blue-500);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

.action-btn.success {
  background: var(--green-600);
}
.action-btn.success:not(:disabled):hover {
  background: var(--green-500);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.action-btn.danger {
  background: #991b1b;
}
.action-btn.danger:not(:disabled):hover {
  background: #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}
</style>
