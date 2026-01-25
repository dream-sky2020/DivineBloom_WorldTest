<template>
  <div class="panel-container">
    
    <!-- 顶部：角色切换 Tabs (仅在非锁定模式下显示) -->
    <div class="character-tabs" v-if="!lockCharacterId">
      <div 
        v-for="char in partyMembers" 
        :key="char.id" 
        class="char-tab" 
        :class="{ active: selectedCharId === char.id }"
        @click="selectedCharId = char.id"
      >
        <span class="char-name">{{ getLocalizedText(char.name) }}</span>
        <span class="char-role" :class="getRoleColor(char.role)">{{ t(char.role) }}</span>
      </div>
    </div>

    <!-- 锁定模式下的标题 -->
    <div class="locked-character-header" v-else>
       <span class="char-name">{{ getLocalizedText(activeCharacter?.name) }}</span>
       <span class="char-role">{{ t(activeCharacter?.role) }}</span>
    </div>

    <!-- 核心区域：两栏布局 -->
    <div class="equipment-content" v-if="activeCharacter">
      
      <!-- 左列：装备槽位 & 属性 (40%) -->
      <div class="left-column">
        
        <!-- 属性面板 -->
        <div class="stats-panel">
          <div class="panel-header border-bottom">
            <span class="header-title" v-t="'panels.status'"></span>
            <span class="header-sub">Lv. {{ activeCharacter.level || 1 }} {{ t(activeCharacter.role) }}</span>
          </div>
          <div class="stats-grid">
            <div class="stat-row"><span class="label" v-t="'stats.atk'"></span> <span class="value">{{ activeCharacter.atk }}</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.def'"></span> <span class="value">{{ activeCharacter.def }}</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.mag'"></span> <span class="value">{{ activeCharacter.mag }}</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.spd'"></span> <span class="value">{{ activeCharacter.spd }}</span></div>
          </div>
        </div>

        <!-- 装备槽位列表 (这里简化为技能槽，因为用户提到切换技能) -->
        <div class="slots-list custom-scrollbar">
          
          <div 
            v-for="(skillId, index) in activeCharacter.equippedActiveSkills" 
            :key="'active-' + index"
            class="slot-item"
            :class="{ active: selectedSlotType === 'active' && selectedSlotIndex === index }"
            @click="selectSlot('active', index)"
          >
            <div class="slot-icon-box">
              <GameIcon :name="getSkill(skillId)?.icon || 'icon_sword'" />
            </div>
            <div class="slot-info">
              <div class="slot-type text-blue">{{ t('skillTypes.active') }} {{ index + 1 }}</div>
              <div class="slot-item-name">{{ getLocalizedText(getSkill(skillId)?.name) }}</div>
            </div>
          </div>

          <div 
            v-for="i in (activeCharacter.activeSkillLimit - activeCharacter.equippedActiveSkills.length)" 
            :key="'empty-active-' + i"
            class="slot-item"
            :class="{ active: selectedSlotType === 'active' && selectedSlotIndex === (activeCharacter.equippedActiveSkills.length + i - 1) }"
            @click="selectSlot('active', activeCharacter.equippedActiveSkills.length + i - 1)"
          >
            <div class="slot-icon-box">?</div>
            <div class="slot-info">
              <div class="slot-type">{{ t('skillTypes.active') }} {{ activeCharacter.equippedActiveSkills.length + i }}</div>
              <div class="slot-item-name">---</div>
            </div>
          </div>

        </div>

      </div>

      <!-- 右列：物品选择列表 (60%) -->
      <div class="right-column">
        
        <!-- 列表头部 -->
        <div class="list-header">
          <h3 class="list-title">
            <span>⚔️</span> <span>{{ t('skills.equip') }}</span>
          </h3>
          <div class="item-count-label">{{ filteredSkills.length }} {{ t('equipment.itemsAvailable') }}</div>
        </div>

        <!-- 物品列表 -->
        <div class="items-list custom-scrollbar">
          
          <div 
            v-for="skill in filteredSkills" 
            :key="skill.id" 
            class="list-item"
            :class="{ equipped: isEquipped(skill.id) }"
            @click="handleSkillClick(skill)"
          >
            <div class="item-icon-box">
              <GameIcon :name="skill.icon" />
            </div>
            <div class="item-details">
              <div class="item-top-row">
                <span class="item-name" :class="{ 'text-blue': isEquipped(skill.id) }">{{ getLocalizedText(skill.name) }}</span>
                <span v-if="isEquipped(skill.id)" class="equipped-badge" v-t="'equipment.equipped'"></span>
              </div>
              <div class="item-sub-info">{{ getLocalizedText(skill.description) }}</div>
            </div>
          </div>

        </div>

        <!-- 底部详情 -->
        <div class="detail-footer" v-if="hoveredSkill || selectedListSkill">
          <div class="comparison-box">
            <div class="footer-label">{{ getLocalizedText((hoveredSkill || selectedListSkill).name) }}</div>
            <div class="footer-desc">
              {{ getLocalizedText((hoveredSkill || selectedListSkill).description) }}
            </div>
          </div>
          <button 
            class="equip-btn" 
            @click="toggleEquip(selectedListSkill)" 
            v-if="selectedListSkill"
          >
            {{ isEquipped(selectedListSkill.id) ? t('skills.unequip') : t('skills.equip') }}
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePartyStore } from '@/stores/party';
import { skillsDb } from '@schema/skills';
import { useI18n } from 'vue-i18n';
import GameIcon from '@/interface/ui/GameIcon.vue';
import { getLocalizedText } from '@/utils/i18nUtils';

const props = defineProps({
  lockCharacterId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['change']);
const { t } = useI18n();
const partyStore = usePartyStore();

const selectedCharId = ref(props.lockCharacterId);
const selectedSlotType = ref('active');
const selectedSlotIndex = ref(0);
const selectedListSkill = ref(null);
const hoveredSkill = ref(null);

const partyMembers = computed(() => {
    return Object.keys(partyStore.members).map(id => partyStore.getCharacterState(id));
});

if (!selectedCharId.value && partyMembers.value.length > 0) {
    selectedCharId.value = partyMembers.value[0].id;
}

// Watch for prop changes to update selection if locked
watch(() => props.lockCharacterId, (newId) => {
    if (newId) {
        selectedCharId.value = newId;
    }
});

const activeCharacter = computed(() => {
    return partyStore.getCharacterState(selectedCharId.value);
});

const filteredSkills = computed(() => {
    if (!activeCharacter.value) return [];
    return activeCharacter.value.skills.map(id => skillsDb[id]).filter(Boolean);
});

const getSkill = (id) => skillsDb[id];

const isEquipped = (skillId) => {
    if (!activeCharacter.value) return false;
    return activeCharacter.value.equippedActiveSkills.includes(skillId) || 
           activeCharacter.value.equippedPassiveSkills.includes(skillId);
};

const selectSlot = (type, index) => {
    selectedSlotType.value = type;
    selectedSlotIndex.value = index;
};

const handleSkillClick = (skill) => {
    selectedListSkill.value = skill;
};

const toggleEquip = (skill) => {
    if (!skill || !activeCharacter.value) return;
    
    const isPassive = skill.type === 'skillTypes.passive';
    if (isEquipped(skill.id)) {
        partyStore.unequipSkill(selectedCharId.value, skill.id, isPassive);
    } else {
        partyStore.equipSkill(selectedCharId.value, skill.id, isPassive);
    }
    emit('change');
};

const getRoleColor = (role) => {
    return 'text-blue';
};
</script>

<style scoped src="@styles/panels/EquipmentPanel.css"></style>

