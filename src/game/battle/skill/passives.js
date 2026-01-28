import { skillsDb } from '@schema/skills';

/**
 * 收集单位特定触发器的被动效果
 */
export const collectPassiveEffects = (unit, triggerName) => {
    const effects = [];
    if (!unit || !unit.skills) return effects;

    unit.skills.forEach(skillId => {
        const skill = skillsDb[skillId];
        if (skill && skill.type === 'skillTypes.passive' && skill.effects) {
            skill.effects.forEach(effect => {
                if (effect.trigger === triggerName) {
                    effects.push({ skill, effect });
                }
            });
        }
    });
    return effects;
};

/**
 * 处理被动技能触发
 */
export const processPassiveTrigger = (unit, triggerName, context) => {
    const passiveEffects = collectPassiveEffects(unit, triggerName);
    
    passiveEffects.forEach(({ skill, effect }) => {
        if (context.executeEffect) {
            context.executeEffect(effect, unit, unit, skill);
        } else {
            console.warn("processPassiveTrigger: context.executeEffect is missing");
        }
    });
};
