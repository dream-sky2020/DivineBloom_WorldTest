<template>
  <div class="encyclopedia-overlay">
    <div class="encyclopedia-container">
      
      <!-- Top Navigation Tabs -->
      <div class="tabs-header">
        <h2 class="system-title" v-t="'panels.encyclopedia'"></h2>
        <div class="tabs-group">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: currentTab === tab.id }]"
            @click="switchTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="content-split">
        <!-- Left: Grid List -->
        <div class="grid-section">
          <GameDataGrid 
            :items="currentGridItems"
            :mode="currentGridMode"
            :columns="currentGridColumns"
            v-model="selectedIndex"
            @select="onItemSelect"
          />
        </div>

        <!-- Right: Detail Panel -->
        <div class="detail-section">
          <div v-if="selectedItem" class="detail-card">
            <div class="detail-header">
              <div class="detail-icon-large">
                {{ selectedItem.icon || '?' }}
              </div>
              <div class="detail-title-group">
                <h3 class="detail-name">{{ selectedItem.name }}</h3>
                <span class="detail-subtitle">{{ getSubtitle(selectedItem) }}</span>
              </div>
            </div>
            
            <div class="detail-body">
              <div class="info-row" v-for="(value, label) in detailProperties" :key="label">
                <span class="label">{{ label }}:</span>
                <span class="value">{{ value }}</span>
              </div>
              
              <div class="description-box">
                <h4 v-t="'encyclopedia.description'"></h4>
                <p v-t="selectedItem.description"></p>
              </div>

              <!-- Character Specific Stats Preview -->
              <div v-if="currentTab === 'characters' && selectedItem.initialStats" class="stats-preview">
                 <h4 v-t="'encyclopedia.baseStats'"></h4>
                 <div class="stats-grid">
                   <div v-for="(val, stat) in selectedItem.initialStats" :key="stat" class="stat-item">
                     <span class="stat-label" v-t="`stats.${stat}`"></span>
                     <span class="stat-val">{{ val }}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Select an entry to view details</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import GameDataGrid from '@/components/ui/GameDataGrid.vue';
import { charactersDb } from '@/data/characters.js';
import { itemsDb } from '@/data/items.js';
import { statusDb } from '@/data/status.js';
import { skillsDb } from '@/data/skills.js';

const { t } = useI18n();

const tabs = computed(() => [
  { id: 'characters', label: 'Characters' }, // 保留英文或者添加 dedicated key
  { id: 'items', label: t('panels.inventory') },
  { id: 'skills', label: t('panels.skills') },
  { id: 'status', label: t('panels.status') }
]);

const currentTab = ref('characters');
const selectedIndex = ref(0);
const selectedItem = ref(null);

// Transform Data for Grid
const charactersList = computed(() => {
  return Object.values(charactersDb).map(c => ({
    ...c,
    icon: '👤', // Default icon for characters
    subText: c.role,
    footerLeft: c.element,
    footerRight: c.weaponType,
    // Add custom tag for grid
    tag: 'Lv.1'
  }));
});

const itemsList = computed(() => {
  return Object.values(itemsDb).map(i => ({
    ...i,
    // Ensure properties exist for grid
    footerLeft: i.type,
    footerRight: '' 
  }));
});

const skillsList = computed(() => {
  return Object.values(skillsDb).map(s => ({
    ...s,
    footerLeft: s.category,
    footerRight: s.cost,
    highlight: s.type === 'Active' // Just for visual flair
  }));
});

const statusList = computed(() => {
  return Object.values(statusDb).map(s => ({
    ...s,
    footerLeft: s.type,
    footerRight: ''
  }));
});

// Dynamic Configuration based on Tab
const currentGridItems = computed(() => {
  switch (currentTab.value) {
    case 'characters': return charactersList.value;
    case 'items': return itemsList.value;
    case 'skills': return skillsList.value;
    case 'status': return statusList.value;
    default: return [];
  }
});

