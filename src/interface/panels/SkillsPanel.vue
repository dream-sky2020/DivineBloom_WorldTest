<template>
  <div class="panel-container">
    
    <!-- 顶部：角色切换 Tabs -->
    <div class="character-tabs">
      <div 
        v-for="char in partyMembers" 
        :key="char.id" 
        class="char-tab" 
        :class="{ active: selectedCharId === char.id }"
        @click="selectedCharId = char.id"
      >
        <span class="char-name">{{ getLocalizedName(char.name) }}</span>
        <span class="char-role" :class="getRoleColor(char.role)">{{ getLocalizedRole(char.role) }}</span>
      </div>
    </div>

    <!-- 已装备技能栏 (Equipped Loadout) -->
    <div class="loadout-panel" v-if="activeCharacter">
      <!-- 主动技能槽 -->
      <div class="loadout-section">
        <h3 class="section-title" v-t="'skillTypes.active'">Active Skills</h3>
        <div class="skills-row">
          <div 
            v-for="(skillId, index) in activeCharacter.equippedActiveSkills" 
            :key="'active-' + index"
            class="skill-slot equipped-active group hover-effect"
            :class="{ selected: selectedSkillId === skillId }"
            @click="selectSkill(skillId)"
            @dblclick="handleUnequip(skillId, false)"
            :title="getLocalizedName(getSkill(skillId)?.name)"
          >
            <span class="skill-icon">
                <GameIcon :name="getSkill(skillId)?.icon || 'icon_unknown'" />
            </span>
            <div class="slot-badge">{{ index + 1 }}</div>
          </div>
          <!-- Empty Slots -->
          <div 
            v-for="i in (activeCharacter.activeSkillLimit - activeCharacter.equippedActiveSkills.length)" 
            :key="'empty-active-' + i"
            class="skill-slot empty group hover-effect"
            :class="{ 'valid-target': selectedSkill && !isPassive(selectedSkill) && !isEquipped(selectedSkill.id) }"
            @click="handleEmptySlotClick(false)"
          >
            <span class="empty-plus">+</span>
            <div class="slot-badge empty-badge">{{ activeCharacter.equippedActiveSkills.length + i }}</div>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 被动技能槽 (可装备) -->
      <div class="loadout-section">
        <h3 class="section-title" v-t="'skillTypes.passive'">Passive Skills</h3>
        <div class="skills-row">
          <!-- 已装备被动技能 (Equipped) -->
          <div 
            v-for="(skillId, index) in activeCharacter.equippedPassiveSkills" 
            :key="'passive-' + index"
            class="skill-slot passive-active rounded-circle group hover-effect"
            :class="{ selected: selectedSkillId === skillId }"
            @click="selectSkill(skillId)"
            @dblclick="handleUnequip(skillId, true)"
             :title="getLocalizedName(getSkill(skillId)?.name)"
          >
            <span class="skill-icon">
                <GameIcon :name="getSkill(skillId)?.icon || 'icon_unknown'" />
            </span>
          </div>
          <!-- Empty Slots -->
          <div 
            v-for="i in Math.max(0, activeCharacter.passiveSkillLimit - activeCharacter.equippedPassiveSkills.length)" 
            :key="'empty-passive-' + i"
            class="skill-slot passive-empty rounded-circle group hover-effect"
            :class="{ 'valid-target': selectedSkill && isPassive(selectedSkill) && !isEquipped(selectedSkill.id) }"
            @click="handleEmptySlotClick(true)"
          >
            <span class="empty-plus">+</span>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 固定被动 (Intrinsic/Fixed) -->
      <div class="loadout-section fixed-section">
        <h3 class="section-title" v-t="'skills.fixed_passives'">Fixed Passives</h3>
        <div class="skills-row">
          <div 
            v-for="(skillId, index) in activeCharacter.fixedPassiveSkills" 
            :key="'fixed-passive-' + index"
            class="skill-slot passive-active fixed-skill rounded-circle group"
            :class="{ selected: selectedSkillId === skillId }"
            @click="selectSkill(skillId)"
            :title="getLocalizedName(getSkill(skillId)?.name) + ' (Fixed)'"
          >
            <span class="skill-icon">
                <GameIcon :name="getSkill(skillId)?.icon || 'icon_unknown'" />
            </span>
            <div class="lock-overlay">
                <i class="fas fa-lock"></i>
            </div>
          </div>
          <!-- 占位符提示，如果没有任何固定技能 -->
          <div v-if="!activeCharacter.fixedPassiveSkills || activeCharacter.fixedPassiveSkills.length === 0" class="no-fixed-hint">
            None
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤器 Tabs -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <div class="tab" :class="{ active: filterType === 'all' }" @click="filterType = 'all'" v-t="'skills.tabs.all'">All</div>
        <div class="tab" :class="{ active: filterType === 'active' }" @click="filterType = 'active'" v-t="'skillTypes.active'">Active</div>
        <div class="tab" :class="{ active: filterType === 'passive' }" @click="filterType = 'passive'" v-t="'skillTypes.passive'">Passive</div>
      </div>
    </div>

    <!-- 技能列表与描述 -->
    <div class="content-area" v-if="activeCharacter">
      
      <!-- 列表 -->
      <GameDataGrid 
        class="flex-grow-grid"
        :items="filteredSkills" 
        mode="detailed" 
        :columns="5" 
        v-model="selectedSkillIndex"
        @select="selectSkill($event.id)"
        @dblclick="handleToggleEquip"
      />

      <!-- 底部描述区域 -->
      <div class="description-panel" v-if="selectedSkill">
        <div class="desc-icon-box">
             <GameIcon :name="selectedSkill.icon || 'icon_unknown'" />
        </div>
        <div class="desc-content">
          <div>
            <div class="desc-header">
              <MarqueeText 
                class="desc-title" 
                :text="getLocalizedName(selectedSkill.name)" 
                :active="true" 
              />
              <span class="desc-cost" v-if="selectedSkill.cost">Cost: {{ selectedSkill.cost }}</span>
            </div>
            <div class="desc-meta">
                {{ selectedSkill.targetType }} | {{ getLocalizedSubText(selectedSkill.subText) }}
            </div>
            <p class="desc-body">
              {{ getLocalizedName(selectedSkill.description) }}
            </p>
          </div>
        </div>
        <div class="desc-actions">
          <button 
            v-if="isEquipped(selectedSkill.id)"
            class="action-btn btn-red" 
            :class="{ 'btn-disabled': isFixed(selectedSkill.id) }"
            :disabled="isFixed(selectedSkill.id)"
            @click="handleUnequip(selectedSkill.id, isPassive(selectedSkill))"
            v-t="isFixed(selectedSkill.id) ? 'skills.fixed' : 'skills.unequip'"
          >Unequip</button>
          <button 
            v-else
            class="action-btn btn-slate" 
            @click="handleEquip(selectedSkill.id, isPassive(selectedSkill))"
            :disabled="!canEquip(selectedSkill)"
            v-t="'skills.equip'"
          >Equip</button>
        </div>
      </div>
      <div v-else class="description-panel empty">
          <p>Select a skill to view details</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePartyStore } from '@/stores/party';
