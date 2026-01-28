import { statusDb } from '@schema/status';

/**
 * 计算带状态加成的属性值
 */
export const getStatWithModifiers = (unit, statName) => {
    let value = Number(unit[statName]) || (statName === 'atk' || statName === 'mag' ? 10 : 5);
    
    if (unit.statusEffects) {
        unit.statusEffects.forEach(s => {
            const statusDef = statusDb[s.id];
            if (statusDef && statusDef.effects) {
                statusDef.effects.forEach(eff => {
                    if (eff.trigger === 'passive' && eff.type === 'statMod' && eff.stat === statName) {
                        value *= eff.value;
                    }
                });
            }
        });
    }
    return value;
};

/**
 * 基础伤害公式
 */
export const calculateBaseDamage = (atk, def, multiplier) => {
    let rawDmg = Math.max(1, (atk * multiplier) - (def / 2));
    if (isNaN(rawDmg)) rawDmg = 1;
    return rawDmg;
};

/**
 * 应用伤害随机波动
 */
export const applyDamageVariance = (amount, effect) => {
    if (!effect) return amount;
    
    const hasMin = typeof effect.minOffset === 'number';
    const hasMax = typeof effect.maxOffset === 'number';

    if (!hasMin && !hasMax) return amount;

    const minOffset = hasMin ? effect.minOffset : 0;
    const maxOffset = hasMax ? effect.maxOffset : 0;

    if (hasMin && !hasMax && minOffset >= 0) {
        console.error(`Skill Config Error: minOffset (${minOffset}) must be less than 0 when maxOffset is undefined.`);
        return amount;
    }
    if (!hasMin && hasMax && maxOffset <= 0) {
        console.error(`Skill Config Error: maxOffset (${maxOffset}) must be greater than 0 when minOffset is undefined.`);
        return amount;
    }
    if (minOffset >= maxOffset) {
        console.error(`Skill Config Error: minOffset (${minOffset}) must be less than maxOffset (${maxOffset})`);
        return amount;
    }

    const range = maxOffset - minOffset;
    const offset = minOffset + Math.random() * range;
    return amount * (1.0 + offset);
};

/**
 * 核心伤害计算器
 */
export const calculateDamage = (attacker, defender, skill = null, effect = null, damageMultiplier = 1.0) => {
    let atk = getStatWithModifiers(attacker, 'atk');
    let def = getStatWithModifiers(defender, 'def');
    let multiplier = (effect && effect.value) ? effect.value : 1.0;

    if (damageMultiplier) {
        multiplier *= damageMultiplier;
    }

    if (skill || (effect && effect.scaling)) {
        const isMagic = (skill && skill.category === 'cat_skill_magic') || (effect && effect.scaling === 'mag');
        const isDefScaling = (effect && effect.scaling === 'def');

        if (isMagic) {
            def *= 0.7;
            const mag = getStatWithModifiers(attacker, 'mag');
            atk = mag * 1.2;
            if (skill && skill.element === 'element_fire') multiplier *= 1.1;
        } else if (isDefScaling) {
            atk = getStatWithModifiers(attacker, 'def');
        }
    }

    let damage = calculateBaseDamage(atk, def, multiplier);

    if (defender.isDefending) {
        damage *= 0.5;
    }

    damage = applyDamageVariance(damage, effect);

    return Math.floor(damage * 10);
};
