<template>
  <div class="panel-container">
    <div class="top-bar">
      <div class="filter-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab"
          class="tab"
          :class="{ active: currentTab === tab }"
          @click="currentTab = tab"
        >
          {{ tab }}
        </div>
      </div>
    </div>

    <div class="content-area">
      <div class="item-grid custom-scrollbar">
        <!-- 物品 1 (Potion) -->
        <div class="item-card active-item">
          <div class="item-header">
            <span class="item-icon">🧪</span>
            <span class="item-name">Potion</span>
          </div>
          <div class="item-footer">
            <span class="item-desc-short">Restores HP</span>
            <span class="item-count">x15</span>
          </div>
          <div class="selection-triangle"></div>
        </div>

        <!-- 物品 2 (High Potion) -->
        <div class="item-card">
          <div class="item-header">
            <span class="item-icon">🧪</span>
            <span class="item-name">High Potion</span>
          </div>
          <div class="item-footer">
            <span class="item-desc-short">Restores HP++</span>
            <span class="item-count">x3</span>
          </div>
        </div>

        <!-- 物品 3 (Ether) -->
        <div class="item-card">
          <div class="item-header">
            <span class="item-icon">🧪</span>
            <span class="item-name">Ether</span>
          </div>
          <div class="item-footer">
            <span class="item-desc-short">Restores MP</span>
            <span class="item-count">x1</span>
          </div>
        </div>

        <!-- 物品 4 (Antidote) -->
        <div class="item-card">
          <div class="item-header">
            <span class="item-icon">🌱</span>
            <span class="item-name">Antidote</span>
          </div>
          <div class="item-footer">
            <span class="item-desc-short">Cures Poison</span>
            <span class="item-count">x5</span>
          </div>
        </div>

        <!-- 物品 5 (Tent) -->
        <div class="item-card">
          <div class="item-header">
            <span class="item-icon">⛺</span>
            <span class="item-name">Tent</span>
          </div>
          <div class="item-footer">
            <span class="item-desc-short">Full Rest</span>
            <span class="item-count">x1</span>
          </div>
        </div>

        <!-- 空槽位 -->
        <div v-for="i in 35" :key="i" class="item-card empty-slot">
          <div class="item-header">
            <span class="item-icon">📦</span>
            <span class="item-name">Empty Slot</span>
          </div>
          <div class="item-footer">
            <span class="item-desc-short">---</span>
            <span class="item-count">--</span>
          </div>
        </div>
      </div>

      <div class="description-panel">
        <div class="desc-icon-box">🧪</div>
        <div class="desc-text-box">
          <div class="desc-header">
            <h3 class="desc-title">Potion</h3>
            <span class="desc-sub">Restores 50 HP</span>
          </div>
          <p class="desc-body">
            A basic medicinal brew made from herbs. Restores a small amount of health. Essential for any adventurer.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tabs = ['All', 'Consumables', 'Weapons', 'Armor', 'Key Items'];
const currentTab = ref('All');
</script>

<style scoped>
.panel-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.top-bar {
  display: flex;
  gap: 1rem;
  height: 3rem;
}

.filter-tabs {
  flex: 1;
  display: flex;
  gap: 0.25rem;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 0.25rem;
  align-items: center;
}

.tab {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: var(--slate-400);
  transition: background-color 0.2s;
}

.tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.tab.active {
  background-color: var(--slate-700);
  color: white;
  font-weight: 700;
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

.item-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* Item Card */
.item-card {
  position: relative;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid #475569;
  padding: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.item-card:hover {
  background-color: var(--slate-700);
  border-color: rgba(255, 255, 255, 0.5);
}

.item-card.active-item {
  background-color: rgba(30, 58, 138, 0.6);
  border: 2px solid var(--blue-400);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.item-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

.item-card:hover .item-icon {
  opacity: 1;
}

.item-name {
  font-weight: 500;
  color: var(--slate-300);
  font-size: 1.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-card:hover .item-name {
  color: white;
}

.active-item .item-name {
  color: var(--blue-100);
  font-weight: 700;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
}

.item-desc-short {
  font-size: 0.75rem;
  color: var(--slate-500);
}

.item-card:hover .item-desc-short {
  color: var(--slate-300);
}

.active-item .item-desc-short {
  color: var(--blue-300);
}

.item-count {
  font-family: monospace;
  font-size: 1.25rem;
  color: var(--slate-400);
}

.item-card:hover .item-count,
.active-item .item-count {
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

/* Empty Slot */
.empty-slot .item-icon {
  opacity: 0.3;
}
.empty-slot:hover .item-icon {
  opacity: 1;
}
.empty-slot .item-name {
  color: var(--slate-500);
}
.empty-slot:hover .item-name {
  color: white;
}

/* Description Panel */
.description-panel {
  height: 8rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 2px solid var(--slate-700);
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
}

.desc-icon-box {
  width: 5rem;
  height: 5rem;
  background-color: var(--slate-800);
  border: 1px solid #475569;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
}

.desc-text-box {
  flex: 1;
}

.desc-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.desc-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.desc-sub {
  font-size: 0.875rem;
  color: var(--slate-400);
}

.desc-body {
  color: var(--slate-300);
  line-height: 1.5;
  margin: 0;
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

