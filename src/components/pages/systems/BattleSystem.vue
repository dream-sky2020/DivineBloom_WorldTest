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
        :is-selecting-target="isSelectingTarget"
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
        :selection-context="{ isSelectingAlly, isSelectingDead }"
        @click-character="onCharacterClick"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue';
import { useBattleStore } from '@/stores/battle';
import { useSettingsStore } from '@/stores/settings';
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

const battleStore = useBattleStore();
const settingsStore = useSettingsStore();
// removed activeSlotIndex
const { enemies, partySlots, activeCharacter, battleLog, battleState, battleItems, boostLevel, waitingForInput } = storeToRefs(battleStore);
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
const pendingAction = ref(null); // { type: 'attack' | 'skill' | 'item', skillId?: number, itemId?: number, targetType?: string }

const isSelectingTarget = computed(() => !!pendingAction.value);
const isSelectingAlly = computed(() => pendingAction.value?.targetType === 'ally' || pendingAction.value?.targetType === 'deadAlly');
const isSelectingDead = computed(() => pendingAction.value?.targetType === 'deadAlly');

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
  if (!activeCharacter.value || !activeCharacter.value.skills) return [];
  return activeCharacter.value.skills.map(id => {
      const skill = skillsDb[id];
      if (!skill) return null;
      // Parse cost "10 MP" -> 10
      const mpCost = parseInt(skill.cost) || 0;
      return { ...skill, mpCost };
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
    if (activeCharacter.value.currentMp < skill.mpCost) {
        return;
    }
    
    // Check target type from data
    if (skill.targetType === 'ally' || skill.targetType === 'deadAlly' || skill.targetType === 'enemy') {
        // Requires Selection
        pendingAction.value = { type: 'skill', skillId: skill.id, targetType: skill.targetType };
    } else if (skill.targetType === 'allDeadAllies' || skill.targetType === 'allAllies' || skill.targetType === 'allUnits' || skill.targetType === 'allOtherUnits' || skill.targetType === 'allOtherAllies' || skill.targetType === 'randomEnemy') {
         // Instant Cast (Mass Revive / Mass Heal / Global / Multi-Target / Random)
         battleStore.playerAction('skill', skill.id);
    } else {
        // Instant Cast (Self, AoE, etc.)
        battleStore.playerAction('skill', skill.id);
    }
    showSkillMenu.value = false;
};

const selectItem = (item) => {
    const targetType = item.targetType || 'ally'; // default to ally if not set
    
    if (targetType === 'enemy') {
        pendingAction.value = { type: 'item', itemId: item.id, targetType: 'enemy' };
    } else if (targetType === 'deadAlly') {
         pendingAction.value = { type: 'item', itemId: item.id, targetType: 'deadAlly' };
    } else if (targetType === 'allDeadAllies' || targetType === 'allAllies' || targetType === 'allEnemies') {
         // Instant cast for mass revive / mass heal / mass attack item
         battleStore.playerAction('item', { itemId: item.id, targetId: null });
         showItemMenu.value = false;
    } else {
         // Default ally (alive)
         pendingAction.value = { type: 'item', itemId: item.id, targetType: 'ally' };
    }
    showItemMenu.value = false;
};

const cancelSelection = () => {
    pendingAction.value = null;
};

const onEnemyClick = (enemy) => {
    if (!isSelectingTarget.value) return;
    if (pendingAction.value.targetType !== 'enemy' && pendingAction.value.type !== 'attack' && pendingAction.value.type !== 'skill') return;
    if (enemy.currentHp <= 0) return;

    const action = pendingAction.value;
    if (action.type === 'attack') {
        battleStore.playerAction('attack', { targetId: enemy.uuid });
    } else if (action.type === 'skill') {
        battleStore.playerAction('skill', { skillId: action.skillId, targetId: enemy.uuid });
    } else if (action.type === 'item') {
        battleStore.playerAction('item', { itemId: action.itemId, targetId: enemy.uuid });
    }
    
    pendingAction.value = null;
};

const onCharacterClick = (character) => {
    if (!isSelectingAlly.value) return;
    if (!character) return;
    
    // Validation
    if (isSelectingDead.value && character.currentHp > 0) return; // Must be dead
    if (!isSelectingDead.value && character.currentHp <= 0) return; // Must be alive
    
    const action = pendingAction.value;
    if (action.type === 'item') {
         battleStore.playerAction('item', { itemId: action.itemId, targetId: character.uuid || character.id });
    } else if (action.type === 'skill') {
         battleStore.playerAction('skill', { skillId: action.skillId, targetId: character.uuid || character.id });
    }
    
    pendingAction.value = null;
};

const handleAction = (actionType) => {
  if (actionType === 'attack') {
      pendingAction.value = { type: 'attack' };
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
