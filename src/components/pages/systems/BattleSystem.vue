<template>
  <div class="battle-system">
    <!-- Action Prompt - Moved to Top -->
    <div class="top-action-bar">
         <div v-if="isSelectingTarget" class="selection-message">
             请选择目标... 
             <button class="cancel-btn" @click="cancelSelection">取消</button>
         </div>
         <span v-else-if="battleState === 'player_turn' && activeCharacter">{{ activeCharacter.name.zh }} 的回合</span>
         <span v-else-if="battleState === 'enemy_turn'" style="color: #ef4444">敌方回合...</span>
         <span v-else-if="battleState === 'victory'" style="color: #fbbf24">战斗胜利!</span>
         <span v-else-if="battleState === 'defeat'" style="color: #9ca3af">战斗失败...</span>
    </div>

    <!-- Enemies Area -->
    <div class="enemy-zone">
      <div 
        v-for="(enemy, index) in enemies" 
        :key="enemy.id" 
        class="enemy-unit" 
        :class="{ 'boss-unit': enemy.isBoss, 'selectable': isSelectingTarget && enemy.hp > 0 }"
        @click="onEnemyClick(enemy)"
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
            <span class="enemy-name">{{ enemy.name ? enemy.name.zh : `Enemy ${index + 1}` }}</span>
            <span v-if="enemy.isBoss" class="boss-tag">BOSS</span>
          </div>
          <div class="enemy-hp-container">
            <div class="enemy-hp-bar" :style="{ width: (enemy.hp / enemy.maxHp * 100) + '%' }"></div>
            <span class="hp-text">{{ enemy.hp }} / {{ enemy.maxHp }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Battle UI Layer (Action Menu) -->
    <div class="battle-ui-layer" v-if="activeCharacter">
       
       <!-- Skill Selection Overlay -->
       <div class="skill-menu-overlay" v-if="showSkillMenu">
         <div class="skill-menu-panel">
            <div class="skill-header">
              <h3>{{ activeCharacter.name.zh }} 的技能</h3>
              <button class="close-btn" @click="showSkillMenu = false">×</button>
            </div>
            <div class="skill-list">
               <div 
                 v-for="skill in characterSkills" 
                 :key="skill.id" 
                 class="skill-item"
                 :class="{ 'disabled': skill.mpCost > activeCharacter.currentMp }"
                 @click="selectSkill(skill)"
               >
                  <span class="skill-icon">{{ skill.icon }}</span>
                  <div class="skill-details">
                    <span class="skill-name">{{ skill.name.zh }}</span>
                    <span class="skill-desc">{{ skill.subText.zh }}</span>
                  </div>
                  <span class="skill-cost">{{ skill.cost }}</span>
               </div>
               <div v-if="characterSkills.length === 0" class="no-skills">
                 暂无可用技能
               </div>
            </div>
         </div>
       </div>

       <!-- Item Selection Overlay -->
       <div class="skill-menu-overlay" v-else-if="showItemMenu">
         <div class="skill-menu-panel">
            <div class="skill-header">
              <h3>背包 (消耗品)</h3>
              <button class="close-btn" @click="showItemMenu = false">×</button>
            </div>
            <div class="skill-list">
               <div 
                 v-for="item in battleItems" 
                 :key="item.id" 
                 class="skill-item"
                 @click="selectItem(item)"
               >
                  <span class="skill-icon">{{ item.icon }}</span>
                  <div class="skill-details">
                    <span class="skill-name">{{ item.name.zh }}</span>
                    <span class="skill-desc">{{ item.description.zh }}</span>
                  </div>
                  <span class="skill-cost">x{{ item.count }}</span>
               </div>
               <div v-if="battleItems.length === 0" class="no-skills">
                 背包空空如也
               </div>
            </div>
         </div>
       </div>

       <!-- Action Menu - Centered or near character -->
       <div class="action-ring" v-else>
          <button class="action-btn attack" @click="handleAction('attack')">
            <span class="icon">⚔️</span>
            <span class="label">攻击</span>
          </button>
          <button class="action-btn skill" @click="openSkillMenu">
            <span class="icon">✨</span>
            <span class="label">技能</span>
          </button>
          <button class="action-btn defend" @click="handleAction('defend')">
            <span class="icon">🛡️</span>
            <span class="label">守备</span>
          </button>
          <button class="action-btn item" @click="openItemMenu">
            <span class="icon">🎒</span>
            <span class="label">道具</span>
          </button>
          <button class="action-btn switch" :class="{ 'disabled': !canSwitch }" @click="handleAction('switch')">
            <span class="icon">🔄</span>
            <span class="label">换位</span>
          </button>
           <button class="action-btn skip" @click="handleAction('skip')">
            <span class="icon">⏭️</span>
            <span class="label">空过</span>
          </button>
          <button class="action-btn bloom" @click="handleAction('bloom')">
            <span class="icon">🌸</span>
            <span class="label">怒放</span>
          </button>
       </div>
       
       <div class="battle-log" v-if="battleLog.length > 0">
          <div v-for="(log, i) in battleLog" :key="i">{{ log }}</div>
       </div>
    </div>

    <!-- Party Area -->
    <div class="party-zone">
      <div 
        v-for="(slot, index) in partySlots" 
        :key="index" 
        class="party-slot"
        :class="{ 
            'active-turn': activeSlotIndex === index
        }"
      >
        <!-- Front Row Character (Main Card) -->
        <div class="card front-card" v-if="slot.front" 
             :class="{ 
                 'dead': slot.front.currentHp <= 0,
                 'selectable': canSelect(slot.front)
             }"
             @click.stop="onCharacterClick(slot.front)"
        >
          <div class="card-header">
            <span class="char-name" :class="{ 'name-dead': slot.front.currentHp <= 0 }">{{ slot.front.name.zh }}</span>
            <span class="element-icon">🔥</span>
          </div>
          <div class="card-avatar-container">
             <!-- Placeholder Avatar -->
             <div class="avatar-placeholder" :style="{ backgroundColor: getRoleColor(slot.front.role) }">
               {{ slot.front.name.en.charAt(0) }}
             </div>
          </div>
          <div class="card-stats">
            <div class="stat-row hp">
              <label>HP</label>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: (slot.front.currentHp / slot.front.maxHp * 100) + '%' }"></div>
                <span class="bar-text">{{ slot.front.currentHp }}/{{ slot.front.maxHp }}</span>
              </div>
            </div>
            <div class="stat-row mp">
              <label>MP</label>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: (slot.front.currentMp / slot.front.maxMp * 100) + '%' }"></div>
                 <span class="bar-text">{{ slot.front.currentMp }}/{{ slot.front.maxMp }}</span>
              </div>
            </div>
            <div class="status-row">
              <div v-for="st in slot.front.statusEffects" :key="st" class="status-icon">{{ st }}</div>
            </div>
          </div>
        </div>
        <div class="empty-card-slot" v-else>Empty</div>

        <!-- Back Row Character (Reserve Card) -->
        <div class="card back-card" v-if="slot.back"
             :class="{ 
                 'dead': slot.back.currentHp <= 0,
                 'selectable': canSelect(slot.back) 
             }"
             @click.stop="onCharacterClick(slot.back)"
        >
           <div class="card-mini-header">
            <span class="char-name" :class="{ 'name-dead': slot.back.currentHp <= 0 }">{{ slot.back.name.zh }}</span>
          </div>
          <div class="card-mini-content">
             <div class="mini-avatar" :style="{ backgroundColor: getRoleColor(slot.back.role) }"></div>
             <div class="mini-stats">
               <div class="mini-bar hp" :style="{ width: (slot.back.currentHp / slot.back.maxHp * 100) + '%' }"></div>
               <div class="mini-bar mp" :style="{ width: (slot.back.currentMp / slot.back.maxMp * 100) + '%' }"></div>
             </div>
          </div>
        </div>
        <div class="empty-back-slot" v-else>
          <span class="placeholder-text">无后备</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useBattleStore } from '@/stores/battle';
