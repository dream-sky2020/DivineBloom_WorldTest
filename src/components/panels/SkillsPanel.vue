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
            v-for="(skill, index) in activeCharacter.equippedActiveSkills" 
            :key="'active-' + index"
            class="skill-slot equipped-active group hover-effect"
            @click="handleUnequip(skill, false)"
            :title="getLocalizedName(getSkill(skill)?.name)"
          >
            <span class="skill-icon">
                <GameIcon :name="getSkill(skill)?.icon || 'icon_unknown'" />
            </span>
            <div class="slot-badge">{{ index + 1 }}</div>
          </div>
          <!-- Empty Slots -->
          <div 
            v-for="i in (activeCharacter.activeSkillLimit - activeCharacter.equippedActiveSkills.length)" 
            :key="'empty-active-' + i"
            class="skill-slot empty group hover-effect"
          >
            <span class="empty-plus">+</span>
            <div class="slot-badge empty-badge">{{ activeCharacter.equippedActiveSkills.length + i }}</div>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 被动技能槽 -->
      <div class="loadout-section">
        <h3 class="section-title" v-t="'skillTypes.passive'">Passive Skills</h3>
        <div class="skills-row">
          <div 
            v-for="(skill, index) in activeCharacter.equippedPassiveSkills" 
            :key="'passive-' + index"
            class="skill-slot passive-active rounded-circle group hover-effect"
            @click="handleUnequip(skill, true)"
             :title="getLocalizedName(getSkill(skill)?.name)"
          >
            <span class="skill-icon">
                <GameIcon :name="getSkill(skill)?.icon || 'icon_unknown'" />
            </span>
          </div>
          <!-- Empty Slots -->
          <div 
            v-for="i in (activeCharacter.passiveSkillLimit - activeCharacter.equippedPassiveSkills.length)" 
            :key="'empty-passive-' + i"
            class="skill-slot passive-empty rounded-circle group hover-effect"
          >
            <span class="empty-plus">+</span>
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
        @select="toggleEquip"
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
            @click="handleUnequip(selectedSkill.id, isPassive(selectedSkill))"
            v-t="'skills.unequip'"
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
import GameIcon from '@/components/ui/GameIcon.vue';
import GameDataGrid from '@/components/ui/GameDataGrid.vue';
import MarqueeText from '@/components/ui/MarqueeText.vue';

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
           activeCharacter.value.equippedPassiveSkills.includes(skillId);
};

// Filtered Skills
const filteredSkills = computed(() => {
    if (!activeCharacter.value || !activeCharacter.value.skills) return [];
    
    return activeCharacter.value.skills.map(id => skillsDb[id]).filter(skill => {
        if (!skill) return false;
        if (filterType.value === 'all') return true;
        const passive = isPassive(skill);
        if (filterType.value === 'passive') return passive;
        if (filterType.value === 'active') return !passive;
        return true;
    }).map(skill => ({
        ...skill,
        highlight: isEquipped(skill.id),
        footerLeft: isPassive(skill) ? 'skillTypes.passive' : 'skillTypes.active',
        footerLeftClass: isPassive(skill) ? 'text-green' : 'text-blue',
        footerRight: isPassive(skill) ? '--' : (skill.cost || '--'),
        footerRightClass: isPassive(skill) ? '' : 'text-blue-bold',
        tag: isEquipped(skill.id) ? 'EQUIPPED' : null
    }));
});

// Actions
const toggleEquip = (skill) => {
    if (!skill) return;
    selectedSkillId.value = skill.id;
    // Optional: Double click to equip/unequip?
    // For now just select. The equip button is in description panel.
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

<style scoped src="@styles/components/panels/SkillsPanel.css"></style>
