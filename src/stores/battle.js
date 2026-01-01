import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { charactersDb } from '@/data/characters';
import { skillsDb } from '@/data/skills';
import { itemsDb } from '@/data/items';
import { useInventoryStore } from './inventory';

// --- Helper Functions ---

const calculateDamage = (attacker, defender, skill = null, effect = null) => {
    let atk = attacker.atk || 10;
    let def = defender.def || 5;

    // Skill modifiers
    let multiplier = 1.0;

    // Check Scaling from Effect or Fallback to generic logic
    if (effect && effect.value) {
        multiplier = effect.value;
    }

    if (skill) {
        if (skill.category === 'skillCategories.magic' || (effect && effect.scaling === 'mag')) {
            // Magic ignores some defense
            def *= 0.7;
            atk = (attacker.currentMp * 0.5) + (attacker.mag * 2 || atk); // Use MAG stat if available
            // Elemental Modifiers
            if (skill.element === 'elements.fire') multiplier *= 1.1;
            // ... more element logic
        } else {
            // Physical
            atk *= 1.0;
        }
    }

    let rawDmg = Math.max(1, (atk * multiplier) - (def / 2));

    // Defend Status
    if (defender.isDefending) {
        rawDmg *= 0.5;
    }

    // Add some randomness +/- 10%
    const variance = (Math.random() * 0.2) + 0.9;
    return Math.floor(rawDmg * variance * 10); // Adjusted scaling
};