import { skillsDb } from '@/data/skills';
import { useI18n } from 'vue-i18n';
import GameIcon from '@/interface/ui/GameIcon.vue';
import GameDataGrid from '@/interface/ui/GameDataGrid.vue';
import MarqueeText from '@/interface/ui/MarqueeText.vue';

const { t, locale } = useI18n();
const partyStore = usePartyStore();

// Initialize Party if needed (e.g. if accessed from menu before battle)
partyStore.initParty();

// State
const selectedCharId = ref(null);
const filterType = ref('all'); // all, active, passive
const selectedSkillId = ref(null);
const selectedSkillIndex = ref(0);

// Initialize selectedCharId
const partyMembers = computed(() => {
    // Ensure we have the latest state for all members
    const members = [];
    // Prefer formation order if possible, or just keys
    const memberIds = Object.keys(partyStore.members);
    // Or use formation logic if you have access to ordered party
    memberIds.forEach(id => {
        members.push(partyStore.getCharacterState(id));
    });
    return members;
});

// Set default selection
if (partyMembers.value.length > 0 && !selectedCharId.value) {
    selectedCharId.value = partyMembers.value[0].id;
}

const activeCharacter = computed(() => {
    return partyStore.getCharacterState(selectedCharId.value);
});

const selectedSkill = computed(() => {
    if (!selectedSkillId.value) return null;
    return skillsDb[selectedSkillId.value];
});

// Helpers
const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[locale.value] || nameObj['en'] || nameObj['zh'];
};

