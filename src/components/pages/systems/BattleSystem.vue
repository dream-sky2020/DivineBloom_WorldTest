<template>
  <div class="battle-system">
    <!-- Action Prompt - Moved to Top -->
    <BattleTopBar 
      :is-selecting-target="isSelectingTarget"
      :battle-state="battleState"
      :active-character="activeCharacter"
      @cancel-selection="cancelSelection"
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
        v-for="enemy in enemies" 
        :key="enemy.uuid" 
        :enemy="enemy"
        :is-selectable="validTargetIds.includes(enemy.uuid)"
        @click="onEnemyClick"
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
      @action="handleAction"
      @open-skill-menu="openSkillMenu"
      @close-skill-menu="showSkillMenu = false"
      @open-item-menu="openItemMenu"
      @close-item-menu="showItemMenu = false"
      @select-skill="selectSkill"
      @select-item="selectItem"
      @adjust-boost="battleStore.adjustBoost"
    />

    <!-- Battle Log Display -->
    <BattleLog :battle-log="battleLog" />

    <!-- Party Area -->
    <div class="party-zone">
      <BattlePartySlot 
        v-for="(slot, index) in partySlots" 
        :key="index" 
        :slot="slot"
        :compact="compactPartyMode"
        :view-mode="partyViewMode"
        :is-active-turn="isSlotActive(slot)"
        :valid-target-ids="validTargetIds"
        @click-character="onCharacterClick"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import { storeToRefs } from 'pinia';
import { skillsDb } from '@/data/skills';
import BattleEnemyUnit from '@/components/ui/BattleEnemyUnit.vue';
import BattlePartySlot from '@/components/ui/BattlePartySlot.vue';
import BattleActionMenu from '@/components/ui/BattleActionMenu.vue';
import BattleTopBar from '@/components/ui/BattleTopBar.vue';
import BattleSpeedControl from '@/components/ui/BattleSpeedControl.vue';
import BattleViewToggle from '@/components/ui/BattleViewToggle.vue';
import BattleLog from '@/components/ui/BattleLog.vue';

const emit = defineEmits(['change-system']);

const gameStore = useGameStore();
const battleStore = gameStore.battle;
const settingsStore = gameStore.settings;
// removed activeSlotIndex
const { 
    enemies, 
    partySlots, 
    activeCharacter, 
    battleLog, 
    battleState, 
    battleItems, 
    boostLevel, 
    waitingForInput,
    pendingAction,
    validTargetIds
} = storeToRefs(battleStore);
const { battleSpeed: gameSpeed } = storeToRefs(settingsStore);

// Only show action menu if waiting for input
const menuActiveCharacter = computed(() => {
    return waitingForInput.value ? activeCharacter.value : null;
});

let animationFrameId = null;
let lastTime = 0;
// gameSpeed moved to settingsStore

// Watch for Battle End
watch(battleState, (newState) => {
  if (newState === 'victory') {
    setTimeout(() => {
      emit('change-system', 'world-map');
    }, 2500); 
  } else if (newState === 'flee') {
    setTimeout(() => {
      emit('change-system', 'world-map');
    }, 1500); // Shorter delay for flee
  }
});
const partyViewMode = ref('default');
const compactPartyMode = ref(true);

const showSkillMenu = ref(false);
const showItemMenu = ref(false);

const isSelectingTarget = computed(() => !!pendingAction.value);

const isSlotActive = (slot) => {
    if (!activeCharacter.value) return false;
    // Check if slot.front matches activeCharacter
    return slot.front && slot.front.id === activeCharacter.value.id;
};

const canSwitch = computed(() => {
    if (!activeCharacter.value) return false;
    // Find slot for active character
    const slot = partySlots.value.find(s => s.front && s.front.id === activeCharacter.value.id);
    // Can switch if back row exists AND is alive
    return slot && slot.back && slot.back.currentHp > 0;
});

const characterSkills = computed(() => {
  if (!activeCharacter.value) return [];
  
  // Use equipped active skills for players if available, otherwise fallback to all skills (enemies)
  const skillIds = (activeCharacter.value.equippedActiveSkills && activeCharacter.value.equippedActiveSkills.length > 0) 
      ? activeCharacter.value.equippedActiveSkills 
      : (activeCharacter.value.skills || []);

  return skillIds.map(id => {
      const skill = skillsDb[id];
      if (!skill) return null;
      // Parse cost "10 MP" -> 10
      const mpCost = parseInt(skill.cost) || 0;
      const isUsable = battleStore.checkSkillUsability(id);
      return { ...skill, mpCost, isUsable };
  }).filter(Boolean);
});

// ATB Loop
const gameLoop = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const dt = ((timestamp - lastTime) / 1000) * gameSpeed.value;
    lastTime = timestamp;

    battleStore.updateATB(dt);
    animationFrameId = requestAnimationFrame(gameLoop);
};

const openSkillMenu = () => {
    showSkillMenu.value = true;
};

const openItemMenu = () => {
    showItemMenu.value = true;
};

const selectSkill = (skill) => {
    if (!battleStore.checkSkillUsability(skill.id)) {
        return;
    }
    
    const needsSelection = ['ally', 'deadAlly', 'enemy'].includes(skill.targetType);

    if (needsSelection) {
        battleStore.setPendingAction({ 
            type: 'skill', 
            targetType: skill.targetType, 
            data: { skillId: skill.id } 
        });
    } else {
        battleStore.playerAction('skill', skill.id);
    }
    showSkillMenu.value = false;
};

const selectItem = (item) => {
    const targetType = item.targetType || 'ally';
    const needsSelection = ['ally', 'deadAlly', 'enemy'].includes(targetType);

    if (needsSelection) {
        battleStore.setPendingAction({ 
            type: 'item', 
            targetType: targetType, 
            data: { itemId: item.id } 
        });
    } else {
        battleStore.playerAction('item', { itemId: item.id, targetId: null });
    }
    showItemMenu.value = false;
};

const cancelSelection = () => {
    battleStore.setPendingAction(null);
};

const onEnemyClick = (enemy) => {
    handleTargetClick(enemy);
};

const onCharacterClick = (character) => {
    handleTargetClick(character);
};

const handleTargetClick = (unit) => {
    if (!unit || !validTargetIds.value.includes(unit.uuid)) return;

    const action = pendingAction.value;
    if (!action) return;

    if (action.type === 'attack') {
        battleStore.playerAction('attack', { targetId: unit.uuid });
    } else if (action.type === 'skill') {
        battleStore.playerAction('skill', { skillId: action.data.skillId, targetId: unit.uuid });
    } else if (action.type === 'item') {
        battleStore.playerAction('item', { itemId: action.data.itemId, targetId: unit.uuid });
    }
    
    battleStore.setPendingAction(null);
};

const handleAction = (actionType) => {
  if (actionType === 'attack') {
      battleStore.setPendingAction({ 
          type: 'attack', 
          targetType: 'enemy', 
          data: {} 
      });
  } else {
      battleStore.playerAction(actionType);
  }
};

onMounted(() => {
  // Fix: 只有在战斗未激活时才初始化（例如调试或刷新页面时）
  // 从 WorldMap 进入时，状态已经是 'active'，且敌人数据已设置
  if (battleState.value !== 'active') {
    battleStore.initBattle();
  }
  animationFrameId = requestAnimationFrame(gameLoop);
});

onBeforeUnmount(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped src="@styles/components/pages/systems/BattleSystem.css"></style>
