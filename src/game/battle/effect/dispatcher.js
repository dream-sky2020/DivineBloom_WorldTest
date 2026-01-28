import { damageHandler } from './handlers/damageHandler';
import { recoveryHandler } from './handlers/recoveryHandler';
import { statusHandler } from './handlers/statusHandler';
import { reviveHandler } from './handlers/reviveHandler';
import { statHandler } from './handlers/statHandler';
import { specialHandler } from './handlers/specialHandler';

const handlers = {
    damage: damageHandler,
    heal: recoveryHandler,
    heal_all: recoveryHandler,
    plague_rain: recoveryHandler,
    recoverMp: recoveryHandler,
    recover_mp: recoveryHandler,
    applyStatus: statusHandler,
    buff: statusHandler,
    cureStatus: statusHandler,
    revive: reviveHandler,
    revive_enemy: reviveHandler,
    stat_boost: statHandler,
    fullRestore: specialHandler
};

export const executeSingleEffect = (effectContext, battleContext) => {
    const { effect, target, actor, skill, silent, multiplier, previousResult } = effectContext;

    // Handle target redirection
    let effectiveTarget = target;
    if (effect.target === 'self' && actor) {
        effectiveTarget = actor;
        effectContext.isRedirection = true;
    }

    const handler = handlers[effect.type];
    if (handler) {
        return handler(effect, effectiveTarget, actor, skill, battleContext, silent, multiplier, previousResult);
    }

    console.warn('Unknown effect type:', effect.type);
    return 0;
};
