<template>
  <div 
    class="formation-slot"
    :class="{ 
      'is-selected': isSelected,
      'is-target': isTarget
    }"
    @click="handleClick"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :draggable="!!character"
  >
    <div v-if="character" class="formation-card" :class="{ 'selected': isSelected, 'target': isTarget }">
        <div class="card-header">
          <span class="char-name">{{ getLocalizedName(character.name) }}</span>
          <GameIcon class="element-icon" name="icon_fire" />
        </div>
        
        <div class="card-avatar-container">
           <div class="avatar-placeholder" :style="{ backgroundColor: getRoleColor(character.role) }">
             {{ character.name.en.charAt(0) }}
           </div>
        </div>
        
        <div class="card-stats">
          <div class="stat-row hp">
            <label>HP</label>
            <div class="bar-container">
              <div class="bar-fill" :style="{ transform: `scaleX(${character.currentHp / character.maxHp})` }"></div>
              <span class="bar-text">{{ character.currentHp }}/{{ character.maxHp }}</span>
            </div>
          </div>
          <div class="stat-row mp">
            <label>MP</label>
            <div class="bar-container">
              <div class="bar-fill" :style="{ transform: `scaleX(${character.currentMp / character.maxMp})` }"></div>
               <span class="bar-text">{{ character.currentMp }}/{{ character.maxMp }}</span>
            </div>
          </div>
        </div>
    </div>
    
    <div v-else class="formation-card empty-slot" :class="{ 'selected': isSelected, 'target': isTarget }">
        <span v-t="'common.empty'"></span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import GameIcon from '@/interface/ui/GameIcon.vue';
import { getRoleColor } from '@/utils/battleUIUtils';

const props = defineProps({
  character: {
    type: Object,
    default: null
  },
  index: {
    type: Number,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isTarget: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'drop', 'hover-enter', 'hover-leave']);
const { locale } = useI18n();

const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[locale.value] || nameObj.en || nameObj.zh || '';
};

const handleClick = () => {
    emit('select', props.index);
};

const handleDragStart = (e) => {
    if (props.character) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', props.index.toString());
        emit('select', props.index); // Select on drag start
    }
};

const handleDragOver = (e) => {
    // Just emitting hover-enter to show potential drop target
    emit('hover-enter', props.index);
};

const handleDragLeave = (e) => {
     emit('hover-leave', props.index);
};

const handleDrop = (e) => {
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(fromIndex) && fromIndex !== props.index) {
        emit('drop', { from: fromIndex, to: props.index });
    }
    emit('hover-leave', props.index); // Clear target state on drop
};

const handleDragEnd = () => {
    // Ensure all hover states are cleared if drag is cancelled or ends
    // But parent handles global state usually. 
    // We can't easily clear parent state from here without an event, 
    // but dragleave/drop usually covers it. 
    // 'drop' event on parent container or elsewhere could clear global 'targetIndex'
};

const handleMouseEnter = () => {
    // Only meaningful if we are in "selection mode" (something is selected)
    // We delegate this logic to parent via event
    emit('hover-enter', props.index);
};

const handleMouseLeave = () => {
    emit('hover-leave', props.index);
};

</script>

<style scoped src="@styles/ui/FormationFrontCard.css"></style>
<style scoped>
.formation-slot {
    width: 100%;
    height: 100%;
}
</style>
