// src/game/battle/targetSystem.js

/**
 * Helper to extract all units from the mixed data structures
 * @param {Array} partySlots 
 * @param {Array} enemies 
 * @returns {Array} All units in a flat array
 */
const getAllUnits = (partySlots, enemies) => {
    const list = [];
    if (partySlots) {
        partySlots.forEach(slot => {
            if (slot.front) list.push(slot.front);
            if (slot.back) list.push(slot.back);
        });
    }
    if (enemies) {
        list.push(...enemies);
    }
    return list;
};

/**
 * Extract units from a specific source (Party Slots or Enemy Array)
 * @param {Array} source The source array (partySlots or enemies)
 * @param {Boolean} isPartySlots Whether the source is the partySlots structure
 * @returns {Array} Flat array of units
 */
const extractUnits = (source, isPartySlots) => {
    if (!source) return [];
    if (!isPartySlots) return source; // Assuming enemies is already a flat array of units

    const list = [];
    source.forEach(slot => {
        if (slot.front) list.push(slot.front);
        if (slot.back) list.push(slot.back);
    });
    return list;
};

/**
 * Find a unit by ID in a flat list of units
 * @param {Array} units List of unit objects
 * @param {String|Number} id UUID or ID
 * @returns {Object|null}
 */
const findUnit = (units, id) => {
    return units.find(u => u.uuid === id || u.id === id) || null;
};

/**
 * Legacy export for direct party lookup
 */
export const findPartyMember = (partySlots, id) => {
    const units = extractUnits(partySlots, true);
    return findUnit(units, id);
};

/**
 * Resolve targets based on actor context (Friend vs Foe)
 * @param {Object} context { partySlots, enemies, actor, targetId }
 * @param {String} targetType 
 * @returns {Array} Target units
 */
export const resolveTargets = ({ partySlots, enemies, actor, targetId }, targetType) => {
    const targets = [];
    if (!actor) return targets;

    const isPlayer = actor.isPlayer;

    // Define Teams
    // Team A: Actor's Team
    // Team B: Opponent's Team
    const myTeamRaw = isPlayer ? partySlots : enemies;
    const oppTeamRaw = isPlayer ? enemies : partySlots;

    const myTeamUnits = extractUnits(myTeamRaw, isPlayer);
    const oppTeamUnits = extractUnits(oppTeamRaw, !isPlayer);

    // Filter helpers
    const getAlive = (list) => list.filter(u => u.currentHp > 0);
    const getDead = (list) => list.filter(u => u.currentHp <= 0);

    // Resolve Logic
    switch (targetType) {
        // --- Opponent Targeting ---
        case 'single':
        case 'enemy':
            // 1. Try to find specific target in Opponent Team
            let target = targetId ? findUnit(oppTeamUnits, targetId) : null;

            // 2. If dead or not found, fallback to first alive opponent
            // (Unless specifically targeting dead, but 'enemy' usually implies alive)
            if (!target || target.currentHp <= 0) {
                const aliveOpponents = getAlive(oppTeamUnits);
                if (aliveOpponents.length > 0) {
                    // Pick random or first? Usually existing logic picked first or random.
                    // Default to first alive for stability, or random if previously random.
                    // Let's pick first alive to be safe, AI usually provides ID if it wants specific.
                    target = aliveOpponents[0];
                }
            }
            if (target && target.currentHp > 0) targets.push(target);
            break;

        case 'allEnemies': // All Opponents
        case 'all':
            targets.push(...getAlive(oppTeamUnits));
            break;

        // --- Ally Targeting ---
        case 'ally': // Single Ally (Self or Teammate)
            let ally = targetId ? findUnit(myTeamUnits, targetId) : actor;
            if (ally && ally.currentHp > 0) targets.push(ally);
            break;

        case 'allAllies': // All Teammates
            targets.push(...getAlive(myTeamUnits));
            break;

        case 'deadAlly': // Resurrection
            let deadAlly = targetId ? findUnit(myTeamUnits, targetId) : null;
            if (deadAlly && deadAlly.currentHp <= 0) targets.push(deadAlly);
            // Fallback: Pick first dead ally?
            if (!deadAlly && !targetId) {
                const deads = getDead(myTeamUnits);
                if (deads.length > 0) targets.push(deads[0]);
            }
            break;

        case 'deadEnemy': // Revive Opponent (e.g. for "Trapping God's Enemy in Living Hell")
            let deadOpponent = targetId ? findUnit(oppTeamUnits, targetId) : null;
            if (deadOpponent && deadOpponent.currentHp <= 0) targets.push(deadOpponent);
            // Fallback: Pick first dead opponent
            if (!deadOpponent && !targetId) {
                const deadOpponents = getDead(oppTeamUnits);
                if (deadOpponents.length > 0) targets.push(deadOpponents[0]);
            }
            break;

        case 'allDeadAllies':
            targets.push(...getDead(myTeamUnits));
            break;

        case 'self':
            targets.push(actor);
            break;

        case 'randomEnemy':
            {
                const alive = getAlive(oppTeamUnits);
                if (alive.length > 0) {
                    const r = Math.floor(Math.random() * alive.length);
                    targets.push(alive[r]);
                }
            }
            break;

        // --- Global Targeting ---
        case 'allUnits':
            targets.push(...getAlive(myTeamUnits), ...getAlive(oppTeamUnits));
            break;

        case 'allOtherUnits':
            const allAlive = [...getAlive(myTeamUnits), ...getAlive(oppTeamUnits)];
            targets.push(...allAlive.filter(u => u.uuid !== actor.uuid));
            break;

        case 'allOtherAllies':
            targets.push(...getAlive(myTeamUnits).filter(u => u.uuid !== actor.uuid));
            break;

        default:
            // Fallback for unknown types, treat as single opponent
            if (targetType === 'single') {
                // Already handled above
            }
            break;
    }

    return targets;
};
