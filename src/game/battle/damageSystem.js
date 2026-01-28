import { statusDb } from '@schema/status';
import { removeStatus } from '@/game/battle/statusSystem';
import { calculateDamage as calcDmg } from './damage/calculators';
import { updateHp, executeDeath } from './damage/mutators';
import { handleHpZero, handleDyingDamage } from './damage/handlers';
import { handleAutoSwitch } from './damage/switchers';

// 导出核心计算函数（保持兼容性）
export { calculateDamage } from './damage/calculators';

/**
 * 应用伤害（原子化重构版本）
 */
export const applyDamage = (target, amount, context, silent = false) => {
    const { log } = context;

    // 1. 验证与预处理
    let safeAmount = Math.floor(Number(amount) || 0);
    if (typeof target.currentHp !== 'number' || isNaN(target.currentHp)) {
        target.currentHp = target.maxHp || 0;
    }

    const wasAlreadyZero = target.currentHp === 0;

    // 2. 更新 HP
    updateHp(target, safeAmount, false);

    // 3. 触发死亡或濒死流程
    if (target.currentHp === 0) {
        if (!wasAlreadyZero) {
            handleHpZero(target, context, silent, applyHeal);
        } else if (safeAmount > 0) {
            handleDyingDamage(target, safeAmount, context, silent);
        }
    }

    // 4. 日志记录
    if (!silent && log) {
        log('battle.damage', { target: target.name, amount: safeAmount });
        if (target.isDefending) log('battle.defended');
    }

    // 5. 自动补位检查
    handleAutoSwitch(target, context, silent);

    return safeAmount;
};

/**
 * 应用治疗（原子化重构版本）
 */
export const applyHeal = (target, amount, context, silent = false) => {
    const { log } = context;
    if (!target) return 0;

    const isDead = target.statusEffects && target.statusEffects.some(s => s.id === 'status_dead');
    if (isDead) {
        if (!silent && log) log('battle.incapacitated', { target: target.name });
        return 0;
    }

    let safeAmount = Math.floor(Number(amount) || 0);
    const healed = updateHp(target, safeAmount, true);

    if (healed > 0 && target.currentHp > 0) {
        // 恢复濒死状态检查
        const dyingStatuses = target.statusEffects?.filter(s => {
            const def = statusDb[s.id];
            return def && typeof def.deathChance === 'number';
        });

        if (dyingStatuses && dyingStatuses.length > 0) {
            dyingStatuses.forEach(s => removeStatus(target, s.id, context));
            if (!silent && log) log('battle.recoveredFromDying', { target: target.name });
        }
    }

    if (!silent && log && healed > 0) log('battle.recoveredHp', { target: target.name, amount: healed });
    return healed;
};

// 导出被动相关的工具函数（如果外部有用到）
export { collectHpZeroHandlers, executeHpZeroEffect } from './damage/interceptors';
