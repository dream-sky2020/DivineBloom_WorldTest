import { statusDb } from '@schema/status';
import { removeStatus } from '@/game/battle/statusSystem';
import { collectHpZeroHandlers, executeHpZeroEffect } from './interceptors';
import { executeDeath } from './mutators';

/**
 * 处理 HP 归零事件
 */
export const handleHpZero = (target, context, silent, healFn) => {
    const handlers = collectHpZeroHandlers(target);
    let deathPrevented = false;

    handlers.sort((a, b) => (b.effect.priority || 0) - (a.effect.priority || 0));

    for (const { skill, effect } of handlers) {
        if (effect.limit) {
            target.usageRecords = target.usageRecords || {};
            const usedCount = target.usageRecords[skill.id] || 0;
            if (usedCount >= effect.limit) continue;
            target.usageRecords[skill.id] = usedCount + 1;
        }

        if (effect.chance !== undefined && Math.random() > effect.chance) continue;

        const success = executeHpZeroEffect(target, skill, effect, context, silent, healFn);
        if (success && effect.preventDeath) {
            deathPrevented = true;
        }
    }

    if (!deathPrevented) {
        executeDeath(target, context, silent);
    }
};

/**
 * 处理濒死状态受创
 */
export const handleDyingDamage = (target, amount, context, silent) => {
    const { log } = context;
    const dyingStatus = target.statusEffects?.find(s => {
        const def = statusDb[s.id];
        return def && typeof def.deathChance === 'number';
    });

    if (!dyingStatus) return;

    const statusDef = statusDb[dyingStatus.id];
    let deathChance = statusDef.deathChance;

    // 被动微调死亡率
    const handlers = collectHpZeroHandlers(target);
    for (const { effect } of handlers) {
        if (effect.variant === 'modify_death_chance' && effect.value !== undefined) {
            deathChance += effect.value;
        }
    }

    if (Math.random() < deathChance) {
        executeDeath(target, context, silent);
        // 移除所有濒死状态
        target.statusEffects.forEach(s => {
            const def = statusDb[s.id];
            if (def && typeof def.deathChance === 'number') {
                removeStatus(target, s.id, context, true);
            }
        });
    } else {
        if (!silent && log) log('battle.struggling', { target: target.name });
    }
};
