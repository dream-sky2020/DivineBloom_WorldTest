import { applyStatus } from '@/game/battle/statusSystem';

/**
 * 核心：修改 HP 的原子操作
 */
export const updateHp = (target, amount, isHeal = false) => {
    const oldHp = target.currentHp || 0;
    if (isHeal) {
        target.currentHp = Math.min(target.maxHp, oldHp + amount);
    } else {
        target.currentHp = Math.max(0, oldHp - amount);
    }
    return target.currentHp - oldHp;
};

/**
 * 执行死亡逻辑
 */
export const executeDeath = (target, context, silent) => {
    const { log } = context;
    const isDead = target.statusEffects?.some(s => s.id === 'status_dead');
    if (!isDead) {
        applyStatus(target, 'status_dead', 999, null, context);
        target.atb = 0;
        if (!silent && log) log('battle.death', { target: target.name });
    }
};
