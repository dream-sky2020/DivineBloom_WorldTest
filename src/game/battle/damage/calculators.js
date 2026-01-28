import { statusDb } from '@schema/status';
import { createDamageRuntimeContext } from '@schema/runtime/DamageRuntimeContext';

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
 * 核心伤害计算器 (使用 DamageRuntimeContext 重构)
 */
export const calculateDamage = (attacker, defender, skill = null, effect = null, damageMultiplier = 1.0) => {
    // 1. 初始化上下文
    const ctx = createDamageRuntimeContext({
        attacker,
        defender,
        skill,
        effect,
        actionMultiplier: damageMultiplier || 1.0,
        baseMultiplier: (effect && typeof effect.value === 'number') ? effect.value : 1.0
    });

    // 2. 基础属性提取
    ctx.atk = getStatWithModifiers(attacker, 'atk');
    ctx.def = getStatWithModifiers(defender, 'def');

    // 3. 处理缩放逻辑 (Magic / Def Scaling)
    if (skill || (effect && effect.scaling)) {
        const isMagic = (skill && skill.category === 'cat_skill_magic') || (effect && effect.scaling === 'mag');
        const isDefScaling = (effect && effect.scaling === 'def');

        if (isMagic) {
            ctx.def *= 0.7; // 魔法攻击无视部分防御
            ctx.atk = getStatWithModifiers(attacker, 'mag') * 1.2;
            
            // 属性修正 (此处可扩展为更通用的属性系统)
            if (skill && skill.element === 'element_fire') {
                ctx.elementMultiplier *= 1.1;
            }
        } else if (isDefScaling) {
            ctx.atk = getStatWithModifiers(attacker, 'def');
        }
    }

    // 4. 处理防御状态
    if (defender.isDefending) {
        ctx.isBlocked = true;
        ctx.actionMultiplier *= 0.5;
    }

    // 5. 计算基础伤害
    const totalMultiplier = ctx.baseMultiplier * ctx.actionMultiplier * ctx.elementMultiplier;
    let damage = calculateBaseDamage(ctx.atk, ctx.def, totalMultiplier);

    // 6. 应用随机波动
    const beforeVariance = damage;
    damage = applyDamageVariance(damage, effect);
    ctx.variance = damage / (beforeVariance || 1);

    // 7. 最终取整并放大 (保持原有的 * 10 逻辑)
    ctx.finalDamage = Math.floor(damage * 10);

    return ctx.finalDamage;
};
