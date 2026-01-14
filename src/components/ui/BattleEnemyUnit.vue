<template>
  <div 
    class="enemy-unit" 
    :class="{ 
      'boss-unit': enemy.isBoss, 
      'selectable': isSelectable && enemy.currentHp > 0 
    }"
    @click="onEnemyClick"
  >
    <!-- Enemy Avatar -->
    <div class="enemy-avatar-wrapper">
      <div class="enemy-avatar" :style="{ backgroundColor: enemy.color || '#ff0055' }">
        {{ enemy.name?.en?.charAt(0) || 'E' }}
      </div>
    </div>
    
    <!-- Info -->
    <div class="enemy-info">
      <div class="enemy-header">
        <span class="enemy-name">{{ getLocalizedName(enemy.name) || 'Enemy' }}</span>
        <span v-if="enemy.isBoss" class="boss-tag">BOSS</span>
      </div>
      <div class="enemy-hp-container">
        <div class="enemy-hp-bar" :style="{ width: (enemy.currentHp / enemy.maxHp * 100) + '%' }"></div>
        <span class="hp-text">{{ enemy.currentHp }} / {{ enemy.maxHp }}</span>
      </div>
      <!-- Enemy ATB Bar -->
      <div class="enemy-atb-container">
        <div class="atb-bar" :class="{ 'no-transition': (enemy.atb || 0) < 5 }" :style="{ width: ((enemy.atb > 0 ? enemy.atb : 0) || 0) + '%' }"></div>
      </div>

      <!-- Enemy Status Row -->
      <div class="status-row">
         <template v-if="enemy.statusEffects && enemy.statusEffects.length > 0">
           <div 
             v-for="st in enemy.statusEffects" 
             :key="st.id" 
             class="status-icon" 
             :class="getStatusClass(st.id)"
             :title="getStatusTooltip(st)"
           >
              <span class="icon-content"><GameIcon :name="getStatusIcon(st.id)" /></span>
              <span class="status-duration">{{ st.duration }}</span>
           </div>
         </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  getStatusClass, 
  getStatusTooltip, 
  getStatusIcon 
} from '@/utils/battleUIUtils';
import GameIcon from '@/components/ui/GameIcon.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  enemy: {
    type: Object,
    required: true
  },
  isSelectingTarget: {
    type: Boolean,
    default: false
  },
  isSelectable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const { locale } = useI18n();

const onEnemyClick = () => {
  if (props.isSelectable) {
    emit('click', props.enemy);
  }
};

const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[locale.value] || nameObj.en || nameObj.zh || '';
};
</script>

<style scoped src="@styles/components/ui/BattleEnemyUnit.css"></style>
