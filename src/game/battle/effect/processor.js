import { statusDb } from '@schema/status';
import { executeSingleEffect } from './dispatcher';

/**
 * 核心流程：处理单个效果（支持多次重复执行）
 */
export const processEffect = (effect, target, actor, skill = null, context, silent = false, previousResult = 0) => {
    if (!effect) return 0;

    let times = effect.times || 1;
    if (effect.minTimes && effect.maxTimes && effect.maxTimes >= effect.minTimes) {
        times = Math.floor(Math.random() * (effect.maxTimes - effect.minTimes + 1)) + effect.minTimes;
    }

    let totalResult = 0;
    for (let i = 0; i < times; i++) {
        totalResult += executeSingleEffect(effect, target, actor, skill, context, silent, previousResult);
    }
    return totalResult;
};

/**
 * 核心流程：处理回合开始/结束的状态触发
 */
export const processTurnStatuses = (character, context) => {
    const { log } = context;
    if (!character || !character.statusEffects) return;

    for (let i = character.statusEffects.length - 1; i >= 0; i--) {
        const status = character.statusEffects[i];
        const statusDef = statusDb[status.id];
        if (!statusDef) continue;

        if (statusDef.effects) {
            statusDef.effects.forEach(eff => {
                if (eff.trigger === 'turnStart') {
                    const val = processEffect(eff, character, character, null, context, true);
                    if (log) {
                        if (eff.type === 'damage') {
                            log('battle.statusDamage', { target: character.name, amount: val, status: statusDef.name });
                        } else if (eff.type === 'heal') {
                            log('battle.statusHeal', { target: character.name, amount: val, status: statusDef.name });
                        }
                    }
                }
            });
        }

        const decayMode = statusDef.decayMode || 'turn';
        if (decayMode === 'turn') {
            status.duration--;
            if (status.duration <= 0) {
                if (statusDef.effects) {
                    statusDef.effects.forEach(eff => {
                        if (eff.trigger === 'onStatusEnd') {
                            processEffect(eff, character, character, null, context, true);
                        }
                    });
                }
                character.statusEffects.splice(i, 1);
                if (log) log('battle.statusWoreOff', { target: character.name, status: statusDef.name });
            }
        }
    }
};
