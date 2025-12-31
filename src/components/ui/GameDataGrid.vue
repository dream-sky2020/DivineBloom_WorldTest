<template>
  <div class="game-grid custom-scrollbar" :style="{ gridTemplateColumns: `repeat(${currentColumns}, 1fr)` }">
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
          <span class="main-icon">{{ item?.icon || (item?.isEmpty ? '📦' : '?') }}</span>
          <div v-if="item && item.count && item.count > 1" class="icon-badge">{{ item.count }}</div>
        </div>
        
        <!-- Hover Tooltip for Icon Mode -->
          <div v-if="hoveredIndex === index && item && !item.isEmpty" class="hover-tooltip">
          <div class="tooltip-header">
            <span class="tooltip-title">{{ t(item.name) }}</span>
            <span v-if="item.subText" class="tooltip-sub">{{ t(item.subText) }}</span>
          </div>
          <div class="tooltip-body">{{ t(item.description) }}</div>
        </div>
      </template>

      <!-- Mode: List (Single Row) -->
      <template v-else-if="mode === 'list'">
        <div class="list-content">
          <div class="list-left">
            <span class="list-icon">{{ item?.icon || '📦' }}</span>
            <div class="list-info-group">
              <span class="list-title">{{ item?.name ? t(item.name) : t('common.emptySlot') }}</span>
              <span v-if="item?.subText" class="list-sub">{{ t(item.subText) }}</span>
            </div>
          </div>
          <div class="list-right">
            <span class="list-value">{{ item?.footerRight ? t(item.footerRight) : (item?.isEmpty ? '--' : '') }}</span>
          </div>
        </div>
        <div v-if="selectedIndex === index" class="selection-bar"></div>
      </template>

      <!-- Mode: Simple (Inventory Card Style) -->
      <template v-else-if="mode === 'simple'">
        <div class="card-header">
          <span class="card-icon">{{ item?.icon || '📦' }}</span>
          <span class="card-title">{{ item?.name ? t(item.name) : t('common.emptySlot') }}</span>
        </div>
        <div class="card-footer">
          <span class="footer-left">{{ item?.footerLeft ? t(item.footerLeft) : (item?.isEmpty ? '---' : '') }}</span>
          <span class="footer-right">{{ item?.footerRight ? t(item.footerRight) : (item?.isEmpty ? '--' : '') }}</span>
        </div>
        <div v-if="selectedIndex === index" class="selection-triangle"></div>
      </template>

      <!-- Mode: Detailed (Skills Card Style) -->
      <template v-else-if="mode === 'detailed'">
        <div class="card-header">
          <div class="card-icon-box" :class="{ 'grayscale': item?.isLocked }">
            {{ item?.icon || '?' }}
          </div>
          <div class="card-info">
             <div class="card-title" :class="{ 'text-yellow': item?.highlight }">
               {{ item?.name ? t(item.name) : t('common.unknown') }}
             </div>
             <div class="card-sub">{{ item?.subText ? t(item.subText) : '---' }}</div>
          </div>
        </div>
        <div class="card-footer">
          <span class="footer-left" :class="item?.footerLeftClass">{{ item?.footerLeft ? t(item.footerLeft) : '--' }}</span>
          <span class="footer-right" :class="item?.footerRightClass">{{ item?.footerRight ? t(item.footerRight) : '--' }}</span>
        </div>
        <div v-if="item?.tag" class="status-tag">{{ item.tag }}</div>
        <div v-if="item?.isLocked" class="lock-overlay">🔒</div>
        <div v-if="selectedIndex === index" class="selection-border"></div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
const currentColumns = computed(() => {
  return props.mode === 'list' ? 1 : props.columns;
});

const handleSelect = (index, item) => {
  if (item && item.isLocked) return; 
  selectedIndex.value = index;
  emit('update:modelValue', index);
  emit('select', item);
};
</script>

<style scoped>
.game-grid {
  display: grid;
  gap: 1rem;
  overflow-y: auto;
  padding: 0.5rem;
  align-content: start; /* 确保内容不足时靠上对齐，而不是分散在整个高度 */
}