const getLocalizedRole = (roleKey) => {
    // roleKey is "roles.swordsman"
    // We assume translation keys exist
    return t(roleKey);
};

const getRoleColor = (role) => {
    // Return a class based on role if needed
    return 'text-white';
};

const getLocalizedSubText = (subObj) => {
     if (!subObj) return '';
     return getLocalizedName(subObj);
};

const getSkill = (id) => skillsDb[id];

const isPassive = (skill) => {
    return (skill.type === 'skillTypes.passive') || (skill.id && skill.id.startsWith('skill_passive')); // Fallback check
};

const isEquipped = (skillId) => {
    if (!activeCharacter.value) return false;
    return activeCharacter.value.equippedActiveSkills.includes(skillId) || 
           activeCharacter.value.equippedPassiveSkills.includes(skillId) ||
           (activeCharacter.value.fixedPassiveSkills && activeCharacter.value.fixedPassiveSkills.includes(skillId));
};

const isFixed = (skillId) => {
    if (!activeCharacter.value) return false;
    return activeCharacter.value.fixedPassiveSkills && activeCharacter.value.fixedPassiveSkills.includes(skillId);
};

// Filtered Skills
const filteredSkills = computed(() => {
    if (!activeCharacter.value || !activeCharacter.value.skills) return [];
    
    // Add fixed skills to the pool of all skills if they aren't already there
    // This ensures they appear in the list
    const allSkillIds = [...activeCharacter.value.skills];
    if (activeCharacter.value.fixedPassiveSkills) {
        activeCharacter.value.fixedPassiveSkills.forEach(id => {
            if (!allSkillIds.includes(id)) allSkillIds.push(id);
        });
    }

    return allSkillIds.map(id => skillsDb[id]).filter(skill => {
        if (!skill) return false;
        if (filterType.value === 'all') return true;
        const passive = isPassive(skill);
        if (filterType.value === 'passive') return passive;
        if (filterType.value === 'active') return !passive;
        return true;
    }).map(skill => {
        const fixed = isFixed(skill.id);
        const equipped = isEquipped(skill.id);
        
        let tag = null;
        if (fixed) tag = 'FIXED';
        else if (equipped) tag = 'EQUIPPED';

        return {
            ...skill,
            highlight: equipped,
            footerLeft: isPassive(skill) ? 'skillTypes.passive' : 'skillTypes.active',
            footerLeftClass: isPassive(skill) ? 'text-green' : 'text-blue',
            footerRight: isPassive(skill) ? '--' : (skill.cost || '--'),
            footerRightClass: isPassive(skill) ? '' : 'text-blue-bold',
            tag: tag,
            isFixed: fixed
        };
    });
});

// Actions
const selectSkill = (id) => {
    selectedSkillId.value = id;
};

const handleEmptySlotClick = (isPassiveSlot) => {
    if (!selectedSkill.value) return;
    
    const skillIsPassive = isPassive(selectedSkill.value);
    
    // Type mismatch check
    if (skillIsPassive !== isPassiveSlot) return;
    
    // Already equipped check
    if (isEquipped(selectedSkill.value.id)) return;
    
    // Capacity check
    if (canEquip(selectedSkill.value)) {
        handleEquip(selectedSkill.value.id, skillIsPassive);
    }
};

const handleToggleEquip = (skill) => {
    if (!skill || isFixed(skill.id)) return;
    
    const passive = isPassive(skill);
    if (isEquipped(skill.id)) {
        handleUnequip(skill.id, passive);
    } else if (canEquip(skill)) {
        handleEquip(skill.id, passive);
    }
};

const toggleEquip = (skill) => {
    if (!skill) return;
    selectSkill(skill.id);
};

const canEquip = (skill) => {
    if (!activeCharacter.value) return false;
    const passive = isPassive(skill);
    const list = passive ? activeCharacter.value.equippedPassiveSkills : activeCharacter.value.equippedActiveSkills;
    const limit = passive ? activeCharacter.value.passiveSkillLimit : activeCharacter.value.activeSkillLimit;
    return list.length < limit;
};

const handleEquip = (skillId, isPassiveSkill) => {
    partyStore.equipSkill(selectedCharId.value, skillId, isPassiveSkill);
};

const handleUnequip = (skillId, isPassiveSkill) => {
    partyStore.unequipSkill(selectedCharId.value, skillId, isPassiveSkill);
};

</script>

<style scoped src="@styles/panels/SkillsPanel.css"></style>
