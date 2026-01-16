import { defineStore } from 'pinia';
import { ref } from 'vue';
import { charactersDb } from '@/data/characters';
import { skillsDb } from '@/data/skills';

export const usePartyStore = defineStore('party', () => {
    // 存储队伍成员的运行时状态
    // Key: Character ID, Value: Object { currentHp, currentMp, ... }
    const members = ref({});
    
    // 简单的队伍编队 (Slot mapping)
    // 0: { front: 'character_flame_swordsman', back: 'character_tempest_mage' }
    // ...
    const formation = ref([
        { front: 'character_flame_swordsman', back: 'character_tempest_mage' },
        { front: 'character_holy_brawler', back: 'character_blaze_gunner' },
        { front: 'character_don_quixote', back: 'character_scheherazade' },
        { front: 'character_jia_baoyu', back: null }
    ]);

    const reset = () => {
        members.value = {};
        // Reset formation to default or empty? Let's keep default structure but maybe clear chars?
        // For now reset to default formation
        formation.value = [
            { front: 'character_flame_swordsman', back: 'character_tempest_mage' },
            { front: 'character_holy_brawler', back: 'character_blaze_gunner' },
            { front: 'character_don_quixote', back: 'character_scheherazade' },
            { front: 'character_jia_baoyu', back: null }
        ];
    };

    const serialize = () => {
        return {
            members: members.value,
            formation: formation.value
        };
    };

    const loadState = (data) => {
        if (data.members) members.value = data.members;
        if (data.formation) formation.value = data.formation;
    };

    // 初始化队伍（如果尚未初始化）
    const initParty = () => {
        if (Object.keys(members.value).length > 0) return;

        // 加载初始角色状态
        const initialIds = [
            'character_flame_swordsman',
            'character_blaze_gunner', 
            'character_tempest_mage',
            'character_holy_brawler',
            'character_don_quixote',
            'character_jia_baoyu',
            'character_scheherazade'
        ];
        
        initialIds.forEach(id => {
            const dbChar = charactersDb[id];
            if (dbChar) {
                // Initialize skills logic
                // If DB has empty equipped lists, try to auto-equip from skills pool
                let equippedActive = dbChar.equippedActiveSkills ? [...dbChar.equippedActiveSkills] : [];
                let equippedPassive = dbChar.equippedPassiveSkills ? [...dbChar.equippedPassiveSkills] : [];
                let fixedPassive = dbChar.fixedPassiveSkills ? [...dbChar.fixedPassiveSkills] : [];
                
                // Force include core death passives as fixed if not present
                if (!fixedPassive.includes('skill_passive_call_of_death')) {
                    fixedPassive.push('skill_passive_call_of_death');
                }
                
                if (equippedActive.length === 0 && equippedPassive.length === 0 && dbChar.skills && dbChar.skills.length > 0) {
                     // Auto-equip logic
                     const activeLimit = dbChar.activeSkillLimit || 6;
                     const passiveLimit = dbChar.passiveSkillLimit || 4;
                     
                     for (const skillId of dbChar.skills) {
                        const skill = skillsDb[skillId];
                        if (!skill) continue;
                        
                        if (skill.type === 'skillTypes.passive' || (skillId >= 400 && skillId < 500)) {
                            if (equippedPassive.length < passiveLimit) {
                                equippedPassive.push(skillId);
                            }
                        } else {
                            if (equippedActive.length < activeLimit) {
                                equippedActive.push(skillId);
                            }
                        }
                     }
                }

                members.value[id] = {
                    id: id,
                    currentHp: dbChar.initialStats.hp,
                    currentMp: dbChar.initialStats.mp,
                    level: 1,
                    exp: 0,
                    equippedActiveSkills: equippedActive,
                    equippedPassiveSkills: equippedPassive,
                    fixedPassiveSkills: fixedPassive
                };
            }
        });
    };

    // Equip/Unequip Actions
    const equipSkill = (characterId, skillId, isPassive = false) => {
        const member = members.value[characterId];
        const dbChar = charactersDb[characterId];
        if (!member || !dbChar) return false;

        const targetList = isPassive ? member.equippedPassiveSkills : member.equippedActiveSkills;
        const limit = isPassive ? (dbChar.passiveSkillLimit || 4) : (dbChar.activeSkillLimit || 6);

        // Check if already equipped
        if (targetList.includes(skillId)) return true; // Already equipped

        // Check limit
        if (targetList.length >= limit) return false; // Full

        // Check if own the skill
        const allSkills = dbChar.skills || [];
        if (!allSkills.includes(skillId)) return false; // Don't own it

        targetList.push(skillId);
        return true;
    };

    const unequipSkill = (characterId, skillId, isPassive = false) => {
        const member = members.value[characterId];
        if (!member) return;

        // Cannot unequip fixed skills
        if (isPassive && member.fixedPassiveSkills && member.fixedPassiveSkills.includes(skillId)) {
            return;
        }

        const targetList = isPassive ? member.equippedPassiveSkills : member.equippedActiveSkills;
        const index = targetList.indexOf(skillId);
        if (index > -1) {
            targetList.splice(index, 1);
        }
    };

    // 获取完整的战斗用角色对象（合并 DB 数据和运行时状态）
    const getCharacterState = (id) => {
        if (!id) return null;
        
        // 确保初始化
        initParty();

        const runtime = members.value[id];
        const db = charactersDb[id];
        
        if (!runtime || !db) return null;

        // Merge equipped skills from runtime, fallback to DB if runtime missing (shouldn't happen after init)
        const equippedActive = runtime.equippedActiveSkills || db.equippedActiveSkills || [];
        const equippedPassive = runtime.equippedPassiveSkills || db.equippedPassiveSkills || [];
        const fixedPassive = runtime.fixedPassiveSkills || db.fixedPassiveSkills || [];

        return {
            ...db,
            // 优先使用运行时状态覆盖
            currentHp: runtime.currentHp,
            currentMp: runtime.currentMp,
            
            // 基础属性 (暂不考虑成长，始终读 DB)
            maxHp: db.initialStats.hp, 
            maxMp: db.initialStats.mp,
            atk: db.initialStats.atk || 50,
            def: db.initialStats.def || 30,
            spd: db.initialStats.spd || 10,
            mag: db.initialStats.mag || 10,
            
            skills: db.skills || [], // All learned skills
            equippedActiveSkills: equippedActive,
            equippedPassiveSkills: equippedPassive,
            fixedPassiveSkills: fixedPassive,
            // For backward compatibility or ease of use in battle, we might want to expose a combined 'battleSkills'
            // or let the battle system handle the split. 
            // The battle system currently uses .skills. We should probably update BattleSystem to use equippedActiveSkills.
        };
    };

    // 战斗结束后更新状态
    const updatePartyAfterBattle = (battlePartySlots) => {
        battlePartySlots.forEach(slot => {
            if (slot.front) updateMember(slot.front);
            if (slot.back) updateMember(slot.back);
        });
    };

    const updateMember = (battleChar) => {
        const member = members.value[battleChar.id];
        if (member) {
            member.currentHp = Math.max(0, battleChar.currentHp); // 死人可能是0或负，存为0
            member.currentMp = battleChar.currentMp;
            // 可以在这里处理经验值增加
        }
    };

    return {
        members,
        formation,
        initParty,
        getCharacterState,
        updatePartyAfterBattle,
        equipSkill,
        unequipSkill,
        reset,
        serialize,
        loadState
    };
});

