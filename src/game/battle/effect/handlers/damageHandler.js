import { calculateDamage, applyDamage } from '../../damageSystem';
import { applyRandomOffset } from '../utils';

export const damageHandler = (effect, target, actor, skill, context, silent, multiplier) => {
    if (!target) return 0;

    let dmg = 0;
    if (effect.scaling === 'atk' || effect.scaling === 'mag') {
        dmg = calculateDamage(actor, target, skill, effect, multiplier);
    } else if (effect.scaling === 'maxHp') {
        const maxHp = target.maxHp || 100;
        dmg = Math.floor(maxHp * (Number(effect.value) || 0)) * multiplier;
    } else if (effect.scaling === 'str') {
        dmg = calculateDamage(actor, target, skill, { ...effect, scaling: 'atk' }, multiplier);
    } else {
        dmg = (Number(effect.value) || 0) * multiplier;
        dmg = applyRandomOffset(dmg, effect);
    }

    if (isNaN(dmg) || dmg < 0) dmg = 1;

    applyDamage(target, dmg, context, silent);
    return dmg;
};
