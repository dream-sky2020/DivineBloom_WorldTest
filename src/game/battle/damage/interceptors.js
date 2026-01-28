import { skillsDb } from '@schema/skills';
import { applyStatus } from '@/game/battle/statusSystem';

/**
 * 收集单位身上的 HP 归零相关被动
 */
export const collectHpZeroHandlers = (unit) => {
    const handlers = [];
    if (!unit.skills) return handlers;

    unit.skills.forEach(skillId => {
        const skill = skillsDb[skillId];
        if (skill && skill.type === 'skillTypes.passive' && skill.effects) {
            skill.effects.forEach(eff => {
                if (eff.trigger === 'onHpZero') {
                    handlers.push({ skill, effect: eff });
                }
            });
        }
    });
    return handlers;
};

/**
 * 执行具体的归零效果逻辑
 */
export const executeHpZeroEffect = (target, skill, effect, context, silent, healFn) => {
    const { log } = context;

    switch (effect.variant) {
        case 'revive':
            const healAmount = effect.healPercent ? target.maxHp * effect.healPercent : (effect.value || 1);
            healFn(target, healAmount, context, silent);
            if (!silent && log) log('battle.revived', { target: target.name, skill: skill.name.zh });
            return true;

        case 'add_status':
        case 'apply_status':
        case 'will_to_live':
            if (effect.status) {
                applyStatus(target, effect.status, effect.duration || 999, null, context);
            } else if (effect.variant === 'will_to_live') {
                applyStatus(target, 'status_dying', 999, null, context);
            }
            return true;

        case 'call_of_death':
        case 'instant_death':
            return false;

        default:
            return false;
    }
};
