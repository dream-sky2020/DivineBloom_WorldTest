import { statusDb } from '@/data/status';

export const applyStatus = (target, statusId, duration = 3, value = null, context, silent = false) => {
    const { log } = context;

    if (!target || !statusDb[statusId]) return;

    // Initialize if not present
    if (!target.statusEffects) target.statusEffects = [];

    // Check if already exists
    const existing = target.statusEffects.find(s => s.id === statusId);
    const statusDef = statusDb[statusId];

    if (existing) {
        existing.duration = duration; // Refresh duration
        if (value !== null) existing.value = value;
        if (!silent && log) log('battle.statusExtended', { target: target.name, status: statusDef.name });
    } else {
        target.statusEffects.push({
            id: statusId,
            duration: duration,
            value: value
        });
        if (!silent && log) log('battle.statusApplied', { target: target.name, status: statusDef.name });
    }
};

export const removeStatus = (target, statusId, context, silent = false) => {
    const { log } = context;

    if (!target || !target.statusEffects) return;
    const idx = target.statusEffects.findIndex(s => s.id === statusId);
    if (idx !== -1) {
        const statusDef = statusDb[statusId];
        target.statusEffects.splice(idx, 1);
        if (!silent && log) log('battle.statusCured', { target: target.name, status: statusDef.name });
    }
};

export const checkCrowdControl = (character) => {
    if (!character || !character.statusEffects) return false;

    // Step 1: Check for immunity effects first
    for (const status of character.statusEffects) {
        const statusDef = statusDb[status.id];
        if (statusDef && statusDef.effects) {
            for (const eff of statusDef.effects) {
                if (eff.trigger === 'checkAction' && eff.type === 'immunity') {
                    // Has immunity, not affected by crowd control
                    return false;
                }
            }
        }
    }

    // Step 2: Check for stun/control effects
    for (const status of character.statusEffects) {
        const statusDef = statusDb[status.id];
        if (statusDef && statusDef.effects) {
            for (const eff of statusDef.effects) {
                if (eff.trigger === 'checkAction' && eff.type === 'stun') {
                    if (Math.random() < (eff.chance || 1.0)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

// Note: processTurnStatuses requires processEffect, which creates a circular dependency if not handled.
// Solution: We will inject processEffect or its callback into this function, or define it in effects.js and export it here.
// For simplicity, we'll keep processTurnStatuses in the same place as processEffect (in effects.js) or
// make it a pure function that returns a list of effects to process.
// Let's put it in effects.js to keep the loop logic together.

