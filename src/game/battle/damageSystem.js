import { statusDb } from '@/data/status';
import { skillsDb } from '@/data/skills';
import { applyStatus, removeStatus } from '@/game/battle/statusSystem';

/**
 * 收集单位身上的 HP 归零相关被动
 */
const collectHpZeroHandlers = (unit) => {
    const handlers = [];
    if (!unit.skills) return handlers;

    unit.skills.forEach(skillId => {
        const skill = skillsDb[skillId];
        if (skill && skill.type === 'skillTypes.passive' && skill.effects) {
            skill.effects.forEach(eff => {
                if (eff.trigger === 'onHpZero') {
                    handlers.push({ skill, effect: eff });
                }
            });
        }
    });
    return handlers;
};

/**
 * 执行具体的归零效果逻辑
 */
const executeHpZeroEffect = (target, skill, effect, context, silent) => {
    const { log } = context;

    switch (effect.variant) {
        case 'revive':
            // 复活/回复逻辑
            const healAmount = effect.healPercent ? target.maxHp * effect.healPercent : (effect.value || 1);
            applyHeal(target, healAmount, context, silent);
            // 假设日志系统支持这种 key
            if (!silent && log) log('battle.revived', { target: target.name, skill: skill.name.zh });
            return true;

        case 'will_to_live':
            // 经典的进入濒死逻辑
            applyStatus(target, 'status_dying', 999, null, context);
            if (!silent && log) log('battle.enteredDying', { target: target.name });
            return true;

        case 'add_status':
            // 添加额外状态（如麻痹、不屈、隐身等）
            if (effect.status) {
                applyStatus(target, effect.status, effect.duration || 3, null, context);
            }
            return true;

        case 'call_of_death':
            // 强制死亡逻辑
            return false; // 不拦截死亡判定

        default:
            return false;
    }
};

/**
 * 处理初次 HP 归零事件
 */
const handleHpZeroEvent = (target, context, silent) => {
    const { log } = context;
    const handlers = collectHpZeroHandlers(target);
    let deathPrevented = false;

    // 按优先级排序 (priority 越大越先执行)
    handlers.sort((a, b) => (b.effect.priority || 0) - (a.effect.priority || 0));

    for (const { skill, effect } of handlers) {
        // 检查次数限制 (如果有)
        if (effect.limit) {
            target.usageRecords = target.usageRecords || {};
            const usedCount = target.usageRecords[skill.id] || 0;
            if (usedCount >= effect.limit) continue;
            target.usageRecords[skill.id] = usedCount + 1;
        }

        // 检查概率
        if (effect.chance !== undefined && Math.random() > effect.chance) continue;

        // 执行效果
        const success = executeHpZeroEffect(target, skill, effect, context, silent);
        if (success && effect.preventDeath) {
            deathPrevented = true;
        }
    }

    // 如果没有任何被动拦截死亡，则执行默认死亡
    if (!deathPrevented) {
        const isDead = target.statusEffects?.some(s => s.id === 'status_dead');
        if (!isDead) {
            applyStatus(target, 'status_dead', 999, null, context);
            target.atb = 0;
            if (!silent && log) log('battle.death', { target: target.name });
        }
    }
};

/**
 * 处理濒死状态下受创事件
 */
const handleDyingDamageEvent = (target, amount, context, silent) => {
    const { log } = context;
    const isDying = target.statusEffects?.some(s => s.id === 'status_dying');
    if (!isDying) return;

    let deathChance = 0.35; // 默认死亡率
    
    // 允许被动修改死亡率 (例如求生意志的变体)
    const handlers = collectHpZeroHandlers(target);
    for (const { effect } of handlers) {
        if (effect.variant === 'will_to_live' && effect.chance !== undefined) {
            deathChance = effect.chance;
        }
    }

    if (Math.random() < deathChance) {
        applyStatus(target, 'status_dead', 999, null, context);
        removeStatus(target, 'status_dying', context, true);
        target.atb = 0;
        if (!silent && log) log('battle.death', { target: target.name });
    } else {
        if (!silent && log) log('battle.struggling', { target: target.name });
    }
};

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
    const wasAlreadyZero = currentHp === 0;
    target.currentHp = Math.max(0, currentHp - safeAmount);

    // HP-Zero/Death Logic via Passive Skills
    if (target.currentHp === 0 && !wasAlreadyZero) {
        handleHpZeroEvent(target, context, silent);
    } else if (target.currentHp === 0 && wasAlreadyZero && safeAmount > 0) {
        handleDyingDamageEvent(target, safeAmount, context, silent);
    }

    // Log "NaN" damage as 0 visually if needed, but safeAmount handles logic
    if (!silent && log) {
        log('battle.damage', { target: target.name, amount: safeAmount });
        if (target.isDefending) {
            log('battle.defended');
        }
    }
    
    // ... 原有的 Incapacitated 检查 ...

    // Check if a front-row party member is incapacitated and needs switching
    const isDead = target.statusEffects && target.statusEffects.some(s => s.id === 'status_dead');
    const isIncapacitated = isDead;

    if (isIncapacitated && performSwitch && partySlots) {
        const slotIndex = partySlots.findIndex(s => s.front && s.front.id === target.id);
        if (slotIndex !== -1) {
            const slot = partySlots[slotIndex];
            // Only switch if backup is alive (not dead status)
            const backupAlive = slot.back && !slot.back.statusEffects?.some(s => s.id === 'status_dead');
            if (backupAlive) {
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

    const isDead = target.statusEffects && target.statusEffects.some(s => s.id === 'status_dead');
    if (isDead) {
        if (!silent && log) log('battle.incapacitated', { target: target.name });
        return 0;
    }

    // Ensure currentHp is valid

    let safeAmount = Number(amount);
    if (isNaN(safeAmount)) safeAmount = 0;
    safeAmount = Math.floor(safeAmount);

    const oldHp = target.currentHp;
    target.currentHp = Math.min(target.maxHp, target.currentHp + safeAmount);
    const healed = target.currentHp - oldHp;

    if (healed > 0) {
        // Recovery from Dying
        const isDying = target.statusEffects && target.statusEffects.some(s => s.id === 'status_dying');
        if (isDying && target.currentHp > 0) {
            removeStatus(target, 'status_dying', context);
            if (!silent && log) log('battle.recoveredFromDying', { target: target.name });
        }
    }

    if (!silent && log && healed > 0) log('battle.recoveredHp', { target: target.name, amount: healed });
    return healed;
};

