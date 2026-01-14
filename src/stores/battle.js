import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { charactersDb } from '@/data/characters';
import { skillsDb } from '@/data/skills';
import { itemsDb } from '@/data/items';
import { useInventoryStore } from './inventory';
import { usePartyStore } from './party';
import { getEnemyAction } from '@/game/ai';
import { calculateDamage, applyDamage, applyHeal } from '@/game/battle/damageSystem';
import { processEffect, processTurnStatuses } from '@/game/battle/effectSystem';
import { applyStatus, removeStatus, checkCrowdControl } from '@/game/battle/statusSystem';
import { resolveTargets, findPartyMember, getValidTargetIds } from '@/game/battle/targetSystem';
import { resolveChainSequence, resolveRandomSequence, canUseSkill, paySkillCost, processPassiveTrigger } from '@/game/battle/skillSystem';
import { calculateAtbTick } from '@/game/battle/timeSystem';
import { calculateDrops, mergeDrops } from '@/game/battle/lootSystem';

// ECS Integration
import { world } from '@/game/ecs/world';
import { BattleResult } from '@/game/entities/components/BattleResult';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BattleStore');

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
    const boostLevel = ref(0); // Manually controlled BP usage for the current turn
    const triggeredEnemyUuid = ref(null);
    const lastBattleResult = ref(null); // { result: 'victory'|'defeat'|'flee', enemyUuid: string }
    const waitingForInput = ref(false); // Controls UI visibility
    const pendingAction = ref(null); // { type, id, targetType, data }
    const validTargetIds = ref([]);

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

    const checkSkillUsability = (skillId) => {
        if (!activeCharacter.value) return false;
        const skill = skillsDb[skillId];
        if (!skill) return false;
        return canUseSkill(activeCharacter.value, skill, getContext());
    };

    const setPendingAction = (action) => {
        pendingAction.value = action;
        if (action && action.targetType) {
            validTargetIds.value = getValidTargetIds({
                partySlots: partySlots.value,
                enemies: enemies.value,
                actor: activeUnit.value
            }, action.targetType);
        } else {
            validTargetIds.value = [];
        }
    };

    const adjustBoost = (delta) => {
        if (!activeUnit.value || !activeUnit.value.isPlayer) return;

        let newLevel;
        if (delta === 'reset') {
            newLevel = 0;
        } else {
            newLevel = boostLevel.value + delta;
        }

        const maxBoost = 3; // Max BP usage per turn constraint
        const currentEnergy = activeUnit.value.energy || 0;

        // Clamp between 0 and min(currentEnergy, maxBoost)
        newLevel = Math.max(0, Math.min(newLevel, currentEnergy, maxBoost));
        boostLevel.value = newLevel;
    };

    // Build Context for Mechanics
    const getContext = () => ({
        log,
        performSwitch,
        partySlots: partySlots.value,
        enemies: enemies.value,
        // Item Cost Support
        checkItem: (itemId, amount) => {
            const item = inventoryStore.inventoryState.find(i => i.id === itemId);
            return item && item.count >= amount;
        },
        consumeItem: (itemId, amount) => {
            inventoryStore.removeItem(itemId, amount);
        },
        // Passive Effect Executor
        executeEffect: (effect, target, actor, skill) => {
            processEffect(effect, target, actor, skill, getContext(), true);
        }
    });

    // Helper to find any party member
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
            energy: 0, // Energy Points (BP)
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
            energy: 0,
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
        waitingForInput.value = false;
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
                createUnit('character_emperor_shenwu', false),
                createUnit('character_shahryar', false),
                createUnit('character_hefietian', false),
                createUnit('character_yibitian', false)
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

        // Process Battle Start Passives
        const context = getContext();
        [...partySlots.value.map(s => s.front), ...partySlots.value.map(s => s.back), ...enemies.value].forEach(unit => {
            if (unit) processPassiveTrigger(unit, 'battle_start', context);
        });
    };

    // ATB Tick
    const updateATB = (dt) => {
        if (battleState.value !== 'active' || atbPaused.value) return;

        const MAX_ATB = 100;
        const MAX_BP = 6;
        // Back row also cycles at 100 now to generate Energy

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

            // Calculate tick using TimeSystem
            const tick = calculateAtbTick(unit, dt);

            // Update ATB (Cap for front row only)
            if (isBackRow) {
                unit.atb = (unit.atb || 0) + tick;
            } else {
                unit.atb = Math.min(MAX_ATB, (unit.atb || 0) + tick);
            }

            if (unit.atb >= MAX_ATB) {
                if (isBackRow) {
                    // Back Row Logic: Reset ATB (keep overflow), Add 2 Energy
                    unit.atb -= MAX_ATB;
                    unit.energy = Math.min(MAX_BP, (unit.energy || 0) + 2);
                } else if (!atbPaused.value) {
                    // Front Row Logic: Turn Ready, Add 1 Energy
                    unit.atb = MAX_ATB;
                    unit.energy = Math.min(MAX_BP, (unit.energy || 0) + 1);
                    startTurn(unit);
                    return;
                }
            }
        }
    };

    const startTurn = (unit) => {
        atbPaused.value = true;
        activeUnit.value = unit;
        unit.isDefending = false; // Reset Defend at start of turn
        boostLevel.value = 0; // Reset Boost Level on new turn

        const context = getContext();

        // Process Turn Start Passives (e.g. Mana Regen)
        processPassiveTrigger(unit, 'turn_start', context);

        // Process Turn Start Statuses (DoT, HoT)
        processTurnStatuses(unit, context);

        // Check if unit died from status
        if (unit.currentHp <= 0) {
            endTurn(unit);
            return;
        }

        // Check Crowd Control (Stun/Freeze)
        const cannotMove = checkCrowdControl(unit);
        if (cannotMove) {
            log('battle.cannotMove', { name: unit.name });

            // Process CC Skip Passives (e.g. Heroic Will)
            processPassiveTrigger(unit, 'on_cc_skip', context);

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
            waitingForInput.value = true;
            // UI will see isPlayerTurn = true
        }
    };

    const endTurn = (unit) => {
        // Set to negative value to provide a visual "cooldown" where the bar stays empty for a bit
        unit.atb = -25;
        activeUnit.value = null;
        atbPaused.value = false;
        waitingForInput.value = false;
        boostLevel.value = 0; // Ensure boost is reset
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
                enemies: enemies.value,
                turnCount: turnCount.value
            };

            const action = getEnemyAction(enemy.id, context);

            if (!action || action.type === 'wait') {
                endTurn(enemy);
                return;
            }

            // Simple Enemy AI Energy Usage (Optional: For now enemies don't use BP or just reset)
            // But if we want consistent data structure, we can consume it if they have it.
            // For now, let's just execute.
            const result = executeBattleAction(enemy, action);

            if (result && result.consumeTurn === false) {
                // If turn is not consumed (e.g. Free Action), act again immediately
                // To prevent infinite loops with free actions, we might want a safety check,
                // but for now, we trust the AI/Data design.
                processEnemyTurn(enemy);
            } else {
                endTurn(enemy);
            }
        }, 1000);
    };

    const executeBattleAction = (actor, action) => {
        const context = getContext();
        let targetType = 'single';
        let effects = [];
        let skillData = null;
        let consumeTurn = true; // Default to consuming turn

        // --- Energy System Consumption ---
        let energyMult = 1.0;
        if ((actor.energy || 0) > 0) {
            energyMult = 1.0 + (actor.energy * 0.5);
            // Optionally log for enemies if they use it
            if (actor.isPlayer) { // Should not happen here usually but safety check
                log('battle.energyConsume', { name: actor.name, energy: actor.energy });
            }
            actor.energy = 0;
        }
        const actionContext = { ...context, energyMult };

        // 1. Prepare Action Data
        if (action.type === 'custom_skill') {
            targetType = action.targetType || 'single';
            effects = action.effects || [];
            if (action.consumeTurn === false) consumeTurn = false;

            // Custom Log
            if (action.logKey) {
                // Determine target name for log if possible
                let targetName = '';
                if (action.targetId) {
                    // Try to find target name in both lists (we don't know who it is yet contextually)
                    // But we can use the resolveTargets to find it properly later, 
                    // or just quick lookup.
                    // Let's defer target name logging or do a quick search.
                    const t = findPartyMemberWrapper(action.targetId) || enemies.value.find(e => e.uuid === action.targetId || e.id === action.targetId);
                    if (t) targetName = t.name;
                }
                log(action.logKey, { name: actor.name, target: targetName });
            }

        } else if (action.type === 'skill') {
            skillData = skillsDb[action.skillId];
            if (!skillData) return { consumeTurn: false }; // Fail safe

            targetType = skillData.targetType || 'single';
            effects = skillData.effects || [];
            if (skillData.consumeTurn === false) consumeTurn = false;

            log('battle.useSkill', { user: actor.name, skill: skillData.name });

        } else if (action.type === 'attack') {
            targetType = 'enemy';
            effects = [{ type: 'damage', value: 1, scaling: 'atk' }];
            // Start log is handled below when targets are found for "Attacks X"
            // or we can log generic "Attacks!" here.
            // Existing logic logged "Attacks X"
        }

        // Override targetType if specified in action (AI overrides DB)
        if (action.targetType) targetType = action.targetType;

        // 2. Resolve Targets (Context Aware)
        const targets = resolveTargets({
            partySlots: partySlots.value,
            enemies: enemies.value,
            actor: actor,
            targetId: action.targetId
        }, targetType);

        // Attack specific log
        if (action.type === 'attack' && targets.length > 0) {
            // If multiple targets, maybe just log first?
            log('battle.attacks', { attacker: actor.name, target: targets[0].name });
        }

        // 3. Apply Effects
        targets.forEach(target => {
            let lastResult = 0;
            effects.forEach(eff => {
                lastResult = processEffect(eff, target, actor, skillData, actionContext, false, lastResult);
            });
        });

        return { consumeTurn };
    };

    // Player Actions
    const playerAction = async (actionType, payload = null) => {
        if (!activeUnit.value || !activeUnit.value.isPlayer) return;

        waitingForInput.value = false; // Hide UI immediately
        const actor = activeUnit.value;
        let consumeTurn = true; // Default true

        // Calculate Energy Multiplier from Manual Boost Level
        let energyMult = 1.0;
        let consumedEnergy = 0;
        if (boostLevel.value > 0) {
            energyMult = 1.0 + (boostLevel.value * 0.5); // Example scaling
            consumedEnergy = boostLevel.value;
            log('battle.energyConsume', { name: actor.name, energy: consumedEnergy });
        }

        // Context with energy multiplier
        const actionContext = { ...getContext(), energyMult };

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
            if (item && item.consumeTurn === false) consumeTurn = false;

            log('battle.useItem', { user: actor.name, item: item.name });

            // Centralized Item Logic
            // For items, we might not use energy multiplier, or do we?
            // "When character attacks or uses skill, consume energy"
            // Items are not explicitly mentioned but typically consumables don't scale with BP.
            // Let's assume NO for items for now unless requested.
            handleItemEffect(itemId, targetId, actor);

        } else if (actionType === 'skill') {
            const skill = skillsDb[skillId];
            if (skill) {
                // Check Usability
                if (!canUseSkill(actor, skill, getContext())) {
                    log('battle.notEnoughMp'); // or generic "cannot use"
                    return; // Don't end turn
                }

                if (skill.consumeTurn === false) consumeTurn = false;

                // Pay Cost
                paySkillCost(actor, skill, getContext());

                log('battle.useSkill', { user: actor.name, skill: skill.name });

                // Deduct Energy
                if (consumedEnergy > 0) {
                    actor.energy = Math.max(0, (actor.energy || 0) - consumedEnergy);
                }

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
                                const val = processEffect(finalEffect, target, actor, skill, actionContext, true);
                                if (finalEffect.type === 'damage') damageDealt += val;
                            });

                            log('battle.chainHit', { count: hitIndex, target: target.name, amount: damageDealt });
                        });

                    } else if (skill.randomHits) {
                        // Random Sequence Logic
                        const hits = resolveRandomSequence(skill, enemies.value);

                        hits.forEach(({ target, hitIndex }) => {
                            let damageDealt = 0;
                            skill.effects.forEach(eff => {
                                const val = processEffect(eff, target, actor, skill, actionContext, true);
                                if (eff.type === 'damage') damageDealt += val;
                            });

                            // Use specific log key for random hits
                            log('battle.randomHit', { count: hitIndex, target: target.name, amount: damageDealt });
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
                                lastResult = processEffect(effect, target, actor, skill, actionContext, false, lastResult);
                            });
                        });
                    }
                }
            }
        } else if (actionType === 'attack') {
            log('battle.attackStart', { attacker: actor.name });

            // Deduct Energy
            if (consumedEnergy > 0) {
                actor.energy = Math.max(0, (actor.energy || 0) - consumedEnergy);
            }

            // Resolve Target
            const targets = resolveTargets({
                partySlots: partySlots.value,
                enemies: enemies.value,
                actor: actor,
                targetId: targetId
            }, 'enemy'); // Attack is typically single enemy

            if (targets.length > 0) {
                const target = targets[0];
                const dmg = calculateDamage(actor, target, null, null, energyMult); // Pass Multiplier
                applyDamage(target, dmg, actionContext);
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
            // Skip Logic: Charge Energy
            actor.energy = Math.min(6, (actor.energy || 0) + 1);
            log('battle.skipTurn', { name: actor.name });
            // Optionally log energy gain?
        } else if (actionType === 'run') {
            runAway();
            return;
        }

        if (actionDone) {
            if (consumeTurn) {
                endTurn(actor);
            } else {
                // Return control to player if turn not consumed
                waitingForInput.value = true;
            }
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

    /**
     * Notify ECS of battle result
     * @param {'victory'|'defeat'|'flee'} resultType 
     * @param {Array} drops - Optional drops for victory
     */
    const notifyECS = (resultType, drops = []) => {
        if (!triggeredEnemyUuid.value) return;

        try {
            // Find global entity
            const globalEntity = world.with('globalManager').first;

            if (globalEntity) {
                const resultData = {
                    win: resultType === 'victory',
                    fled: resultType === 'flee',
                    drops: drops,
                    exp: 0     // TODO: Collect actual exp
                };

                logger.info('Setting BattleResult on GlobalEntity:', triggeredEnemyUuid.value, resultData);

                // 直接添加 BattleResult 组件
                // 如果已存在会覆盖，这正是我们想要的（最新的结果覆盖旧的）
                world.addComponent(globalEntity, 'battleResult', {
                    uuid: triggeredEnemyUuid.value,
                    result: resultData
                });

            } else {
                logger.warn('GlobalEntity not found, cannot push battle result!');
            }
        } catch (e) {
            logger.error('Failed to create external event:', e);
        }
    };

    const checkBattleStatus = () => {
        const isDead = (u) => u && u.statusEffects && u.statusEffects.some(s => s.id === 'status_dead');

        const allEnemiesDead = enemies.value.every(e => isDead(e));
        if (allEnemiesDead) {
            battleState.value = 'victory';
            lastBattleResult.value = { result: 'victory', enemyUuid: triggeredEnemyUuid.value };
            log('battle.victory');

            // --- Loot Calculation ---
            const allDrops = []
            enemies.value.forEach(enemy => {
                // Use original DB data for drops if available to avoid runtime mutations affecting it
                // But calculateDrops handles the structure from DB or runtime if structure matches
                const drops = calculateDrops(enemy)
                if (drops.length > 0) {
                    allDrops.push(drops)
                }
            })
            const finalDrops = mergeDrops(allDrops)

            // Add to Inventory Store
            finalDrops.forEach(drop => {
                inventoryStore.addItem(drop.itemId, drop.qty)
                const item = itemsDb[drop.itemId]
                if (item) {
                    log('battle.foundLoot', { item: item.name, qty: drop.qty })
                }
            })

            // Sync state back to PartyStore
            partyStore.updatePartyAfterBattle(partySlots.value);

            // Notify ECS with drops
            notifyECS('victory', finalDrops);

            return true;
        }

        const allPlayersDead = partySlots.value.every(s =>
            (!s.front || isDead(s.front)) &&
            (!s.back || isDead(s.back))
        );
        if (allPlayersDead) {
            battleState.value = 'defeat';
            lastBattleResult.value = { result: 'defeat', enemyUuid: triggeredEnemyUuid.value };
            log('battle.defeat');

            // Notify ECS
            notifyECS('defeat');

            return true;
        }
        return false;
    };

    const runAway = () => {
        battleState.value = 'flee';
        lastBattleResult.value = { result: 'flee', enemyUuid: triggeredEnemyUuid.value };
        log('battle.runAway');

        // Notify ECS
        notifyECS('flee');
    };

    const reset = () => {
        turnCount.value = 1;
        battleState.value = 'idle';
        battleLog.value = [];
        activeUnit.value = null;
        atbPaused.value = false;
        enemies.value = [];
        // Party slots are references to PartyStore, so just clear the array
        partySlots.value = [];
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
        boostLevel,
        waitingForInput,
        pendingAction,
        validTargetIds,

        // Getters
        activeCharacter,
        isPlayerTurn,
        battleItems,

        // Actions
        initBattle,
        playerAction,
        setPendingAction,
        checkSkillUsability,
        updateATB,
        runAway,
        lastBattleResult,
        adjustBoost,
        reset
    };
});