export const useBattleStore = defineStore('battle', () => {
    const inventoryStore = useInventoryStore();

    // --- State ---
    const enemies = ref([]);
    const partySlots = ref([]);
    const activeSlotIndex = ref(0);
    const turnCount = ref(1);
    const battleState = ref('idle'); // idle, player_turn, enemy_turn, victory, defeat
    const battleLog = ref([]);

    // --- Getters ---
    const activeCharacter = computed(() => {
        const slot = partySlots.value[activeSlotIndex.value];
        return slot ? slot.front : null;
    });

    const isPlayerTurn = computed(() => battleState.value === 'player_turn');

    // Get Battle Items (Consumables only)
    const battleItems = computed(() => {
        return inventoryStore.getAllItems.filter(item => item.type === 'itemTypes.consumable');
    });

    // --- Actions ---

    // Helper to find any party member
    const findPartyMember = (id) => {
        for (const slot of partySlots.value) {
            if (slot.front && slot.front.id === id) return slot.front;
            if (slot.back && slot.back.id === id) return slot.back;
        }
        return null;
    };

    // Initialize Battle
    const initBattle = (enemyList) => {
        // Reset state
        turnCount.value = 1;
        battleLog.value = [];
        activeSlotIndex.value = 0;

        // Setup Enemies
        if (enemyList) {
            enemies.value = enemyList;
        } else {
            // Default Mock Enemies
            enemies.value = [
                {
                    id: 1,
                    name: { zh: '神武皇帝', en: 'Emperor Shenwu' },
                    hp: 50000, maxHp: 50000,
                    isBoss: true, color: '#fbbf24',
                    atk: 8, def: 10,
                    isDefending: false
                },
                {
                    id: 2,
                    name: { zh: '山鲁亚尔', en: 'Shahryar' },
                    hp: 45000, maxHp: 45000,
                    isBoss: true, color: '#94a3b8',
                    atk: 7, def: 8,
                    isDefending: false
                }
            ];
        }

        // Setup Party (Load from global state or mock)
        partySlots.value = [
            { front: createBattleChar(5, [101, 401]), back: createBattleChar(1, [101]) },
            { front: createBattleChar(6, [102]), back: createBattleChar(2, [102]) },
            { front: createBattleChar(7, [201, 202, 301, 303]), back: createBattleChar(3, [203]) },
            { front: createBattleChar(4, [101, 302]), back: null }
        ];

        battleState.value = 'player_turn';
        log('Battle Started!');

        // Ensure first character is ready
        if (activeCharacter.value) {
            activeCharacter.value.isDefending = false;
        }
    };

    const createBattleChar = (dbId, skillIds = []) => {
        const data = charactersDb[dbId];
        if (!data) return null;
        return {
            ...data,
            currentHp: data.initialStats.hp,
            maxHp: data.initialStats.hp,
            currentMp: data.initialStats.mp,
            maxMp: data.initialStats.mp,
            atk: data.initialStats.atk || 50,
            def: data.initialStats.def || 30,
            skills: skillIds, // Assign skills here
            statusEffects: [],
            isDefending: false
        };
    };

    // Player Actions
    const playerAction = async (actionType, payload = null) => {
        if (battleState.value !== 'player_turn') return;

        const actor = activeCharacter.value;
        if (!actor) return;

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

        if (actionType === 'item') {
            if (!itemId) return;

            // Consume Item
            inventoryStore.removeItem(itemId, 1);
            const item = itemsDb[itemId];
            log(`${actor.name.zh} uses ${item.name.zh}`);

            // Centralized Item Logic
            handleItemEffect(itemId, targetId, actor);

        } else if (actionType === 'skill') {
            const skill = skillsDb[skillId];
            if (skill) {
                // Deduct MP
                const cost = parseInt(skill.cost) || 0;
                if (actor.currentMp < cost) {
                    log('Not enough MP!');
                    return;
                }
                actor.currentMp -= cost;
                log(`${actor.name.zh} uses ${skill.name.zh}`);

                // Skill Logic
                if (skill.effects) {
                    // Generic Effect Processing
                    skill.effects.forEach(effect => {
                        if (skill.targetType === 'allEnemies') {
                            for (const enemy of enemies.value) {
                                if (enemy.hp > 0) {
                                    processEffect(effect, enemy, actor, skill);
                                }
                            }
                        } else if (skill.targetType === 'allAllies') {
                            partySlots.value.forEach(slot => {
                                if (slot.front && slot.front.currentHp > 0) processEffect(effect, slot.front, actor, skill);
                            });
                        } else {
                            // Single Target
                            let target = null;
                            if (skill.targetType === 'ally' || skill.targetType === 'deadAlly') {
                                target = targetId ? findPartyMember(targetId) : actor;
                            } else if (skill.targetType === 'enemy') {
                                target = enemies.value.find(e => e.id === targetId) || enemies.value.find(e => e.hp > 0);
                            }
                            processEffect(effect, target, actor, skill);
                        }
                    });
                } else if (skill.category === 'skillCategories.support') {
                    // Fallback for support skills without effects array (should be none now)
                } else {
                    // Fallback for legacy skills without effects (should be none now if data is updated)
                    log(`${skill.name.zh} has no effects configured.`);
                }
            }
        } else if (actionType === 'attack') {
            log(`${actor.name.zh} attacks`);

            // Resolve Target
            let target = enemies.value.find(e => e.id === targetId);
            if (!target) {
                target = enemies.value.find(e => e.hp > 0);
            }

            if (target) {
                const dmg = calculateDamage(actor, target);
                applyDamage(target, dmg);
            }
        } else if (actionType === 'defend') {
            actor.isDefending = true;
            log(`${actor.name.zh} is defending.`);
        } else if (actionType === 'switch') {
            const slot = partySlots.value[activeSlotIndex.value];
            if (slot && slot.back && slot.back.currentHp > 0) {
                performSwitch(activeSlotIndex.value);
            } else {
                log('Cannot switch!');
                return; // Don't end turn if switch failed
            }
            return;
        }

        checkBattleStatus();
        if (battleState.value === 'player_turn') {
            nextTurn();
        }
    };

    const processEffect = (effect, target, actor, skill = null) => {
        if (!effect) return;

        switch (effect.type) {
            case 'heal':
                if (target) applyHeal(target, effect.value);
                break;
            case 'recoverMp':
                if (target) {
                    target.currentMp = Math.min(target.maxMp, target.currentMp + effect.value);
                    log(`${target.name.zh} recovered ${effect.value} MP`);
                }
                break;
            case 'revive':
                if (target && target.currentHp <= 0) {
                    target.currentHp = Math.floor(target.maxHp * effect.value);
                    log(`${target.name.zh} revived!`);
                } else {
                    log('But nothing happened...');
                }
                break;
            case 'damage':
                if (target) {
                    let dmg = 0;
                    if (effect.scaling === 'atk' || effect.scaling === 'mag') {
                        // Use standard calculation
                        dmg = calculateDamage(actor, target, skill, effect);
                    } else {
                        // Fixed damage
                        dmg = effect.value;
                    }
                    applyDamage(target, dmg);
                }
                break;
            case 'buff':
                // Placeholder for buff logic
                log(`${actor.name.zh} casts buff on ${target ? target.name.zh : 'allies'}`);
                break;
            case 'cureStatus':
                if (target) {
                    // Placeholder for cure status
                    log(`${target.name.zh} cured of ${effect.status}`);
                }
                break;
            case 'fullRestore':
                if (partySlots.value) {
                    partySlots.value.forEach(slot => {
                        if (slot.front) {
                            slot.front.currentHp = slot.front.maxHp;
                            slot.front.currentMp = slot.front.maxMp;
                        }
                        if (slot.back) {
                            slot.back.currentHp = slot.back.maxHp;
                            slot.back.currentMp = slot.back.maxMp;
                        }
                    });
                    log('Party fully restored!');
                }
                break;
            default:
                console.warn('Unknown effect type:', effect.type);
        }
    };

    const handleItemEffect = (itemId, targetId, actor) => {
        const item = itemsDb[itemId];
        if (!item || !item.effects) return;

        // Resolve Target (if single target effect needs it)
        let target = null;
        if (item.targetType === 'ally' || item.targetType === 'deadAlly') {
            target = findPartyMember(targetId);
            if (!target && item.targetType === 'ally') target = actor; // Fallback to self
        } else if (item.targetType === 'enemy') {
            target = enemies.value.find(e => e.id === targetId);
            if (!target) target = enemies.value.find(e => e.hp > 0);
        }

        // Apply all effects
        item.effects.forEach(effect => {
            processEffect(effect, target, actor);
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

            log(`${slot.front.name.zh} switched in!`);
        }
    };

    const nextTurn = () => {
        let nextIndex = activeSlotIndex.value + 1;

        // Loop to find next valid party member
        while (nextIndex < partySlots.value.length) {
            const slot = partySlots.value[nextIndex];
            if (slot && slot.front && slot.front.currentHp > 0) {
                activeSlotIndex.value = nextIndex;

                // New Turn for Character: Reset Defend
                slot.front.isDefending = false;

                return;
            }
            nextIndex++;
        }

        // If no one found in rest of list, Switch to Enemy Turn
        startEnemyPhase();
    };

    const startEnemyPhase = async () => {
        battleState.value = 'enemy_turn';
        log('Enemy Phase Start');

        // Check if battle already over
        if (checkBattleStatus()) return;

        // Simulate enemy thinking delay
        for (const enemy of enemies.value) {
            if (enemy.hp <= 0) continue;

            // Re-check battle status (e.g. if all players died from previous enemy)
            if (checkBattleStatus()) return;

            await new Promise(r => setTimeout(r, 800)); // Delay

            // Enemy Logic: Attack random party member
            const aliveSlots = partySlots.value.filter(s => s.front && s.front.currentHp > 0);
            if (aliveSlots.length > 0) {
                const targetSlot = aliveSlots[Math.floor(Math.random() * aliveSlots.length)];
                const target = targetSlot.front;

                log(`${enemy.name.zh} attacks ${target.name.zh}!`);
                const dmg = calculateDamage(enemy, target);
                applyDamage(target, dmg);
            }
        }

        // Re-check after all attacks
        if (checkBattleStatus()) return;

        // End Enemy Phase
        battleState.value = 'player_turn';
        turnCount.value++;
        log(`Turn ${turnCount.value} Start`);

        // Find first alive player for new turn
        activeSlotIndex.value = -1;
        nextTurn();
    };

    const applyDamage = (target, amount) => {
        target.currentHp = Math.max(0, (target.currentHp || target.hp) - amount);
        if (target.hp !== undefined) target.hp = target.currentHp;

        log(`${target.name.zh} took ${amount} damage!`);
        if (target.isDefending) {
            log('(Defended)');
        }

        // Check if a front-row party member died and needs switching
        if (target.currentHp <= 0) {
            const slotIndex = partySlots.value.findIndex(s => s.front && s.front.id === target.id);
            if (slotIndex !== -1) {
                const slot = partySlots.value[slotIndex];
                if (slot.back && slot.back.currentHp > 0) {
                    log(`${target.name.zh} fell! ${slot.back.name.zh} takes the lead!`);
                    performSwitch(slotIndex);
                }
            }
        }
    };

    const applyHeal = (target, amount) => {
        if (!target) return;
        if (target.currentHp <= 0) {
            log(`${target.name.zh} is incapacitated!`);
            return;
        }

        const oldHp = target.currentHp;
        target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
        const healed = target.currentHp - oldHp;

        log(`${target.name.zh} recovered ${healed} HP`);
    };

    const checkBattleStatus = () => {
        const allEnemiesDead = enemies.value.every(e => e.hp <= 0);
        if (allEnemiesDead) {
            battleState.value = 'victory';
            log('Victory!');
            return true;
        }

        const allPlayersDead = partySlots.value.every(s => !s.front || s.front.currentHp <= 0);
        if (allPlayersDead) {
            battleState.value = 'defeat';
            log('Defeat...');
            return true;
        }
        return false;
    };

    const log = (msg) => {
        battleLog.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
        // Keep log short
        if (battleLog.value.length > 5) battleLog.value.shift();
    };

    return {
        // State
        enemies,
        partySlots,
        activeSlotIndex,
        turnCount,
        battleState,
        battleLog,

        // Getters
        activeCharacter,
        isPlayerTurn,
        battleItems,

        // Actions
        initBattle,
        playerAction,
        nextTurn
    };
});