.grid-item {
  position: relative;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid #475569;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.grid-item:hover {
  background-color: var(--slate-700);
  border-color: rgba(255, 255, 255, 0.5);
  z-index: 10;
}

.grid-item.active {
  background-color: rgba(30, 58, 138, 0.6);
  border-color: var(--blue-400);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.grid-item.empty { opacity: 0.7; }
.grid-item.locked {
  background-color: rgba(15, 23, 42, 0.6);
  opacity: 0.6;
  border-style: dashed;
}

/* --- Mode: Icon --- */
.grid-item.icon {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.icon-wrapper { position: relative; }
.icon-badge {
  position: absolute;
  bottom: -0.5rem;
  right: -0.5rem;
  background-color: var(--slate-900);
  border: 1px solid var(--slate-600);
  color: white;
  font-size: 0.75rem;
  padding: 0 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.hover-tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--blue-500);
  padding: 0.75rem;
  width: 200px;
  border-radius: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  z-index: 100;
  pointer-events: none;
}

.tooltip-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.25rem;
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.tooltip-title { font-weight: 700; color: var(--blue-200); }
.tooltip-sub { font-size: 0.75rem; color: var(--slate-400); }
.tooltip-body { font-size: 0.8rem; color: var(--slate-300); line-height: 1.4; }

/* --- Mode: List --- */
.grid-item.list {
  padding: 0.75rem 1.5rem;
  height: auto;
}

.list-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.list-icon {
  font-size: 1.5rem;
  width: 2rem;
  text-align: center;
}

.list-info-group {
  display: flex;
  flex-direction: column;
}

.list-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--slate-300);
}

.grid-item.list:hover .list-title,
.grid-item.list.active .list-title {
  color: white;
}

.list-sub {
  font-size: 0.8rem;
  color: var(--slate-500);
}

.list-right {
  font-family: monospace;
  font-size: 1.2rem;
  color: var(--slate-400);
}

.grid-item.list:hover .list-right,
.grid-item.list.active .list-right {
  color: white;
}

.selection-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--blue-500);
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}

/* --- Mode: Simple --- */
.grid-item.simple {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.simple .card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.simple .card-icon { font-size: 1.5rem; opacity: 0.8; }
.simple .card-title {
  font-weight: 500;
  color: var(--slate-300);
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.grid-item.simple:hover .card-title,
.grid-item.simple.active .card-title { color: white; }

.simple .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
}
.simple .footer-left { font-size: 0.75rem; color: var(--slate-500); }
.simple .footer-right { font-family: monospace; font-size: 1.1rem; color: var(--slate-400); }
.grid-item.simple:hover .footer-right,
.grid-item.simple.active .footer-right { color: white; }

.selection-triangle {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 0.75rem;
  height: 0.75rem;
  background-color: var(--blue-400);
  transform: rotate(45deg);
}

/* --- Mode: Detailed --- */
.grid-item.detailed {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.detailed .card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.detailed .card-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.detailed .card-info { flex: 1; overflow: hidden; }
.detailed .card-title { font-weight: 700; color: var(--slate-300); font-size: 1.1rem; }
.detailed .card-sub { font-size: 0.75rem; color: var(--slate-500); }
.detailed .card-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
  font-size: 0.8rem;
}
.detailed .status-tag {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.6rem;
  font-weight: 700;
  border: 1px solid var(--slate-500);
  color: var(--slate-500);
  padding: 0 0.25rem;
  border-radius: 0.125rem;
}
.grid-item.detailed.active .status-tag {
  border-color: var(--yellow-400);
  color: var(--yellow-400);
}
.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  opacity: 0.3;
  pointer-events: none;
}

/* Common Utilities */
.text-yellow { color: var(--yellow-400) !important; }
.text-blue { color: var(--blue-400) !important; }
.text-green { color: var(--green-500) !important; }
.grayscale { filter: grayscale(1); }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
</style>
