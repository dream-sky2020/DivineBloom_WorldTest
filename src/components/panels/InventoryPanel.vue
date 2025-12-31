<template>
  <div class="panel-container">
    <div class="top-bar">
      <!-- 过滤器 Tabs -->
      <div class="filter-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab"
          class="tab"
          :class="{ active: currentTab === tab }"
          @click="currentTab = tab"
        >
          {{ getTabLabel(tab) }}
        </div>
      </div>

      <!-- 视图切换器 -->
      <div class="view-toggle">
        <button 
          class="toggle-btn" 
          :class="{ active: viewMode === 'list' }" 
          @click="viewMode = 'list'"
          :title="$t('inventory.views.list')"
        >
          ☰
        </button>
        <button 
          class="toggle-btn" 
          :class="{ active: viewMode === 'simple' }" 
          @click="viewMode = 'simple'"
          :title="$t('inventory.views.card')"
        >
          📄
        </button>
        <button 
          class="toggle-btn" 
          :class="{ active: viewMode === 'icon' }" 
          @click="viewMode = 'icon'"
          :title="$t('inventory.views.grid')"
        >
          🧩
        </button>
      </div>
    </div>

    <div class="content-area">
      <!-- 使用通用组件 -->
      <GameDataGrid 
        class="flex-grow-grid"
        :items="displayItems" 
        :mode="viewMode" 
        :columns="viewMode === 'icon' ? 8 : 4" 
        v-model="selectedIndex"
        @select="handleSelect"
      />

      <div class="description-panel">
        <div class="desc-icon-box" v-if="selectedItem && !selectedItem.isEmpty">{{ selectedItem.icon }}</div>
        <div class="desc-icon-box empty" v-else>📦</div>
        
        <div class="desc-text-box">
          <template v-if="selectedItem && !selectedItem.isEmpty">
            <div class="desc-header">
              <h3 class="desc-title">{{ getLocalizedText(selectedItem.name) }}</h3>
              <span class="desc-sub">{{ getLocalizedText(selectedItem.subText) }}</span>
            </div>
            <p class="desc-body">{{ getLocalizedText(selectedItem.description) }}</p>
          </template>
          <template v-else>
            <div class="desc-header">
               <h3 class="desc-title text-muted" v-t="'common.emptySlot'"></h3>
            </div>
            <p class="desc-body text-muted">No item selected.</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import GameDataGrid from '@/components/ui/GameDataGrid.vue';
import { useInventoryStore } from '@/stores/inventory';

const { t, locale } = useI18n();
const store = useInventoryStore();

const getLocalizedText = (input) => {
  if (!input) return '';
  if (typeof input === 'object') {
    return input[locale.value] || input['en'] || input['zh'] || Object.values(input)[0] || '';
  }
  return t(input);
};

const tabs = ['All', 'Consumables', 'Weapons', 'Armor', 'Key Items'];
const currentTab = ref('All');

const getTabLabel = (tab) => {
  const map = {
    'All': 'inventory.tabs.all',
    'Consumables': 'itemTypes.consumable',
    'Weapons': 'itemTypes.weapon',
    'Armor': 'itemTypes.armor',
    'Key Items': 'itemTypes.keyItem'
  };
  return map[tab] ? t(map[tab]) : tab;
};
const viewMode = ref('simple'); // 'simple' or 'icon' or 'list'
const selectedIndex = ref(0);

// 从 Store 获取物品
const rawItems = computed(() => {
  return store.getItemsByCategory(currentTab.value);
});

// 生成填充网格的空槽位
const displayItems = computed(() => {
  const filled = [...rawItems.value];
  const totalSlots = 40; // 总槽位
  
  // 仅在非 List 模式下填充空位，List 模式通常只显示持有的物品
  if (viewMode.value !== 'list') {
     for (let i = filled.length; i < totalSlots; i++) {
       filled.push({ isEmpty: true });
     }
  }
  
  return filled;
});

const selectedItem = computed(() => displayItems.value[selectedIndex.value]);

const handleSelect = (item) => {
  // 可以在这里处理额外的选择逻辑
};
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

/* View Toggle */
.view-toggle {
  display: flex;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 0.25rem;
  gap: 0.25rem;
}

.toggle-btn {
  width: 2.5rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  border-radius: 0.25rem;
  color: var(--slate-500);
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--slate-300);
}

.toggle-btn.active {
  background-color: var(--slate-700);
  color: var(--blue-400);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.content-area {
  flex: 1;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止子元素溢出 */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.flex-grow-grid {
  flex: 1;
  min-height: 0; /* 关键：允许 flex 子项缩小以触发内部滚动 */
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

.desc-icon-box.empty {
  opacity: 0.3;
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

.text-muted {
  color: var(--slate-500);
}
</style>
