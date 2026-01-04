import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWorldStore = defineStore('world', () => {
    // Current Map State
    const currentMapId = ref('demo_plains');
    const currentMapState = ref(null); // { playerPos, enemies, isInitialized }
    
    // Persistent World State: { mapId: { enemies: [], ... } }
    // Note: We only store "enemies" persistently per map. 
    // Player position is only relevant for the *current* map (or last saved spot).
    // When returning to a map, we spawn at an entry point, not where we were last time (usually).
    const worldStates = ref({}); 

    const saveState = (sceneInstance) => {
        if (!sceneInstance) return;
        
        // Serialize current scene
        const data = sceneInstance.serialize();
        
        // Update current runtime state (used for immediate restoration like battle return)
        currentMapState.value = {
            playerPos: data.playerPos,
            enemies: data.enemies,
            isInitialized: true
        };

        // Persist enemy state for this map ID
        // We merge with existing state to preserve other potential map data
        if (!worldStates.value[currentMapId.value]) {
            worldStates.value[currentMapId.value] = {};
        }
        worldStates.value[currentMapId.value].enemies = data.enemies;
    };

    const loadMap = (mapId) => {
        // Switch ID
        currentMapId.value = mapId;
        
        // Try to load persisted state for this map
        const persisted = worldStates.value[mapId];
        
        if (persisted && persisted.enemies) {
            // We have visited this map before.
            // We construct a partial state. 
            // Note: Player position comes from Entry Point (handled by Scene), 
            // not from persistence (unless we saved specifically for that).
            currentMapState.value = {
                isInitialized: true,
                enemies: persisted.enemies,
                playerPos: null // Scene will handle spawning at entry point
            };
        } else {
            // New map visit
            currentMapState.value = null;
        }
    };

    const applyBattleResult = (result, enemyUuid) => {
        // Update both currentMapState and worldStates for consistency
        if (!currentMapState.value || !currentMapState.value.enemies) return;

        const handleList = (list) => {
            if (result === 'victory') {
                return list.filter(e => e.options.uuid !== enemyUuid);
            } else if (result === 'flee') {
                const enemy = list.find(e => e.options.uuid === enemyUuid);
                if (enemy) {
                    if (!enemy.options) enemy.options = {};
                    enemy.options.isStunned = true;
                    enemy.options.stunnedTimer = 3.0;
                }
                return list;
            }
            return list;
        };

        // 1. Update Current
        currentMapState.value.enemies = handleList(currentMapState.value.enemies);

        // 2. Update Persisted
        if (worldStates.value[currentMapId.value]) {
            worldStates.value[currentMapId.value].enemies = handleList(worldStates.value[currentMapId.value].enemies);
        }
    };

    const clearState = () => {
        currentMapId.value = 'demo_plains';
        currentMapState.value = null;
        worldStates.value = {};
    };

    return {
        currentMapId,
        currentMapState,
        worldStates,
        saveState,
        loadMap,
        applyBattleResult,
        clearState
    };
});

