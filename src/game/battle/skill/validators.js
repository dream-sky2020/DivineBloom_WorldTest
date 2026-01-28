import { checkSkillCost } from './costs';

/**
 * 判断角色是否可以使用该技能
 */
export const canUseSkill = (actor, skill, context) => {
    if (!actor || !skill) return false;

    // 1. 检查消耗
    if (!checkSkillCost(actor, skill, context)) return false;

    // 2. 检查沉默状态
    if (actor.statusEffects) {
        const isSilenced = actor.statusEffects.some(s => {
            // 这里以后可以根据 statusDb 进一步扩展逻辑
            return false;
        });

        if (isSilenced && skill.category === 'cat_skill_magic') {
            return false;
        }
    }

    return true;
};
