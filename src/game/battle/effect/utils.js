/**
 * 应用随机偏移
 */
export const applyRandomOffset = (value, effect, logName = '') => {
    if (!effect) return value;

    const hasMin = typeof effect.minOffset === 'number';
    const hasMax = typeof effect.maxOffset === 'number';

    if (!hasMin && !hasMax) return value;

    const minOffset = hasMin ? effect.minOffset : 0;
    const maxOffset = hasMax ? effect.maxOffset : 0;

    if (hasMin && !hasMax && minOffset >= 0) {
        console.error(`Skill Config Error: minOffset (${minOffset}) must be less than 0 when maxOffset is undefined.`, logName);
        return value;
    } else if (!hasMin && hasMax && maxOffset <= 0) {
        console.error(`Skill Config Error: maxOffset (${maxOffset}) must be greater than 0 when minOffset is undefined.`, logName);
        return value;
    } else if (minOffset >= maxOffset) {
        console.error(`Skill Config Error: minOffset (${minOffset}) must be less than maxOffset (${maxOffset})`, logName);
        return value;
    }

    const range = maxOffset - minOffset;
    const offset = minOffset + Math.random() * range;
    return Math.floor(value * (1.0 + offset));
};

/**
 * 基础数值计算器（处理百分比、缩放、能量加成）
 */
export const calculateEffectBaseValue = (effect, target, multiplier, previousResult) => {
    let amount = Number(effect.value) || 0;

    if (effect.percent) {
        const base = (effect.type.includes('mp') || effect.scaling === 'maxMp') ? (target.maxMp || 0) : (target.maxHp || 0);
        amount += Math.floor(base * effect.percent);
    }

    if (effect.scaling === 'maxHp') {
        amount = Math.floor(target.maxHp * (Number(effect.value) || amount));
    } else if (effect.scaling === 'maxMp') {
        amount = Math.floor(target.maxMp * (Number(effect.value) || amount));
    } else if (effect.scaling === 'damage_dealt') {
        amount = Math.floor(previousResult * (Number(effect.value) || 1));
    }

    return amount * multiplier;
};
