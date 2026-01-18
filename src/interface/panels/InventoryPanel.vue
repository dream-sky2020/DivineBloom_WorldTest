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
        <div class="desc-icon-box" v-if="selectedItem && !selectedItem.isEmpty">
          <GameIcon :name="selectedItem.icon" />
        </div>
        <div class="desc-icon-box empty" v-else>
          <GameIcon name="icon_box" />
        </div>
        
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
import GameDataGrid from '@/interface/ui/GameDataGrid.vue';
import GameIcon from '@/interface/ui/GameIcon.vue';
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

const tabs = ['All', 'Consumables', 'Weapons', 'Armor', 'Accessories', 'Materials', 'Ammo', 'Key Items'];
const currentTab = ref('All');

const getTabLabel = (tab) => {
  const map = {
    'All': 'inventory.tabs.all',
    'Consumables': 'itemTypes.consumable',
    'Weapons': 'itemTypes.weapon',
    'Armor': 'itemTypes.armor',
    'Accessories': 'itemTypes.accessory',
    'Materials': 'itemTypes.material',
    'Ammo': 'itemTypes.ammo',
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
  return [...rawItems.value];
});

const selectedItem = computed(() => displayItems.value[selectedIndex.value]);

const handleSelect = (item) => {
  // 可以在这里处理额外的选择逻辑
};
</script>

<style scoped src="@styles/panels/InventoryPanel.css"></style>
