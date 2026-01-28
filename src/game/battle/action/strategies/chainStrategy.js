import * as SkillSystem from '../../skillSystem';
import * as EffectSystem from '../../effectSystem';

export const chainStrategy = (actionContext) => {
    const { actor, action, skillData, log, enemies } = actionContext;
    
    const initialTarget = enemies.find(e => e.uuid === action.targetId || e.id === action.targetId);
    const hits = SkillSystem.resolveChainSequence(skillData, initialTarget, enemies);

    hits.forEach(({ target, multiplier, hitIndex }) => {
        let damageDealt = 0;
        skillData.effects.forEach(eff => {
            const finalEffect = { ...eff };
            if (finalEffect.type === 'damage') {
                finalEffect.value *= multiplier;
            }
            const val = EffectSystem.processEffect(finalEffect, target, actor, skillData, actionContext, true);
            if (finalEffect.type === 'damage') damageDealt += val;
        });

        if (log) log('battle.chainHit', { count: hitIndex, target: target.name, amount: damageDealt });
    });
};
