import { statusDb } from '@/data/status';
import { calculateDamage, applyDamage, applyHeal } from './damageSystem';
import { applyStatus, removeStatus } from './statusSystem';

const applyRandomOffset = (value, effect, logName = '') => {
    if (!effect) return value;

    const hasMin = typeof effect.minOffset === 'number';
    const hasMax = typeof effect.maxOffset === 'number';

    if (!hasMin && !hasMax) return value;

    const minOffset = hasMin ? effect.minOffset : 0;
    const maxOffset = hasMax ? effect.maxOffset : 0;

    // Validation Checks
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

const _executeSingleEffect = (effect, target, actor, skill, context, silent, previousResult) => {
    const { log, partySlots, energyMult } = context;

    // Use energy multiplier from context if available, default to 1
    const multiplier = energyMult || 1.0;

    // Handle target redirection (e.g., for self-heals like Vampiric Bite)
    if (effect.target === 'self' && actor) {
        target = actor;
    }

    switch (effect.type) {
        case 'heal':
        case 'heal_all':
            if (target) {
                let amount = Number(effect.value) || 0;

                // Percent-based recovery (from Max HP)
                if (effect.percent) {
                    amount += Math.floor((target.maxHp || 0) * effect.percent);
                }

                if (effect.scaling === 'maxHp') {
                    amount = Math.floor(target.maxHp * amount);
                } else if (effect.scaling === 'damage_dealt') {
                    amount = Math.floor(previousResult * amount);
                }
                // Apply Energy Multiplier to Heals too? Usually yes for "Effectiveness"
                amount *= multiplier;

                // Apply Random Variance
                amount = applyRandomOffset(amount, effect);

                return applyHeal(target, amount, context, silent);
            }
            break;
        case 'recoverMp':
        case 'recover_mp':
            if (target) {
                let amount = Number(effect.value) || 0;

                // Percent-based recovery (from Max MP)
                if (effect.percent) {
                    amount += Math.floor((target.maxMp || 0) * effect.percent);
                }

                target.currentMp = Math.min(target.maxMp, target.currentMp + amount);
                if (!silent && log) log('battle.recoveredMp', { target: target.name, amount });
                return amount;
            }
            break;
        case 'stat_boost':
            // Permanent stat boost (battle runtime only)
            if (target && effect.stat) {
                const statName = effect.stat; // 'atk', 'def', etc.
                const pct = Number(effect.value) || 0;
                
                // Base stat value should be preserved if we want additive stacking properly,
                // but for now we just multiply current value. 
                // Better: Check if we have baseStats, otherwise assume current is base.
                // Or: This is a runtime modification that persists until battle end.
                
                if (typeof target[statName] === 'number') {
                    const increase = Math.floor(target[statName] * pct);
                    target[statName] += increase;
                    if (!silent && log) log('battle.statBoost', { target: target.name, stat: statName, amount: increase });
                    return increase;
                }
            }
            break;
        case 'revive':
            if (target && target.currentHp <= 0) {
                const pct = Number(effect.value) || 0.1;
                target.currentHp = Math.floor(target.maxHp * pct);
                if (!silent && log) log('battle.revived', { target: target.name });
                return target.currentHp;
            } else {
                if (!silent && log) log('battle.noEffect');
                return 0;
            }
            break;
        case 'revive_enemy':
            if (target && target.currentHp <= 0) {
                const pct = Number(effect.value) || 0.1;
                target.currentHp = Math.floor(target.maxHp * pct);

                if (!silent && log) log('battle.revived', { target: target.name });

                return target.currentHp;
            } else {
                if (!silent && log) log('battle.noEffect');
                return 0;
            }
            break;
        case 'damage':
            if (target) {
                let dmg = 0;
                if (effect.scaling === 'atk' || effect.scaling === 'mag') {
                    // Use standard calculation, pass multiplier
                    dmg = calculateDamage(actor, target, skill, effect, multiplier);
                } else if (effect.scaling === 'maxHp') {
                    // MaxHP scaling (e.g. for Poison/DoT)
                    const maxHp = target.maxHp || 100;
                    dmg = Math.floor(maxHp * (Number(effect.value) || 0));
                    dmg *= multiplier; // Apply multiplier
                } else if (effect.scaling === 'str') {
                    // Explicit str scaling (from AI or skills)
                    // Treat as atk for now
                    dmg = calculateDamage(actor, target, skill, { ...effect, scaling: 'atk' }, multiplier);
                } else {
                    // Fixed damage
                    dmg = Number(effect.value) || 0;
                    dmg *= multiplier; // Apply multiplier
                    dmg = applyRandomOffset(dmg, effect);
                }

                // Final Safety Check
                if (isNaN(dmg) || dmg < 0) dmg = 1;

                applyDamage(target, dmg, context, silent);
                return dmg;
            }
            break;
        case 'applyStatus':
            if (target) {
                // Check chance if present
                if (effect.chance && Math.random() > effect.chance) {
                    return 0; // Failed chance
                }
                applyStatus(target, effect.status, effect.duration || 3, null, context, silent);
                return 1;
            }
            break;
        case 'buff':
            // Attempt to map dynamic buff to statusDb
            let statusId = null;
            if (effect.stat === 'def') statusId = 104; // Defense Up
            if (effect.stat === 'atk') statusId = 102; // Attack Up
            if (effect.stat === 'spd') statusId = 103; // Haste

            if (statusId) {
                applyStatus(target, statusId, effect.duration || 3, effect.value, context, silent);
            } else if (effect.status) {
                // Support explicit status ID in type='buff' (legacy/mixed usage)
                applyStatus(target, effect.status, effect.duration || 3, effect.value, context, silent);
            } else {
                if (!silent && log) log('battle.buffCast', { user: actor.name, target: target ? target.name : { zh: '友方全体', en: 'allies' } });
            }
            break;
        case 'cureStatus':
            if (target) {
                if (effect.status === 'all') {
                    if (target.statusEffects) {
                        const idsToRemove = [];
                        target.statusEffects.forEach(status => {
                            const statusDef = statusDb[status.id];
                            if (statusDef && statusDef.type === 'statusTypes.debuff') {
                                idsToRemove.push(status.id);
                            }
                        });

                        idsToRemove.forEach(id => {
                            removeStatus(target, id, context, silent);
                        });
                    }
                } else {
                    // Map string "poison" to ID 1, etc.
                    let sId = null;
                    if (effect.status === 'poison') sId = 1;

                    if (sId) removeStatus(target, sId, context, silent);
                    else if (!silent && log) log('battle.statusCured', { target: target.name, status: effect.status });
                }
            }
            break;
        case 'fullRestore':
            if (partySlots) {
                partySlots.forEach(slot => {
                    if (slot.front) {
                        slot.front.currentHp = slot.front.maxHp;
                        slot.front.currentMp = slot.front.maxMp;
                        slot.front.statusEffects = [];
                    }
                    if (slot.back) {
                        slot.back.currentHp = slot.back.maxHp;
                        slot.back.currentMp = slot.back.maxMp;
                        slot.back.statusEffects = [];
                    }
                });
                if (!silent && log) log('battle.partyRestored');
            }
            break;
        case 'plague_rain':
            if (target) {
                // Heal
                let amount = Number(effect.value) || 0;

                // Percent-based recovery (from Max HP)
                if (effect.percent) {
                    amount += Math.floor((target.maxHp || 0) * effect.percent);
                }

                if (effect.scaling === 'maxHp') {
                    amount = Math.floor(target.maxHp * amount);
                }
                amount = applyRandomOffset(amount, effect);

                return applyHeal(target, amount, context, silent);
            }
            break;
        default:
            console.warn('Unknown effect type:', effect.type);
    }
    return 0;
};

export const processEffect = (effect, target, actor, skill = null, context, silent = false, previousResult = 0) => {
    if (!effect) return 0;

    let times = effect.times || 1;

    // Handle random range (minTimes/maxTimes)
    if (effect.minTimes && effect.maxTimes && effect.maxTimes >= effect.minTimes) {
        times = Math.floor(Math.random() * (effect.maxTimes - effect.minTimes + 1)) + effect.minTimes;
    }

    let totalResult = 0;

    for (let i = 0; i < times; i++) {
        // Accumulate result (e.g. total damage)
        totalResult += _executeSingleEffect(effect, target, actor, skill, context, silent, previousResult);

        // Note: previousResult for the NEXT iteration is not updated here. 
        // Typically multi-hit skills apply the same logic each time.
        // If we needed chaining (e.g. each hit increases next dmg), we'd need more complex logic.
    }

    return totalResult;
};

export const processTurnStatuses = (character, context) => {
    const { log } = context;

    if (!character || !character.statusEffects) return;

    // Iterate backwards to allow removal
    for (let i = character.statusEffects.length - 1; i >= 0; i--) {
        const status = character.statusEffects[i];
        const statusDef = statusDb[status.id];

        if (statusDef && statusDef.effects) {
            statusDef.effects.forEach(eff => {
                if (eff.trigger === 'turnStart') {
                    // Pass actor as character itself for self-inflicted effects (DoT/HoT)
                    const val = processEffect(eff, character, character, null, context, true);

                    // Custom logs based on type
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

        // Decrement Duration (Check decayMode)
        // Default to 'turn' if not specified
        const decayMode = statusDef.decayMode || 'turn';

        if (decayMode === 'turn') {
            status.duration--;
            if (status.duration <= 0) {
                character.statusEffects.splice(i, 1);
                if (log) log('battle.statusWoreOff', { target: character.name, status: statusDef.name });
            }
        } else if (decayMode === 'action') {
            // Handled elsewhere (e.g. after action execution)
        } else if (decayMode === 'none') {
            // Do not decrement
        }
    }
};
