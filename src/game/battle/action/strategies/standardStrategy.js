import * as EffectSystem from '../../effectSystem';
import * as DamageSystem from '../../damageSystem';

export const standardStrategy = (actor, targets, action, skillData, effects, context) => {
    const { log } = context;

    // 攻击专用日志
    if (action.type === 'attack' && targets.length > 0 && log) {
        log('battle.attacks', { attacker: actor.name, target: targets[0].name });
    }

    targets.forEach(target => {
        let lastResult = 0;
        const effectsToProcess = (skillData && skillData.effects) ? skillData.effects : effects;

        effectsToProcess.forEach(eff => {
            if (action.type === 'attack' && eff.type === 'damage') {
                const dmg = DamageSystem.calculateDamage(actor, target, null, null, context.energyMult);
                DamageSystem.applyDamage(target, dmg, context);
                lastResult = dmg;
            } else {
                lastResult = EffectSystem.processEffect(eff, target, actor, skillData, context, false, lastResult);
            }
        });
    });
};
