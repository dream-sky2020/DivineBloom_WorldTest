<template>
  <div class="game-grid custom-scrollbar" :style="{ gridTemplateColumns: currentColumnsStyle }">
    <div 
      v-for="(item, index) in items" 
      :key="index"
      class="grid-item"
      :class="[
        mode, 
        { 'active': selectedIndex === index },
        { 'empty': !item || item.isEmpty },
        { 'locked': item && item.isLocked }
      ]"
      @click="handleSelect(index, item)"
      @mouseenter="hoveredIndex = index"
      @mouseleave="hoveredIndex = -1"
    >
      <!-- Mode: Icon Only -->
      <template v-if="mode === 'icon'">
        <div class="icon-wrapper">
          <GameIcon class="main-icon" :name="item?.icon || (item?.isEmpty ? 'icon_box' : 'icon_unknown')" />
          <div v-if="item && item.count && item.count > 1" class="icon-badge">{{ item.count }}</div>
        </div>
        
        <!-- Hover Tooltip for Icon Mode -->
          <div v-if="hoveredIndex === index && item && !item.isEmpty" class="hover-tooltip">
          <div class="tooltip-header">
            <span class="tooltip-title">{{ getLocalizedText(item.name) }}</span>
            <span v-if="item.subText" class="tooltip-sub">{{ getLocalizedText(item.subText) }}</span>
          </div>
          <div class="tooltip-body">{{ getLocalizedText(item.description) }}</div>
        </div>
      </template>

      <!-- Mode: List (Single Row) -->
      <template v-else-if="mode === 'list'">
        <div class="list-content">
          <div class="list-left">
            <GameIcon class="list-icon" :name="item?.icon || 'icon_box'" />
            <div class="list-info-group">
              <MarqueeText 
                class="list-title" 
                :text="item?.name ? getLocalizedText(item.name) : t('common.emptySlot')"
                :active="selectedIndex === index || hoveredIndex === index"
              />
              <span v-if="item?.subText" class="list-sub">{{ getLocalizedText(item.subText) }}</span>
            </div>
          </div>
          <div class="list-right">
            <span class="list-value">{{ item?.footerRight ? getLocalizedText(item.footerRight) : (item?.isEmpty ? '--' : '') }}</span>
          </div>
        </div>
        <div v-if="selectedIndex === index" class="selection-bar"></div>
      </template>

      <!-- Mode: Simple (Inventory Card Style) -->
      <template v-else-if="mode === 'simple'">
        <div class="card-header">
          <GameIcon class="card-icon" :name="item?.icon || 'icon_box'" />
          <MarqueeText 
            class="card-title" 
            :text="item?.name ? getLocalizedText(item.name) : t('common.emptySlot')"
            :active="selectedIndex === index || hoveredIndex === index"
          />
        </div>
        <div class="card-footer">
          <span class="footer-left">{{ item?.footerLeft ? getLocalizedText(item.footerLeft) : (item?.isEmpty ? '---' : '') }}</span>
          <span class="footer-right">{{ item?.footerRight ? getLocalizedText(item.footerRight) : (item?.isEmpty ? '--' : '') }}</span>
        </div>
        <div v-if="selectedIndex === index" class="selection-triangle"></div>
      </template>

      <!-- Mode: Detailed (Skills Card Style) -->
      <template v-else-if="mode === 'detailed'">
        <div class="card-header">
          <div class="card-icon-box" :class="{ 'grayscale': item?.isLocked }">
            <GameIcon :name="item?.icon || 'icon_unknown'" />
          </div>
          <div class="card-info">
             <MarqueeText 
               class="card-title" 
               :class="{ 'text-yellow': item?.highlight }"
               :text="item?.name ? getLocalizedText(item.name) : t('common.unknown')"
               :active="selectedIndex === index || hoveredIndex === index"
             />
             <div class="card-sub">{{ item?.subText ? getLocalizedText(item.subText) : '---' }}</div>
          </div>
        </div>
        <div class="card-footer">
          <span class="footer-left" :class="item?.footerLeftClass">{{ item?.footerLeft ? getLocalizedText(item.footerLeft) : '--' }}</span>
          <span class="footer-right" :class="item?.footerRightClass">{{ item?.footerRight ? getLocalizedText(item.footerRight) : '--' }}</span>
        </div>
        <div v-if="item?.tag" class="status-tag">{{ item.tag }}</div>
        <div v-if="item?.isLocked" class="lock-overlay">🔒</div>
        <!-- Removed selection-border to prevent layout shift -->
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import GameIcon from '@/components/ui/GameIcon.vue';
import MarqueeText from '@/components/ui/MarqueeText.vue';

const { t, te, locale } = useI18n();

const getLocalizedText = (input) => {
  if (!input) return '';
  if (typeof input === 'object') {
    return input[locale.value] || input['en'] || input['zh'] || Object.values(input)[0] || '';
  }
  // Try to translate if it looks like a key (no spaces) or if the key exists
  // Simple heuristic: keys usually don't have spaces. "5 MP" has a space.
  if (typeof input === 'string' && !input.includes(' ') && te(input)) {
      return t(input);
  }
  return input;
};

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String,
    default: 'simple', // 'simple', 'detailed', 'icon', 'list'
    validator: (value) => ['simple', 'detailed', 'icon', 'list'].includes(value)
  },
  columns: {
    type: Number,
    default: 4
  },
  modelValue: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue', 'select']);

const selectedIndex = ref(props.modelValue);
const hoveredIndex = ref(-1);

// Force 1 column for list mode, otherwise use prop
const currentColumnsStyle = computed(() => {
  const count = props.mode === 'list' ? 1 : props.columns;
  return `repeat(${count}, minmax(0, 1fr))`;
});

const handleSelect = (index, item) => {
  if (item && item.isLocked) return; 
  selectedIndex.value = index;
  emit('update:modelValue', index);
  emit('select', item);
};
</script>

<style scoped src="@styles/components/ui/GameDataGrid.css"></style>
