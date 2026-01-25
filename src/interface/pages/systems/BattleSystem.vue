<template>
  <div class="battle-system">
    <!-- Action Prompt - Moved to Top -->
    <BattleTopBar 
      :is-selecting-target="isSelectingTarget"
      :battle-state="battleState"
      :active-character="activeCharacter"
      @cancel-selection="battleStore.setPendingAction(null)"
    />

    <!-- Speed Control -->
    <BattleSpeedControl 
      v-model:speed="gameSpeed"
    />

    <!-- View Toggle -->
    <div class="view-toggle-pos">
      <BattleViewToggle v-model="partyViewMode" />
    </div>

    <!-- Enemies Area -->
    <div class="enemy-zone">
      <BattleEnemyUnit 
        v-for="enemy in enemiesDisplay" 
        :key="enemy.uuid" 
        :enemy="enemy"
        @click="ctrl.handleTargetClick($event)"
      />
    </div>

    <!-- Battle UI Layer (Action Menu) -->
    <BattleActionMenu 
      :active-character="menuActiveCharacter"
      :show-skill-menu="showSkillMenu"
      :show-item-menu="showItemMenu"
      :is-selecting-target="isSelectingTarget"
      :character-skills="characterSkills"
      :battle-items="battleItems"
      :can-switch="canSwitch"
      :boost-level="boostLevel"
      @action="ctrl.handleAction"
      @open-skill-menu="showSkillMenu = true"
      @close-skill-menu="showSkillMenu = false"
      @open-item-menu="showItemMenu = true"
      @close-item-menu="showItemMenu = false"
      @select-skill="ctrl.selectSkill"
      @select-item="ctrl.selectItem"
      @adjust-boost="battleStore.adjustBoost"
    />

    <!-- Equipment/Reorganize Overlay -->
    <div class="equipment-overlay" v-if="showEquipmentMenu">
      <div class="equipment-container">
        <div class="equipment-header">
          <h3>{{ t('battle.actionReorganize') }}</h3>
          <div class="header-btns">
            <button 
                class="reset-btn" 
                @click="ctrl.resetReorganize()" 
                :class="{ 'btn-disabled': !hasReorganized }"
                :disabled="!hasReorganized"
            >{{ t('battle.reset') || 'Reset' }}</button>
            <button 
                class="confirm-btn" 
                @click="ctrl.confirmReorganize()" 
                :class="{ 'btn-disabled': !hasReorganized }"
                :disabled="!hasReorganized"
            >{{ t('battle.confirm') || 'OK' }}</button>
            <button class="cancel-btn" @click="ctrl.cancelReorganize()">{{ t('battle.cancel') }}</button>
          </div>
        </div>
        <div class="equipment-body">
          <SkillsPanel 
            :lock-character-id="activeCharacter?.id"
            @change="ctrl.markReorganized()" 
          />
        </div>
      </div>
    </div>

    <!-- Battle Log Display -->
    <BattleLog :battle-log="battleLog" />

    <!-- Party Area -->
    <div class="party-zone">
      <BattlePartySlot 
        v-for="(slot, index) in partySlotsDisplay" 
        :key="index" 
        :slot="slot"
        :compact="compactPartyMode"
        :view-mode="partyViewMode"
        :is-active-turn="ctrl.isSlotActive(slot)"
        @click-character="ctrl.handleTargetClick($event)"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import { storeToRefs } from 'pinia';
import { BattleController } from '@/game/interface/battle/BattleController';
import BattleEnemyUnit from '@/interface/ui/BattleEnemyUnit.vue';
import BattlePartySlot from '@/interface/ui/BattlePartySlot.vue';
import BattleActionMenu from '@/interface/ui/BattleActionMenu.vue';
import BattleTopBar from '@/interface/ui/BattleTopBar.vue';
import BattleSpeedControl from '@/interface/ui/BattleSpeedControl.vue';
import BattleViewToggle from '@/interface/ui/BattleViewToggle.vue';
import BattleLog from '@/interface/ui/BattleLog.vue';
import SkillsPanel from '@/interface/panels/SkillsPanel.vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['change-system']);

const { t } = useI18n();
const gameStore = useGameStore();
const battleStore = gameStore.battle;
const settingsStore = gameStore.settings;

const ctrl = new BattleController();
const partyViewMode = ctrl.partyViewMode;
const compactPartyMode = ctrl.compactPartyMode;
const showSkillMenu = ctrl.showSkillMenu;
const showItemMenu = ctrl.showItemMenu;
const showEquipmentMenu = ctrl.showEquipmentMenu;
const hasReorganized = ctrl.hasReorganized;

// 提取计算属性以保持模板中的响应性
const isSelectingTarget = ctrl.isSelectingTarget;
const menuActiveCharacter = ctrl.menuActiveCharacter;
const canSwitch = ctrl.canSwitch;
const characterSkills = ctrl.characterSkills;

const { 
    enemiesDisplay,
    partySlotsDisplay,
    activeCharacter, 
    battleLog, 
    battleState, 
    battleItems, 
    boostLevel, 
} = storeToRefs(battleStore);

const { battleSpeed: gameSpeed } = storeToRefs(settingsStore);

// Watch for Battle End
watch(battleState, (newState) => {
  if (newState === 'victory') {
    setTimeout(() => {
      emit('change-system', 'world-map');
    }, 2500); 
  } else if (newState === 'flee') {
    setTimeout(() => {
      emit('change-system', 'world-map');
    }, 1500); 
  }
});

onMounted(() => {
  ctrl.startLoop();
});

onBeforeUnmount(() => {
  ctrl.stopLoop();
});
</script>

<style scoped src="@styles/pages/systems/BattleSystem.css"></style>
