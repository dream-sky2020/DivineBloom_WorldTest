import { statusDb } from '@schema/status';
import { removeStatus } from '../../statusSystem';

export const reviveHandler = (effect, target, actor, skill, context, silent) => {
    if (!target) return 0;
    const { log } = context;

    const isDead = target.statusEffects?.some(s => s.id === 'status_dead');
    if (isDead) {
        const pct = Number(effect.value) || 0.1;
        target.currentHp = Math.floor(target.maxHp * pct);
        removeStatus(target, 'status_dead', context, true);

        // 移除所有濒死状态
        target.statusEffects?.forEach(s => {
            const def = statusDb[s.id];
            if (def && typeof def.deathChance === 'number') {
                removeStatus(target, s.id, context, true);
            }
        });

        if (!silent && log) log('battle.revived', { target: target.name });
        return target.currentHp;
    } else {
        if (!silent && log) log('battle.noEffect');
        return 0;
    }
};
