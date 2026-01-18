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
                <GameIcon :name="selectedItem.icon || 'icon_unknown'" />
              </div>
              <div class="detail-title-group">
                <h3 class="detail-name" :style="{ color: selectedItem.color }">{{ getLocalizedText(selectedItem.name) }}</h3>
                <span v-if="selectedItem.isBoss" class="boss-badge">BOSS</span>
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
                <p>{{ getLocalizedText(selectedItem.description) }}</p>
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

              <!-- Character Skills (Players Only) -->
              <div v-if="currentTab === 'characters' && selectedItem.skills && selectedItem.skills.length > 0" class="skills-preview">
                 <h4 v-t="'panels.skills'"></h4>
                 <div class="skills-list">
                   <div v-for="skillId in selectedItem.skills" :key="skillId" class="skill-tag">
                     {{ getSkillName(skillId) }}
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
import GameDataGrid from '@/interface/ui/GameDataGrid.vue';
import GameIcon from '@/interface/ui/GameIcon.vue';
import { charactersDb } from '@/data/characters.js';
import { itemsDb } from '@/data/items.js';
import { statusDb } from '@/data/status.js';
import { skillsDb } from '@/data/skills.js';

const { t, locale } = useI18n();

const getLocalizedText = (input) => {
  if (!input) return '';
  if (typeof input === 'object') {
    return input[locale.value] || input['en'] || input['zh'] || Object.values(input)[0] || '';
  }
  return t(input);
};

const getSkillName = (skillId) => {
  const skill = skillsDb[skillId];
  return skill ? getLocalizedText(skill.name) : '???';
};

const tabs = computed(() => [
  { id: 'characters', label: t('panels.characters') }, 
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
    icon: 'icon_user', // Default icon for characters
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
  return getLocalizedText(item.subText) || t(item.type);
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
      [t('labels.effect')]: getLocalizedText(i.subText)
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
      [t('labels.effect')]: getLocalizedText(i.subText)
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

<style scoped src="@styles/pages/systems/EncyclopediaSystem.css"></style>
