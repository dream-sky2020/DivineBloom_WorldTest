import { statusDb } from '@/data/status';

/**
 * Calculates raw damage based on attacker, defender, and modifiers.
 */
export const calculateDamage = (attacker, defender, skill = null, effect = null, damageMultiplier = 1.0) => {
    let atk = Number(attacker.atk) || 10;
    let def = Number(defender.def) || 5;

    // Apply Status Modifiers
    if (attacker.statusEffects) {
        attacker.statusEffects.forEach(s => {
            const statusDef = statusDb[s.id];
            if (statusDef && statusDef.effects) {
                statusDef.effects.forEach(eff => {
                    if (eff.trigger === 'passive' && eff.type === 'statMod' && eff.stat === 'atk') {
                        atk *= eff.value;
                    }
                });
            }
        });
    }
    if (defender.statusEffects) {
        defender.statusEffects.forEach(s => {
            const statusDef = statusDb[s.id];
            if (statusDef && statusDef.effects) {
                statusDef.effects.forEach(eff => {
                    if (eff.trigger === 'passive' && eff.type === 'statMod' && eff.stat === 'def') {
                        def *= eff.value;
                    }
                });
            }
        });
    }

    // Skill modifiers
    let multiplier = 1.0;

    // Check Scaling from Effect or Fallback to generic logic
    if (effect && effect.value) {
        multiplier = effect.value;
    }

    // Apply Energy Multiplier
    if (damageMultiplier) {
        multiplier *= damageMultiplier;
    }

    if (skill || (effect && effect.scaling)) {
        const isMagic = (skill && skill.category === 'skillCategories.magic') || (effect && effect.scaling === 'mag');
        const isDefScaling = (effect && effect.scaling === 'def');

        if (isMagic) {
            // Magic ignores some defense
            def *= 0.7;
            const mag = Number(attacker.mag) || 10;
            // Removed MP scaling to prevent Bosses with 9999 MP from dealing excessive damage
            // Adjusted MAG scaling to compensate
            atk = mag * 1.2;
            // Elemental Modifiers
            if (skill && skill.element === 'elements.fire') multiplier *= 1.1;
            // ... more element logic
        } else if (isDefScaling) {
            // Scale with Defense (e.g. Shield Bash)
            atk = Number(attacker.def) || 5;
        } else {
            // Physical
            // ensure atk is a number
            atk *= 1.0;
        }
    }

    // Safety checks for NaN
    if (isNaN(atk)) atk = 10;
    if (isNaN(def)) def = 5;
    if (isNaN(multiplier)) multiplier = 1.0;

    let rawDmg = Math.max(1, (atk * multiplier) - (def / 2));
    if (isNaN(rawDmg)) rawDmg = 1;

    // Defend Status
    if (defender.isDefending) {
        rawDmg *= 0.5;
    }

    // Add some randomness based on data config
    let finalMultiplier = 1.0;
    
    // Check if minOffset or maxOffset are defined
    const hasMin = effect && typeof effect.minOffset === 'number';
    const hasMax = effect && typeof effect.maxOffset === 'number';

    if (hasMin || hasMax) {
        const minOffset = hasMin ? effect.minOffset : 0;
        const maxOffset = hasMax ? effect.maxOffset : 0;

        // Validation Checks
        if (hasMin && !hasMax && minOffset >= 0) {
            console.error(`Skill Config Error: minOffset (${minOffset}) must be less than 0 when maxOffset is undefined.`);
        } else if (!hasMin && hasMax && maxOffset <= 0) {
            console.error(`Skill Config Error: maxOffset (${maxOffset}) must be greater than 0 when minOffset is undefined.`);
        } else if (minOffset >= maxOffset) {
             console.error(`Skill Config Error: minOffset (${minOffset}) must be less than maxOffset (${maxOffset})`);
        } else {
            // Calculate Variance
            const range = maxOffset - minOffset;
            const offset = minOffset + Math.random() * range;
            finalMultiplier = 1.0 + offset;
        }
    }

    return Math.floor(rawDmg * finalMultiplier * 10); // Adjusted scaling
};

/**
 * Applies damage to a target and handles logging/side effects via callbacks.
 * @param {Object} target - The unit taking damage
 * @param {number} amount - The amount of damage
 * @param {Object} context - { log: Function, performSwitch: Function, partySlots: Array }
 * @param {boolean} silent - Whether to suppress logs
 */
export const applyDamage = (target, amount, context, silent = false) => {
    const { log, performSwitch, partySlots } = context;

    // Safety Check
    let safeAmount = Number(amount);
    if (isNaN(safeAmount)) {
        console.error('applyDamage received NaN amount!', { target, amount });
        safeAmount = 0;
    }
    safeAmount = Math.floor(safeAmount);

    // Ensure currentHp is valid to prevent NaN/350 bugs
    if (typeof target.currentHp !== 'number' || isNaN(target.currentHp)) {
        console.warn('applyDamage found NaN HP, resetting.', target.name);
        target.currentHp = target.currentHp || target.maxHp || 0;
    }

    const currentHp = target.currentHp;
    target.currentHp = Math.max(0, currentHp - safeAmount);

    // Log "NaN" damage as 0 visually if needed, but safeAmount handles logic
    if (!silent && log) {
        log('battle.damage', { target: target.name, amount: safeAmount });
        if (target.isDefending) {
            log('battle.defended');
        }
    }

    // Check if a front-row party member died and needs switching
    if (target.currentHp <= 0 && performSwitch && partySlots) {
        const slotIndex = partySlots.findIndex(s => s.front && s.front.id === target.id);
        if (slotIndex !== -1) {
            const slot = partySlots[slotIndex];
            if (slot.back && slot.back.currentHp > 0) {
                if (!silent && log) log('battle.fell', { target: target.name, backup: slot.back.name });
                performSwitch(slotIndex);
            }
        }
    }
    return safeAmount;
};

/**
 * Applies healing to a target.
 * @param {Object} target 
 * @param {number} amount 
 * @param {Object} context - { log: Function }
 * @param {boolean} silent 
 */
export const applyHeal = (target, amount, context, silent = false) => {
    const { log } = context;

    if (!target) return 0;

    // Ensure currentHp is valid
    if (typeof target.currentHp !== 'number' || isNaN(target.currentHp)) {
        target.currentHp = 0;
    }

    if (target.currentHp <= 0) {
        if (!silent && log) log('battle.incapacitated', { target: target.name });
        return 0;
    }

    let safeAmount = Number(amount);
    if (isNaN(safeAmount)) safeAmount = 0;
    safeAmount = Math.floor(safeAmount);

    const oldHp = target.currentHp;
    target.currentHp = Math.min(target.maxHp, target.currentHp + safeAmount);
    const healed = target.currentHp - oldHp;

    if (!silent && log) log('battle.recoveredHp', { target: target.name, amount: healed });
    return healed;
};

