<template>
  <div class="top-action-bar">
       <div v-if="isSelectingTarget" class="selection-message">
           {{ t('battle.selectTarget') }}
           <button class="cancel-btn" @click="$emit('cancel-selection')">{{ t('battle.cancel') }}</button>
       </div>
       <span v-else-if="battleState === 'active' && activeCharacter">{{ getLocalizedName(activeCharacter.name) }}{{ t('battle.turn') }}</span>
       <span v-else-if="battleState === 'victory'" style="color: #fbbf24">{{ t('battle.victory') }}</span>
       <span v-else-if="battleState === 'defeat'" style="color: #9ca3af">{{ t('battle.defeat') }}</span>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
  isSelectingTarget: Boolean,
  battleState: String,
  activeCharacter: Object
});

defineEmits(['cancel-selection']);

const { t, locale } = useI18n();

const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[locale.value] || nameObj['en'] || nameObj['zh'] || '???';
};
</script>

<style scoped src="@styles/ui/BattleTopBar.css"></style>
