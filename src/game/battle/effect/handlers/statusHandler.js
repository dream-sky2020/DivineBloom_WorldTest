import { statusDb } from '@schema/status';
import { applyStatus, removeStatus } from '../../statusSystem';

export const statusHandler = (effect, target, actor, skill, context, silent) => {
    if (!target) return 0;
    const { log } = context;

    if (effect.type === 'applyStatus') {
        if (effect.chance && Math.random() > effect.chance) return 0;
        applyStatus(target, effect.status, effect.duration || 3, null, context, silent);
        return 1;
    }

    if (effect.type === 'buff') {
        let statusId = effect.status;
        if (!statusId) {
            if (effect.stat === 'def') statusId = 104;
            if (effect.stat === 'atk') statusId = 102;
            if (effect.stat === 'spd') statusId = 103;
        }

        if (statusId) {
            applyStatus(target, statusId, effect.duration || 3, effect.value, context, silent);
            return 1;
        } else if (!silent && log) {
            log('battle.buffCast', { user: actor.name, target: target.name });
        }
    }

    if (effect.type === 'cureStatus') {
        const effectDispelLevel = effect.dispelLevel || 0;
        const idsToRemove = [];

        if (effect.tags && Array.isArray(effect.tags)) {
            target.statusEffects?.forEach(status => {
                const statusDef = statusDb[status.id];
                if (statusDef && statusDef.tags?.some(tag => effect.tags.includes(tag))) {
                    if ((statusDef.dispelLevel || 0) <= effectDispelLevel) idsToRemove.push(status.id);
                }
            });
        } else if (effect.status === 'all') {
            target.statusEffects?.forEach(status => {
                const statusDef = statusDb[status.id];
                if (statusDef && statusDef.type === 'statusTypes.debuff') {
                    if ((statusDef.dispelLevel || 0) <= effectDispelLevel) idsToRemove.push(status.id);
                }
            });
        } else if (effect.status) {
            let sId = effect.status;
            if (sId === 'poison') sId = 1;
            const status = target.statusEffects?.find(s => s.id === sId);
            if (status) {
                const statusDef = statusDb[status.id];
                if ((statusDef?.dispelLevel || 0) <= effectDispelLevel) idsToRemove.push(status.id);
            }
        }

        idsToRemove.forEach(id => removeStatus(target, id, context, silent));
        return idsToRemove.length;
    }

    return 0;
};