import { storeToRefs } from 'pinia';
import { skillsDb } from '@/data/skills';

const battleStore = useBattleStore();
const { enemies, partySlots, activeSlotIndex, activeCharacter, battleLog, battleState, battleItems } = storeToRefs(battleStore);

const showSkillMenu = ref(false);
const showItemMenu = ref(false);
const pendingAction = ref(null); // { type: 'attack' | 'skill' | 'item', skillId?: number, itemId?: number, targetType?: string }

const isSelectingTarget = computed(() => !!pendingAction.value);
const isSelectingAlly = computed(() => pendingAction.value?.targetType === 'ally' || pendingAction.value?.targetType === 'deadAlly');
const isSelectingDead = computed(() => pendingAction.value?.targetType === 'deadAlly');

const canSwitch = computed(() => {
    const slot = partySlots.value[activeSlotIndex.value];
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
    if (enemy.hp <= 0) return;

    const action = pendingAction.value;
    if (action.type === 'attack') {
        battleStore.playerAction('attack', { targetId: enemy.id });
    } else if (action.type === 'skill') {
        battleStore.playerAction('skill', { skillId: action.skillId, targetId: enemy.id });
    } else if (action.type === 'item') {
        battleStore.playerAction('item', { itemId: action.itemId, targetId: enemy.id });
    }
    
    pendingAction.value = null;
};

const canSelect = (character) => {
    if (!character) return false;
    if (!isSelectingAlly.value) return false;
    if (isSelectingDead.value) return character.currentHp <= 0;
    return character.currentHp > 0;
};

const onCharacterClick = (character) => {
    if (!isSelectingAlly.value) return;
    if (!character) return;
    
    // Validation
    if (isSelectingDead.value && character.currentHp > 0) return; // Must be dead
    if (!isSelectingDead.value && character.currentHp <= 0) return; // Must be alive
    
    const action = pendingAction.value;
    if (action.type === 'item') {
         battleStore.playerAction('item', { itemId: action.itemId, targetId: character.id });
    } else if (action.type === 'skill') {
         battleStore.playerAction('skill', { skillId: action.skillId, targetId: character.id });
    }
    
    pendingAction.value = null;
};


// --- Get Role Color Helper (Moved to pure visual helper or keep here) ---
const getRoleColor = (role) => {
  if (!role) return '#94a3b8';
  if (role.includes('swordsman')) return '#ef4444';
  if (role.includes('gunner')) return '#f97316';
  if (role.includes('mage')) return '#3b82f6';
  if (role.includes('brawler')) return '#eab308';
  if (role.includes('lancer')) return '#dc2626'; 
  if (role.includes('mimic')) return '#a855f7';  
  if (role.includes('storyteller')) return '#14b8a6'; 
  return '#94a3b8';
};

const handleAction = (actionType) => {
  if (actionType === 'attack') {
      pendingAction.value = { type: 'attack' };
  } else {
      battleStore.playerAction(actionType);
  }
};

onMounted(() => {
  battleStore.initBattle();
});
</script>

<style scoped>
.battle-system {
  width: 1920px;
  height: 1080px;
  background: linear-gradient(to bottom, #1e1b4b, #312e81);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  color: white;
  font-family: var(--font-main, sans-serif);
}

/* Enemy Zone */
.enemy-zone {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px;
}

.enemy-unit {
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  transition: transform 0.3s ease;
}

.enemy-unit.boss-unit {
  width: 280px;
  transform: scale(1.05);
}

.enemy-avatar-wrapper {
  position: relative;
  transition: transform 0.3s ease;
}

.enemy-unit:hover .enemy-avatar-wrapper {
  transform: scale(1.05);
}

.enemy-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  font-weight: 900;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3);
  border: 4px solid rgba(255,255,255,0.1);
  text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
}

