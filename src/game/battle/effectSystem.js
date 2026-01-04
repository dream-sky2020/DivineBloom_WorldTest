import { statusDb } from '@/data/status';
import { calculateDamage, applyDamage, applyHeal } from './damageSystem';
import { applyStatus, removeStatus } from './statusSystem';

export const processEffect = (effect, target, actor, skill = null, context, silent = false, previousResult = 0) => {
    const { log, partySlots } = context;

    if (!effect) return 0;

    // Handle target redirection (e.g., for self-heals like Vampiric Bite)
    if (effect.target === 'self' && actor) {
        target = actor;
    }

    switch (effect.type) {
        case 'heal':
        case 'heal_all':
            if (target) {
                let amount = Number(effect.value) || 0;
                if (effect.scaling === 'maxHp') {
                    amount = Math.floor(target.maxHp * amount);
                } else if (effect.scaling === 'damage_dealt') {
                    amount = Math.floor(previousResult * amount);
                }
                return applyHeal(target, amount, context, silent);
            }
            break;
        case 'recoverMp':
            if (target) {
                const amount = Number(effect.value) || 0;
                target.currentMp = Math.min(target.maxMp, target.currentMp + amount);
                if (!silent && log) log('battle.recoveredMp', { target: target.name, amount });
                return amount;
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

                // Add debuffs
                const debuffs = [1, 2, 3, 4, 5, 7, 8]; // Poison, Burn, Freeze, Paralysis, Bleed, Def Down, Atk Down
                const duration = effect.duration || 20;

                debuffs.forEach(statusId => {
                    applyStatus(target, statusId, duration, null, context, silent);
                });

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
                    // Use standard calculation
                    dmg = calculateDamage(actor, target, skill, effect);
                } else if (effect.scaling === 'maxHp') {
                    // MaxHP scaling (e.g. for Poison/DoT)
                    const maxHp = target.maxHp || 100;
                    dmg = Math.floor(maxHp * (Number(effect.value) || 0));
                } else if (effect.scaling === 'str') {
                    // Explicit str scaling (from AI or skills)
                    // Treat as atk for now
                    dmg = calculateDamage(actor, target, skill, { ...effect, scaling: 'atk' });
                } else {
                    // Fixed damage
                    dmg = Number(effect.value) || 0;
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
            } else {
                if (!silent && log) log('battle.buffCast', { user: actor.name, target: target ? target.name : { zh: '友方全体', en: 'allies' } });
            }
            break;
        case 'cureStatus':
            if (target) {
                // Map string "poison" to ID 1, etc.
                let sId = null;
                if (effect.status === 'poison') sId = 1;

                if (sId) removeStatus(target, sId, context, silent);
                else if (!silent && log) log('battle.statusCured', { target: target.name, status: effect.status });
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
                // Apply Poison (Status 1)
                applyStatus(target, 1, effect.duration || 3, null, context, silent);
                // Apply Regen (Status 101)
                applyStatus(target, 101, effect.duration || 3, null, context, silent);

                // Heal
                let amount = Number(effect.value) || 0;
                if (effect.scaling === 'maxHp') {
                    amount = Math.floor(target.maxHp * amount);
                }

                return applyHeal(target, amount, context, silent);
            }
            break;
        default:
            console.warn('Unknown effect type:', effect.type);
    }
    return 0;
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

        // Decrement Duration
        status.duration--;
        if (status.duration <= 0) {
            character.statusEffects.splice(i, 1);
            if (log) log('battle.statusWoreOff', { target: character.name, status: statusDef.name });
        }
    }
};