const currentGridMode = computed(() => {
  switch (currentTab.value) {
    case 'characters': return 'detailed';
    case 'items': return 'simple';
    case 'skills': return 'detailed';
    case 'status': return 'simple';
    default: return 'simple';
  }
});

const currentGridColumns = computed(() => {
  if (currentTab.value === 'characters') return 2;
  return 3; 
});

// Event Handlers
const switchTab = (tabId) => {
  currentTab.value = tabId;
  selectedIndex.value = 0;
  // Auto-select first item
  const list = currentGridItems.value;
  selectedItem.value = list.length > 0 ? list[0] : null;
};

const onItemSelect = (item) => {
  selectedItem.value = item;
};

// Helpers
const getSubtitle = (item) => {
  if (!item) return '';
  if (currentTab.value === 'characters') return t(item.role);
  return t(item.subText || item.type);
};

const detailProperties = computed(() => {
  if (!selectedItem.value) return {};
  const i = selectedItem.value;
  
  if (currentTab.value === 'characters') {
    return {
      [t('labels.element')]: t(i.element),
      [t('labels.weapon')]: t(i.weaponType),
      [t('labels.role')]: t(i.role)
    };
  }
  if (currentTab.value === 'items') {
    return {
      [t('labels.type')]: t(i.type),
      [t('labels.effect')]: t(i.subText)
    };
  }
  if (currentTab.value === 'skills') {
    return {
      [t('labels.category')]: t(i.category),
      [t('labels.cost')]: i.cost, 
      [t('labels.type')]: t(i.type)
    };
  }
  if (currentTab.value === 'status') {
    return {
      [t('labels.type')]: t(i.type),
      [t('labels.effect')]: t(i.subText)
    };
  }
  return {};
});

// Initialize selection on mount
watch(currentGridItems, (newItems) => {
  if (newItems && newItems.length > 0 && !selectedItem.value) {
    selectedItem.value = newItems[0];
  }
}, { immediate: true });

</script>

<style scoped>
.encyclopedia-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.95);
  z-index: 50;
  padding: 2rem;
  color: #fff;
}

.encyclopedia-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1600px;
  margin: 0 auto;
}

.tabs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  border-bottom: 2px solid #334155;
  padding-bottom: 1rem;
}

.system-title {
  font-size: 2rem;
  color: #e2e8f0;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.tabs-group {
  display: flex;
  gap: 1rem;
}

.tab-btn {
  padding: 0.75rem 2rem;
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  text-transform: uppercase;
  font-weight: 600;
}

.tab-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tab-btn.active {
  background-color: #2563eb;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.5);
}

.content-split {
  flex: 1;
  display: flex;
  gap: 2rem;
  overflow: hidden; /* Contain scroll within children */
}

.grid-section {
  flex: 3;
  background-color: rgba(30, 41, 59, 0.3);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.detail-section {
  flex: 2;
  background-color: #1e293b;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  padding: 2rem;
  overflow-y: auto;
}

/* Detail Card Styling */
.detail-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 1px solid #475569;
  padding-bottom: 1.5rem;
}

.detail-icon-large {
  font-size: 4rem;
  width: 6rem;
  height: 6rem;
  background-color: #0f172a;
  border: 2px solid #475569;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-title-group h3 {
  margin: 0;
  font-size: 2rem;
  color: #fbbf24;
}

.detail-subtitle {
  color: #94a3b8;
  font-size: 1.2rem;
  margin-top: 0.5rem;
  display: block;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row .label { color: #94a3b8; }
.info-row .value { color: #fff; font-weight: 500; }

.description-box h4 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

.description-box p {
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 1.05rem;
}

/* Stats Grid for Characters */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  background-color: #0f172a;
  padding: 1rem;
  border-radius: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label { color: #64748b; font-size: 0.8rem; font-weight: 700; }
.stat-val { color: #38bdf8; font-family: monospace; }

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-style: italic;
}
</style>