.enemy-unit.boss-unit .enemy-avatar {
  width: 200px;
  height: 200px;
  font-size: 5rem;
  border: 6px solid #fbbf24;
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.3), inset 0 0 30px rgba(0,0,0,0.5);
}

.enemy-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.enemy-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.boss-tag {
  background: #fbbf24;
  color: #451a03;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.enemy-name {
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  text-align: center;
}

.enemy-hp-container {
  width: 100%;
  height: 20px;
  background: #334155;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.enemy-hp-bar {
  height: 100%;
  background: linear-gradient(to right, #dc2626, #ef4444);
  transition: width 0.3s ease;
}

.hp-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75rem;
  text-shadow: 1px 1px 2px black;
}

/* Party Zone */
.party-zone {
  height: 500px;
  padding: 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.party-slot {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.party-slot.active-turn {
  transform: translateY(-20px);
}

.party-slot.active-turn .front-card {
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  border-color: #fbbf24;
}

.card.selectable {
    cursor: pointer;
    border-color: #3b82f6;
    box-shadow: 0 0 20px #3b82f6;
    transform: scale(1.02);
    transition: all 0.2s;
}

.card.selectable:hover {
    border-color: #60a5fa;
    box-shadow: 0 0 30px #60a5fa;
    transform: scale(1.05);
}

.card.dead {
    filter: grayscale(1);
    opacity: 0.6;
}

/* Card Styles */
.card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.front-card {
  height: 380px;
  position: relative;
}

.card-header {
  padding: 0.8rem;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.card-avatar-container {
  flex: 1;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #64748b;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: 900;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
}

.card-stats {
  padding: 1rem;
  background: rgba(0,0,0,0.4);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stat-row label {
  width: 30px;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: bold;
}

.bar-container {
  flex: 1;
  height: 16px;
  background: #334155;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.hp .bar-fill { background: linear-gradient(to right, #ef4444, #f87171); }
.mp .bar-fill { background: linear-gradient(to right, #3b82f6, #60a5fa); }

.bar-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  text-shadow: 1px 1px 2px black;
}

.status-row {
  height: 30px;
  display: flex;
  gap: 0.5rem;
}

.status-icon {
  width: 24px;
  height: 24px;
  background: #6b21a8;
  border-radius: 4px;
  font-size: 0.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Back Row Card (Reserve) */
.back-card {
  height: 100px;
  /* Remove opacity: 0.8 to match front card vibrance */
  background: rgba(15, 23, 42, 0.9); /* Ensure same background */
  border: 2px solid #475569; /* Same border style */
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
  /* Removed border-style: dashed to match front card style */
}

.name-dead {
    color: #ef4444 !important; /* Red color for dead characters */
    text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
}

.empty-back-slot {
  height: 100px;
  border: 2px dashed #334155;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #475569;
}

.card-mini-header .char-name {
  font-size: 0.9rem;
  font-weight: bold;
}

.card-mini-content {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #64748b;
}

.mini-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-bar {
  height: 6px;
  background: #334155;
  border-radius: 3px;
}

.mini-bar.hp { background: #ef4444; }
.mini-bar.mp { background: #3b82f6; }

.top-action-bar {
  position: absolute;
  top: 50px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 4px 8px rgba(0,0,0,0.8);
  pointer-events: none; /* Let clicks pass through */
}

.top-action-bar .selection-message, 
.top-action-bar button {
    pointer-events: auto; /* Re-enable clicks for buttons */
}

/* Battle Action Menu */
.battle-ui-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-ring {
  display: flex;
  gap: 1rem;
  background: rgba(0,0,0,0.8);
  padding: 1.5rem;
  border-radius: 2rem;
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: none;
  background: #1e293b;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  gap: 5px;
}

.action-btn:hover {
  transform: translateY(-5px);
  background: #334155;
}

.action-btn .icon {
  font-size: 1.8rem;
}

.action-btn .label {
  font-size: 0.9rem;
}

/* Specific button styles */
.attack:hover { background: #ef4444; }
.skill:hover { background: #8b5cf6; }
.defend:hover { background: #3b82f6; }
.item:hover { background: #10b981; }
.bloom:hover { background: #ec4899; box-shadow: 0 0 20px #ec4899; }
.switch:hover { background: #f59e0b; }
.skip:hover { background: #64748b; }

.action-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
    pointer-events: none;
}

.enemy-unit.selectable {
    cursor: crosshair;
    filter: drop-shadow(0 0 10px #fbbf24);
    transform: scale(1.05);
}

.enemy-unit.selectable:hover .enemy-avatar {
    border-color: #fbbf24;
    box-shadow: 0 0 20px #fbbf24;
}

.selection-message {
    color: #fbbf24;
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: pulse 1s infinite;
}

.cancel-btn {
    padding: 0.2rem 0.8rem;
    background: #ef4444;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
}

.cancel-btn:hover {
    background: #dc2626;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

.action-prompt {
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.skill-menu-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 60;
    width: 600px;
    background: rgba(15, 23, 42, 0.95);
    border: 2px solid #475569;
    border-radius: 1rem;
    padding: 1rem;
    color: white;
    box-shadow: 0 0 50px rgba(0,0,0,0.8);
}

.skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #334155;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}

.close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
}

.skill-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
}

.skill-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    background: #1e293b;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.skill-item:hover {
    background: #334155;
    transform: translateX(5px);
}

.skill-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
}

.skill-icon {
    font-size: 1.5rem;
}

.skill-details {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.skill-name {
    font-weight: bold;
    color: #f1f5f9;
}

.skill-desc {
    font-size: 0.8rem;
    color: #94a3b8;
}

.skill-cost {
    font-family: monospace;
    color: #60a5fa;
    font-weight: bold;
}

.no-skills {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}

.battle-log {
  position: absolute;
  top: -150px;
  right: -400px;
  width: 300px;
  height: 200px;
  background: rgba(0,0,0,0.6);
  border-radius: 8px;
  padding: 10px;
  overflow-y: auto;
  font-size: 0.8rem;
  color: #e2e8f0;
  pointer-events: none;
  display: flex;
  flex-direction: column-reverse;
}
</style>

