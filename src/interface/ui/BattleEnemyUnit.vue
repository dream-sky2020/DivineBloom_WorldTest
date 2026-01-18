<template>
  <div 
    class="enemy-unit" 
    :class="{ 
      'boss-unit': enemy.isBoss, 
      'selectable': enemy.isSelectable && !enemy.isDead,
      'dead': enemy.isDead,
      'dying': enemy.isDying
    }"
    @click="onEnemyClick"
  >
    <!-- Enemy Avatar -->
    <div class="enemy-avatar-wrapper">
      <div class="enemy-avatar" :style="{ backgroundColor: enemy.roleColor || '#ff0055' }">
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
        <div class="enemy-hp-bar" :style="{ width: enemy.hpPercent + '%' }"></div>
        <span class="hp-text">{{ enemy.hp }} / {{ enemy.maxHp }}</span>
      </div>
      <!-- Enemy ATB Bar -->
      <div class="enemy-atb-container">
        <div class="atb-bar" :class="{ 'no-transition': enemy.atbNoTransition }" :style="{ width: (enemy.atbPercent || 0) + '%' }"></div>
      </div>

      <!-- Enemy Status Row -->
      <div class="status-row">
         <template v-if="enemy.statusEffects && enemy.statusEffects.length > 0">
           <div 
             v-for="st in enemy.statusEffects" 
             :key="st.id" 
             class="status-icon" 
             :class="st.class"
             :title="st.tooltip"
           >
              <span class="icon-content"><GameIcon :name="st.icon" /></span>
              <span class="status-duration">{{ st.duration }}</span>
           </div>
         </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import GameIcon from '@/interface/ui/GameIcon.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  enemy: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const { locale } = useI18n();

const onEnemyClick = () => {
  if (props.enemy.isSelectable) {
    emit('click', props.enemy);
  }
};

const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[locale.value] || nameObj.en || nameObj.zh || '';
};
</script>

<style scoped src="@styles/ui/BattleEnemyUnit.css"></style>
