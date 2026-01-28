import { defineStore } from 'pinia';
import { ref, computed, reactive, toRefs } from 'vue';
import { skillsDb } from '@schema/skills';
import { itemsDb } from '@schema/items';
import { usePartyStore } from './party';

// --- Runtime Contexts ---
import { createBattleRuntimeContext } from '@schema/runtime/BattleRuntimeContext';
import { createInterfereRuntimeContext } from '@schema/runtime/InterfereRuntimeContext';
// ------------------------

// --- Battle System Facade Integration ---
import { battleFacade } from '@/game/battle';
// ----------------------------------------

// ECS Integration
import { world2d, world } from '@world2d';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BattleStore');

export const useBattleStore = defineStore('battle', () => {
    const partyStore = usePartyStore();

    // --- State (Managed by BattleRuntimeContext) ---
    const runtime = reactive(createBattleRuntimeContext());
    const {
        enemies,
        partySlots,
        turnCount,
        battlePhase: battleState,
        atbPaused,
        activeUnit,
        boostLevel,
        waitingForInput,
        pendingAction,
        validTargetIds,
        triggeredEnemyUuid,
        lastBattleResult
    } = toRefs(runtime);

    // Additional UI State
    const battleLog = ref([]);

    // --- Register Callbacks to Facade via InterfereRuntimeContext ---
    const interfere = createInterfereRuntimeContext({
        log: (key, params) => log(key, params),
        onDamagePop: (target, value) => {
            // Future: Trigger UI floating text here
        }
    });

    battleFacade.registerCallbacks(interfere);

    // --- Getters ---
    const activeCharacter = computed(() => {
        if (activeUnit.value && activeUnit.value.isPlayer) {
            return activeUnit.value;
        }
        return null;
    });

    const isPlayerTurn = computed(() => {
        return !!activeCharacter.value && atbPaused.value;
    });

    const enemiesDisplay = computed(() => {
        return enemies.value.map(enemy => battleFacade.getUnitDisplayData(enemy, {
            activeUnit: activeUnit.value,
            validTargetIds: validTargetIds.value
        }));
    });

    const partySlotsDisplay = computed(() => {
        return partySlots.value.map(slot => ({
            front: battleFacade.getUnitDisplayData(slot.front, {
                activeUnit: activeUnit.value,
                validTargetIds: validTargetIds.value
            }),
            back: battleFacade.getUnitDisplayData(slot.back, {
                activeUnit: activeUnit.value,
                validTargetIds: validTargetIds.value
            })
        }));
    });

    const battleItems = computed(() => {
        return partyStore.getAllItems.filter(item => item.type === 'itemTypes.consumable');
    });

    // --- Actions ---

    const checkSkillUsability = (skillId) => {
        if (!activeCharacter.value) return false;
        const skill = skillsDb[skillId];
        if (!skill) return false;
        return battleFacade.canUseSkill(activeCharacter.value, skill, getContext());
    };

    const setPendingAction = (action) => {
        pendingAction.value = action;
        validTargetIds.value = battleFacade.setPending.getValidTargetIds(battleFacade, action, {
            partySlots: partySlots.value,
            enemies: enemies.value,
            actor: activeUnit.value
        });
    };

    const adjustBoost = (delta) => {
        boostLevel.value = battleFacade.adjustBoost.calculateBoostLevel(delta, boostLevel.value, activeUnit.value);
    };

    // Build Context for Mechanics
    const getContext = () => ({
        log,
        performSwitch,
        partySlots: partySlots.value,
        enemies: enemies.value,
        turnCount: turnCount.value,
        // Item Cost Support
        checkItem: (itemId, amount) => {
            const item = partyStore.inventoryState.find(i => i.id === itemId);
            return item && item.count >= amount;
        },
        consumeItem: (itemId, amount) => {
            partyStore.removeItem(itemId, amount);
        },
        // Passive Effect Executor
        executeEffect: (effect, target, actor, skill) => {
            battleFacade.effect.processEffect(effect, target, actor, skill, getContext(), true);
        }
    });

    // Helper to find any party member
    const findPartyMemberWrapper = (id) => battleFacade.target.findPartyMember(partySlots.value, id);

    // Initialize Battle
    const initBattle = (enemyList, enemyUuid = null) => {
        // Reset state using BattleRuntimeContext
        const newState = createBattleRuntimeContext({
            triggeredEnemyUuid: enemyUuid,
            battlePhase: 'active'
        });
        Object.assign(runtime, newState);

        battleLog.value = [];

        // Setup Party Base State
        partyStore.initParty();

        // Use Facade to setup units
        const { enemies: newEnemies, partySlots: newPartySlots } = battleFacade.setupBattle({
            enemyList,
            partyFormation: partyStore.formation,
            getCharacterState: (id) => partyStore.getCharacterState(id)
        });

        enemies.value = newEnemies;
        partySlots.value = newPartySlots;

        // Process Battle Start (Log & Passives)
        const allUnits = [
            ...partySlots.value.map(s => s.front),
            ...partySlots.value.map(s => s.back),
            ...enemies.value
        ];
        battleFacade.onBattleStart(allUnits, getContext());
    };

    // ATB Tick
    const updateATB = (dt) => {
        battleFacade.updateATB.updateATB(
            battleFacade,
            dt,
            {
                enemies: enemies.value,
                partySlots: partySlots.value,
                atbPaused: atbPaused.value,
                battleState: battleState.value
            },
            {
                onStartTurn: (u) => startTurn(u)
            }
        );
    };

    const startTurn = (unit) => {
        atbPaused.value = true;
        activeUnit.value = unit;
        unit.isDefending = false;
        boostLevel.value = 0;

        battleFacade.startTurn.startTurn(
            battleFacade,
            unit,
            { context: getContext() },
            {
                onLog: log,
                onEndTurn: (u) => endTurn(u),
                onProcessEnemyTurn: (u) => processEnemyTurn(u),
                onWaitInput: () => { waitingForInput.value = true; }
            }
        );
    };

    const endTurn = (unit) => {
        activeUnit.value = null;
        atbPaused.value = false;
        waitingForInput.value = false;
        boostLevel.value = 0;

        battleFacade.endTurn.endTurn(unit, {
            onCheckStatus: () => checkBattleStatus()
        });
    };

    const processEnemyTurn = async (enemy) => {
        battleFacade.processEnemy.processEnemyTurn(
            battleFacade,
            enemy,
            {
                partySlots: partySlots.value,
                enemies: enemies.value,
                turnCount: turnCount.value,
                context: getContext()
            },
            {
                onLog: log,
                onEndTurn: (u) => endTurn(u),
                onReProcess: (u) => processEnemyTurn(u)
            }
        );
    };

    // Player Actions
    const playerAction = async (actionType, payload = null) => {
        if (!activeUnit.value || !activeUnit.value.isPlayer) return;

        waitingForInput.value = false;
        
        await battleFacade.playerAction.executePlayerAction(
            battleFacade,
            actionType,
            payload,
            { 
                actor: activeUnit.value, 
                boostLevel: boostLevel.value, 
                partySlots: partySlots.value 
            },
            { 
                context: getContext(), 
                skillsDb, 
                itemsDb 
            },
            {
                log,
                onRunAway: () => runAway(),
                onEndTurn: (u) => endTurn(u),
                onPerformSwitch: (idx) => performSwitch(idx),
                onWaitInput: () => { waitingForInput.value = true; }
            }
        );
    };

    const performSwitch = (slotIndex) => {
        const slot = partySlots.value[slotIndex];
        if (slot && slot.back) {
            const temp = slot.front;
            slot.front = slot.back;
            slot.back = temp;

            if (slot.front) slot.front.isDefending = false;
            if (slot.front.atb === undefined) slot.front.atb = 0;
            slot.front.isPlayer = true;

            log('battle.switchIn', { name: slot.front.name });
        }
    };

    const notifyECS = (resultType, drops = []) => {
        if (!triggeredEnemyUuid.value) return;

        try {
            const globalEntity = world.with('globalManager').first;

            if (globalEntity) {
                const resultData = {
                    win: resultType === 'victory',
                    fled: resultType === 'flee',
                    drops: drops,
                    exp: 0
                };
                logger.info('Setting BattleResult on GlobalEntity:', triggeredEnemyUuid.value, resultData);
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
        return battleFacade.checkStatus.checkBattleStatus(
            battleFacade,
            {
                enemies: enemies.value,
                partySlots: partySlots.value,
                triggeredEnemyUuid: triggeredEnemyUuid.value
            },
            { itemsDb },
            {
                onLog: log,
                onVictory: (uuid) => {
                    battleState.value = 'victory';
                    lastBattleResult.value = { result: 'victory', enemyUuid: uuid };
                },
                onDefeat: (uuid) => {
                    battleState.value = 'defeat';
                    lastBattleResult.value = { result: 'defeat', enemyUuid: uuid };
                },
                onAddLoot: (itemId, qty) => partyStore.addItem(itemId, qty),
                onUpdateParty: (slots) => partyStore.updatePartyAfterBattle(slots),
                onNotifyECS: (res, drops) => notifyECS(res, drops)
            }
        );
    };

    const runAway = () => {
        battleState.value = 'flee';
        lastBattleResult.value = { result: 'flee', enemyUuid: triggeredEnemyUuid.value };
        log('battle.runAway');
        notifyECS('flee');
    };

    const reset = () => {
        const newState = createBattleRuntimeContext();
        Object.assign(runtime, newState);
        battleLog.value = [];
    };

    const clearLog = () => {
        battleLog.value = [];
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
        enemiesDisplay,
        partySlotsDisplay,

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
        clearLog,
        reset
    };
});
