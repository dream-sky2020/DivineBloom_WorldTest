import { applyHeal } from '../../damageSystem';
import { applyRandomOffset, calculateEffectBaseValue } from '../utils';

export const recoveryHandler = (effect, target, actor, skill, context, silent, multiplier, previousResult) => {
    if (!target) return 0;
    const { log } = context;

    if (effect.type === 'heal' || effect.type === 'heal_all' || effect.type === 'plague_rain') {
        let amount = calculateEffectBaseValue(effect, target, multiplier, previousResult);
        amount = applyRandomOffset(amount, effect);
        return applyHeal(target, amount, context, silent);
    }

    if (effect.type === 'recoverMp' || effect.type === 'recover_mp') {
        let amount = calculateEffectBaseValue(effect, target, multiplier, previousResult);
        target.currentMp = Math.min(target.maxMp, target.currentMp + amount);
        if (!silent && log) log('battle.recoveredMp', { target: target.name, amount });
        return amount;
    }

    return 0;
};
