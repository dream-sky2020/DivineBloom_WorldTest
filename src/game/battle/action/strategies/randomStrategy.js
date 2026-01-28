import * as SkillSystem from '../../skillSystem';
import * as EffectSystem from '../../effectSystem';

export const randomStrategy = (actor, skillData, context) => {
    const { log, enemies } = context;
    const hits = SkillSystem.resolveRandomSequence(skillData, enemies);

    hits.forEach(({ target, hitIndex }) => {
        let damageDealt = 0;
        skillData.effects.forEach(eff => {
            const val = EffectSystem.processEffect(eff, target, actor, skillData, context, true);
            if (eff.type === 'damage') damageDealt += val;
        });

        if (log) log('battle.randomHit', { count: hitIndex, target: target.name, amount: damageDealt });
    });
};
