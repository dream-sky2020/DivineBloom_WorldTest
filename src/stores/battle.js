import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { charactersDb } from '@/data/characters';
import { skillsDb } from '@/data/skills';
import { itemsDb } from '@/data/items';
import { statusDb } from '@/data/status'; // Keep for now if used elsewhere, or remove if fully moved
import { useInventoryStore } from './inventory';
import { usePartyStore } from './party';
import { getEnemyAction } from '@/game/ai';
import { calculateDamage, applyDamage, applyHeal } from '@/game/battle/damageSystem';
import { processEffect, processTurnStatuses } from '@/game/battle/effectSystem';
import { applyStatus, removeStatus, checkCrowdControl } from '@/game/battle/statusSystem';
import { resolveTargets, findPartyMember } from '@/game/battle/targetSystem';
import { resolveChainSequence } from '@/game/battle/skillSystem';
import { calculateAtbTick } from '@/game/battle/timeSystem';

export const useBattleStore = defineStore('battle', () => {
    const inventoryStore = useInventoryStore();
    const partyStore = usePartyStore();

    // --- State ---
    const enemies = ref([]);
    const partySlots = ref([]);
    const turnCount = ref(1);
    const battleState = ref('idle'); // idle, active, victory, defeat
    const battleLog = ref([]);
    const atbPaused = ref(false);
    const activeUnit = ref(null); // The unit currently acting (Player or Enemy)
    const triggeredEnemyUuid = ref(null);
    const lastBattleResult = ref(null); // { result: 'victory'|'defeat'|'flee', enemyUuid: string }

    // --- Getters ---
    const activeCharacter = computed(() => {
        // Return activeUnit if it is a player character
        if (activeUnit.value && activeUnit.value.isPlayer) {
            return activeUnit.value;
        }
        return null;
    });

    const isPlayerTurn = computed(() => {
        return !!activeCharacter.value && atbPaused.value;
    });

    // Get Battle Items (Consumables only)
    const battleItems = computed(() => {
        return inventoryStore.getAllItems.filter(item => item.type === 'itemTypes.consumable');
    });

    // --- Actions ---

    // Build Context for Mechanics
    const getContext = () => ({
        log,
        performSwitch,
        partySlots: partySlots.value,
        enemies: enemies.value
    });

    // Helper to find any party member
    // Delegated to targetSystem, but kept as a store wrapper if needed by template (unlikely) or internal legacy
    // Replaced internal usage with imported findPartyMember where possible, or keep using this wrapper
    const findPartyMemberWrapper = (id) => findPartyMember(partySlots.value, id);


    const generateUUID = () => 'u' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const createUnit = (dbId, isPlayer = false) => {
        const data = charactersDb[dbId];
        if (!data) return null;
        return {
            ...data,
            uuid: generateUUID(),
            // Ensure runtime stats are initialized from initialStats
            currentHp: data.initialStats.hp,
            maxHp: data.initialStats.hp,
            currentMp: data.initialStats.mp,
            maxMp: data.initialStats.mp,
            atk: data.initialStats.atk || 50,
            def: data.initialStats.def || 30,
            spd: data.initialStats.spd || 10,
            mag: data.initialStats.mag || 10,
            // Runtime state
            skills: data.skills || [], // Load skills from data
            statusEffects: [],
            isDefending: false,
            atb: 0,
            isPlayer: isPlayer,
            actionCount: 0
        };
    };

    const hydrateUnit = (state, isPlayer) => {
        if (!state) return null;
        return {
            ...state,
            uuid: generateUUID(),
            // Runtime state for battle
            statusEffects: [],
            isDefending: false,
            atb: 0,
            isPlayer: isPlayer,
            actionCount: 0
        };
    };

    // Initialize Battle
    const initBattle = (enemyList, enemyUuid = null) => {
        // Reset state
        turnCount.value = 1;
        battleLog.value = [];
        activeUnit.value = null;
        atbPaused.value = false;
        triggeredEnemyUuid.value = enemyUuid;
        lastBattleResult.value = null;

        // Setup Enemies
        if (enemyList) {
            enemies.value = enemyList.map(e => {
                // Try to hydrate from DB if ID exists
                if (e.id && charactersDb[e.id]) {
                    const base = createUnit(e.id, false);
                    // Merge overrides (like currentHp) from the passed object
                    return { ...base, ...e, atb: 0, isPlayer: false, actionCount: 0 };
                }
                return { ...e, atb: 0, isPlayer: false, actionCount: 0 };
            });
        } else {
            // Default Mock Enemies - Loaded from charactersDb using helper
            enemies.value = [
                createUnit(101, false),
                createUnit(102, false),
                createUnit(103, false),
                createUnit(104, false)
            ].filter(e => e !== null);
        }

        // Setup Party (Load from PartyStore)
        partyStore.initParty();
        partySlots.value = partyStore.formation.map(slot => ({
            front: hydrateUnit(partyStore.getCharacterState(slot.front), true),
            back: hydrateUnit(partyStore.getCharacterState(slot.back), true)
        }));

        battleState.value = 'active';
        log('battle.started');
    };

    // ATB Tick
    const updateATB = (dt) => {
        if (battleState.value !== 'active' || atbPaused.value) return;

        const MAX_ATB = 100;
        const RESERVE_MAX_ATB = 500; 

        // Collect all active units with metadata to avoid repeated lookups
        const unitEntries = [];
        enemies.value.forEach(e => {
            if (e.currentHp > 0) unitEntries.push({ unit: e, isBackRow: false });
        });
        partySlots.value.forEach(slot => {
            if (slot.front && slot.front.currentHp > 0) unitEntries.push({ unit: slot.front, isBackRow: false });
            if (slot.back && slot.back.currentHp > 0) unitEntries.push({ unit: slot.back, isBackRow: true });
        });

        // Increment ATB
        for (const { unit, isBackRow } of unitEntries) {
            const maxAtb = isBackRow ? RESERVE_MAX_ATB : MAX_ATB;
            
            // Calculate tick using TimeSystem
            const tick = calculateAtbTick(unit, dt);
            
            unit.atb = Math.min(maxAtb, unit.atb + tick);

            // Only trigger turn for non-back row units
            if (!isBackRow && unit.atb >= MAX_ATB && !atbPaused.value) {
                // Unit is ready
                unit.atb = MAX_ATB;
                startTurn(unit);
                // Break to handle one unit at a time
                return;
            }
        }
    };

    const startTurn = (unit) => {
        atbPaused.value = true;
        activeUnit.value = unit;
        unit.isDefending = false; // Reset Defend at start of turn

        // Process Turn Start Statuses (DoT, HoT)
        processTurnStatuses(unit, getContext());

        // Check if unit died from status
        if (unit.currentHp <= 0) {
            endTurn(unit);
            return;
        }

        // Check Crowd Control (Stun/Freeze)
        const cannotMove = checkCrowdControl(unit);
        if (cannotMove) {
            log('battle.cannotMove', { name: unit.name });
            setTimeout(() => {
                endTurn(unit);
            }, 1000);
            return;
        }

        if (!unit.isPlayer) {
            // Enemy Logic
            processEnemyTurn(unit);
        } else {
            // Player Logic: Waiting for UI input
            // UI will see isPlayerTurn = true
        }
    };

    const endTurn = (unit) => {
        // Set to negative value to provide a visual "cooldown" where the bar stays empty for a bit
        unit.atb = -25;
        activeUnit.value = null;
        atbPaused.value = false;
        checkBattleStatus();
    };

    const processEnemyTurn = async (enemy) => {
        // Delay for dramatic effect
        setTimeout(() => {
            if (enemy.currentHp <= 0) {
                endTurn(enemy);
                return;
            }

            // Increment Action Count
            if (typeof enemy.actionCount === 'undefined') enemy.actionCount = 0;
            enemy.actionCount++;

            // Context
            const context = {
                actor: enemy,
                party: partySlots.value,
                turnCount: turnCount.value
            };

            const action = getEnemyAction(enemy.id, context);

            if (!action) {
                endTurn(enemy);
                return;
            }

            if (action.type === 'custom_skill') {
                // ... custom_skill logic ...
                // For custom_skill, we assume targetId is already resolved to a Player ID by the AI
                // But we still need to map the type correctly if it relies on generic types.
                
                // Let's rely on the explicit targetId mapping if possible.
                // But resolveTargets needs correct list context.
                
                // FIX: Treat custom_skill targets as "Ally" (Player) by default if it's an attack
                // But custom skills might be heals. 
                // Let's assume custom_skill targetType follows standard conventions:
                // 'single'/'enemy' -> Opponent (Player)
                // 'ally' -> Teammate (Enemy)
                
                let type = action.targetType;
                if (type === 'single' || type === 'enemy' || type === 'allEnemies' || type === 'all') {
                    // Map to Player context
                     if (type === 'allEnemies' || type === 'all') type = 'allAllies';
                     else type = 'ally'; // Target a Player (ID match in partySlots)
                } else if (type === 'ally' || type === 'allAllies') {
                    // Map to Enemy context
                     if (type === 'allAllies') type = 'allEnemies';
                     else type = 'enemy';
                }

                // Log
                if (action.logKey) {
                    let logParams = { name: enemy.name };
                    if (action.targetId) {
                         // Try finding name in both lists to be safe
                         const t = findPartyMemberWrapper(action.targetId) || enemies.value.find(e => e.uuid === action.targetId || e.id === action.targetId);
                         if (t) logParams.target = t.name;
                    }
                    log(action.logKey, logParams);
                }

                const targets = resolveTargets({
                    partySlots: partySlots.value,
                    enemies: enemies.value,
                    actor: enemy,
                    targetId: action.targetId
                }, type);

                // Apply Effects
                targets.forEach(target => {
                    if (action.effects) {
                        let lastResult = 0;
                        action.effects.forEach(eff => {
                            lastResult = processEffect(eff, target, enemy, null, getContext(), false, lastResult);
                        });
                    }
                });

            } else if (action.type === 'skill') {
                const skill = skillsDb[action.skillId];
                if (skill) {
                    // Log
                    log('battle.useSkill', { user: enemy.name, skill: skill.name });

                    // --- FIX: Target Type Mapping for Enemy AI ---
                    // Enemy "enemy" -> Player (Ally in context)
                    // Enemy "ally"  -> Enemy (Enemy in context)
                    
                    let effectiveTargetType = action.targetType || skill.targetType || 'single';
                    
                    // Map logic:
                    // If target is OPPONENT (default, single, enemy, allEnemies) -> Convert to ALLY/PARTY scope
                    // If target is FRIEND (ally, allAllies) -> Convert to ENEMY scope
                    
                    if (['single', 'enemy', 'allEnemies', 'all'].includes(effectiveTargetType)) {
                        if (effectiveTargetType === 'allEnemies' || effectiveTargetType === 'all') {
                            effectiveTargetType = 'allAllies'; // All Players
                        } else {
                            effectiveTargetType = 'ally'; // Single Player
                        }
                    } else if (['ally', 'allAllies', 'deadAlly', 'allDeadAllies'].includes(effectiveTargetType)) {
                         if (effectiveTargetType === 'allAllies') effectiveTargetType = 'allEnemies';
                         else if (effectiveTargetType === 'allDeadAllies') effectiveTargetType = 'allDeadAllies'; // Wait, resolveTargets uses partySlots for DeadAllies.
                         // This is tricky. resolveTargets is hardcoded:
                         // 'allDeadAllies' -> partySlots dead
                         // We can't easily swap context for 'dead' types without changing resolveTargets signature.
                         // BUT, for now, let's assume Enemies don't revive each other often.
                         // If they do, we might need a better TargetSystem that accepts "OpponentList" and "FriendList".
                         
                         else effectiveTargetType = 'enemy'; // Single Enemy Teammate
                    }

                    // Fallback for AI single target without ID
                    if ((effectiveTargetType === 'ally') && !action.targetId) {
                         // Pick random player
                         const alive = partySlots.value.filter(s => s.front && s.front.currentHp > 0).map(s => s.front);
                         if (alive.length > 0) action.targetId = alive[Math.floor(Math.random() * alive.length)].id;
                    }

                    const targets = resolveTargets({
                        partySlots: partySlots.value,
                        enemies: enemies.value,
                        actor: enemy,
                        targetId: action.targetId
                    }, effectiveTargetType);

                    // Apply Effects
                    targets.forEach(target => {
                        if (skill.effects) {
                            let lastResult = 0;
                            skill.effects.forEach(eff => {
                                lastResult = processEffect(eff, target, enemy, skill, getContext(), false, lastResult);
                            });
                        }
                    });
                }
            } else if (action.type === 'attack') {
                // FIX: Attack always targets OPPONENT -> Player (Ally in context)
                // Originally was 'enemy', which resolves to enemies.value.
                
                // Resolve Target: map 'enemy' to 'ally' logic
                let effectiveType = 'ally'; 
                
                // Fallback ID if missing
                if (!action.targetId) {
                     const alive = partySlots.value.filter(s => s.front && s.front.currentHp > 0).map(s => s.front);
                     if (alive.length > 0) action.targetId = alive[Math.floor(Math.random() * alive.length)].id;
                }

                const target = findPartyMemberWrapper(action.targetId);
                if (target) {
                    log('battle.attacks', { attacker: enemy.name, target: target.name });
                    const dmg = calculateDamage(enemy, target);
                    applyDamage(target, dmg, getContext());
                }
            }

            endTurn(enemy);
        }, 1000);
    };

    // Player Actions
    const playerAction = async (actionType, payload = null) => {
        if (!activeUnit.value || !activeUnit.value.isPlayer) return;

        const actor = activeUnit.value;

        // Normalize payload
        let targetId = null;
        let skillId = null;
        let itemId = null;

        if (typeof payload === 'object' && payload !== null) {
            targetId = payload.targetId;
            skillId = payload.skillId;
            itemId = payload.itemId;
        } else {
            skillId = payload; // Legacy support
        }

        let actionDone = true;

        if (actionType === 'item') {
            if (!itemId) return;

            // Consume Item
            inventoryStore.removeItem(itemId, 1);
            const item = itemsDb[itemId];
            log('battle.useItem', { user: actor.name, item: item.name });

            // Centralized Item Logic
            handleItemEffect(itemId, targetId, actor);

        } else if (actionType === 'skill') {
            const skill = skillsDb[skillId];
            if (skill) {
                // Deduct MP
                const cost = parseInt(skill.cost) || 0;
                if (actor.currentMp < cost) {
                    log('battle.notEnoughMp');
                    return; // Don't end turn
                }
                actor.currentMp -= cost;
                log('battle.useSkill', { user: actor.name, skill: skill.name });

                // Skill Logic
                if (skill.effects) {
                    if (skill.chain) {
                        // Chain Logic via SkillSystem
                        const initialTarget = enemies.value.find(e => e.uuid === targetId || e.id === targetId);
                        const hits = resolveChainSequence(skill, initialTarget, enemies.value);

                        hits.forEach(({ target, multiplier, hitIndex }) => {
                             // Log each hit
                             // Note: We need a way to accumulate damage for the log if needed, 
                             // but resolveChainSequence doesn't execute the damage, just tells us who and how much mult.
                             
                             let damageDealt = 0;
                             skill.effects.forEach(eff => {
                                const finalEffect = { ...eff };
                                if (finalEffect.type === 'damage') {
                                    finalEffect.value *= multiplier;
                                }
                                const val = processEffect(finalEffect, target, actor, skill, getContext(), true);
                                if (finalEffect.type === 'damage') damageDealt += val;
                             });
                             
                             log('battle.chainHit', { count: hitIndex, target: target.name, amount: damageDealt });
                        });

                    } else {
                        // Generic Effect Processing
                        // Resolve Targets via TargetSystem
                        const targets = resolveTargets({
                            partySlots: partySlots.value,
                            enemies: enemies.value,
                            actor: actor,
                            targetId: targetId
                        }, skill.targetType);

                        // Apply Effects
                        targets.forEach(target => {
                            let lastResult = 0;
                            skill.effects.forEach(effect => {
                                lastResult = processEffect(effect, target, actor, skill, getContext(), false, lastResult);
                            });
                        });
                    }
                }
            }
        } else if (actionType === 'attack') {
            log('battle.attackStart', { attacker: actor.name });

            // Resolve Target
            const targets = resolveTargets({
                partySlots: partySlots.value,
                enemies: enemies.value,
                actor: actor,
                targetId: targetId
            }, 'enemy'); // Attack is typically single enemy

            if (targets.length > 0) {
                const target = targets[0];
                const dmg = calculateDamage(actor, target);
                applyDamage(target, dmg, getContext());
            }
        } else if (actionType === 'defend') {
            actor.isDefending = true;
            log('battle.defending', { name: actor.name });
        } else if (actionType === 'switch') {
            // Find slot index for this actor
            const slotIndex = partySlots.value.findIndex(s => s.front && s.front.id === actor.id);
            if (slotIndex !== -1) {
                const slot = partySlots.value[slotIndex];
                if (slot && slot.back && slot.back.currentHp > 0) {
                    performSwitch(slotIndex);
                } else {
                    log('battle.cannotSwitch');
                    return; // Don't end turn
                }
            }
        } else if (actionType === 'skip') {
            log('battle.skipTurn', { name: actor.name });
        } else if (actionType === 'run') {
            runAway();
            return;
        }

        if (actionDone) {
            endTurn(actor);
        }
    };


    const handleItemEffect = (itemId, targetId, actor) => {
        const item = itemsDb[itemId];
        if (!item || !item.effects) return;

        // Resolve Targets using TargetSystem
        // Note: items usually map to generic target types. 
        // We assume item.targetType matches what resolveTargets expects.
        
        const targets = resolveTargets({
             partySlots: partySlots.value,
             enemies: enemies.value,
             actor: actor,
             targetId: targetId
        }, item.targetType);

        // Apply all effects to all targets
        targets.forEach(target => {
             item.effects.forEach(effect => {
                 processEffect(effect, target, actor, null, getContext());
             });
        });
    };

    // --- Status System ---
    // (Moved to status.js, kept here for store action references if needed, but actually we use the imported ones now via processEffect)
    // The internal status helpers (applyStatus, removeStatus) are no longer needed here as they are imported by effects.js.
    // However, if processATB (updateATB) or other logic needs them, we should update those too.

    // Note: updateATB uses status effects for speed calculation, which is read-only.
    // processTurnStatuses is called in startTurn.

    // We can remove the local definitions of processEffect, applyStatus, removeStatus, processTurnStatuses, checkCrowdControl, performSwitch (wait, performSwitch is used by applyDamage callback, so it must stay or be passed)

    // performSwitch needs access to partySlots.value (ref), so it should stay in the store.
    // applyDamage needs to call performSwitch. We pass performSwitch in getContext().

    const performSwitch = (slotIndex) => {
        const slot = partySlots.value[slotIndex];
        if (slot && slot.back) {
            const temp = slot.front;
            slot.front = slot.back;
            slot.back = temp;

            // Switching in clears defense
            if (slot.front) slot.front.isDefending = false;
            // Initialize ATB for new char (maybe partial?)
            if (slot.front.atb === undefined) slot.front.atb = 0;
            slot.front.isPlayer = true; // Ensure flag

            log('battle.switchIn', { name: slot.front.name });
        }
    };

    // Removing old function definitions that are now imported or unused
    // processEffect, applyStatus, removeStatus, processTurnStatuses, checkCrowdControl, applyDamage, applyHeal are removed from here.

    const checkBattleStatus = () => {
        const allEnemiesDead = enemies.value.every(e => e.currentHp <= 0);
        if (allEnemiesDead) {
            battleState.value = 'victory';
            lastBattleResult.value = { result: 'victory', enemyUuid: triggeredEnemyUuid.value };
            log('battle.victory');

            // Sync state back to PartyStore
            partyStore.updatePartyAfterBattle(partySlots.value);

            return true;
        }

        const allPlayersDead = partySlots.value.every(s => !s.front || s.front.currentHp <= 0);
        if (allPlayersDead) {
            battleState.value = 'defeat';
            lastBattleResult.value = { result: 'defeat', enemyUuid: triggeredEnemyUuid.value };
            log('battle.defeat');
            return true;
        }
        return false;
    };

    const runAway = () => {
        battleState.value = 'flee';
        lastBattleResult.value = { result: 'flee', enemyUuid: triggeredEnemyUuid.value };
        log('battle.runAway'); // Make sure translation exists or text
    };

    const log = (keyOrMsg, params = {}) => {
        if (typeof keyOrMsg === 'string') {
            const hasParams = params && Object.keys(params).length > 0;
            if (!hasParams && (keyOrMsg.includes(' ') || /[\u4e00-\u9fa5]/.test(keyOrMsg))) {
                battleLog.value.push(`[${new Date().toLocaleTimeString()}] ${keyOrMsg}`);
            } else {
                battleLog.value.push({
                    key: keyOrMsg,
                    params: params || {},
                    timestamp: new Date()
                });
            }
        } else {
            battleLog.value.push(`[${new Date().toLocaleTimeString()}] ${String(keyOrMsg)}`);
        }

        if (battleLog.value.length > 50) battleLog.value.shift();
    };

    return {
        // State
        enemies,
        partySlots,
        turnCount,
        battleState,
        battleLog,
        atbPaused,
        activeUnit,

        // Getters
        activeCharacter,
        isPlayerTurn,
        battleItems,

        // Actions
        initBattle,
        playerAction,
        updateATB,
        runAway,
        lastBattleResult
    };
});
