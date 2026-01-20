import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MapSaveStateSchema } from '@/data/schemas/save';
import { createLogger } from '@/utils/logger';

const logger = createLogger('WorldStore');

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

        // Validate before saving
        try {
            // We construct the state object to match what we expect in the schema
            const stateToValidate = {
                isInitialized: true,
                entities: data.entities
            };
            MapSaveStateSchema.parse(stateToValidate);
        } catch (e) {
            logger.error('Save Validation Failed:', e);
            // We proceed anyway for resilience, but log the error
        }

        // Update current runtime state (used for immediate restoration like battle return)
        currentMapState.value = {
            entities: data.entities,
            isInitialized: true
        };

        // Persist enemy state for this map ID
        // We merge with existing state to preserve other potential map data
        if (!worldStates.value[currentMapId.value]) {
            worldStates.value[currentMapId.value] = {};
        }
        worldStates.value[currentMapId.value].entities = data.entities;
    };

    const loadMap = (mapId) => {
        // Switch ID
        currentMapId.value = mapId;

        // Try to load persisted state for this map
        const persisted = worldStates.value[mapId];

        // 即使没有持久化数据，也要清空 currentMapState，防止残留上一张地图的状态
        // 如果有持久化数据，我们只恢复 enemies，playerPos 为 null 让场景使用出生点
        currentMapState.value = persisted && persisted.entities ? {
            isInitialized: true,
            entities: persisted.entities
        } : null;

        // Validate loaded state if exists
        if (currentMapState.value) {
            try {
                MapSaveStateSchema.parse(currentMapState.value);
            } catch (e) {
                logger.error(`Load Validation Failed for map ${mapId}:`, e);
                // Fallback to fresh state if data is corrupted?
                // currentMapState.value = null; 
            }
        }
    };

    const applyBattleResult = (result, enemyUuid) => {
        // ... (rest of function as is)
        // Simplified for brevity in tool call since we're not changing logic inside here much, 
        // but need to be careful not to overwrite the file with missing code.
        // Wait, I must rewrite the FULL file content or use search_replace.
        // I will use write but need the full content.
        // Let's copy the helper function first.

        // Helper to remove enemy from entity list
        const handleEntities = (entities) => {
            if (!entities) return [];
            return entities.filter(e => {
                // Check if it's an enemy and matches UUID
                // Supports new Unified Schema: { type: 'enemy', data: { options: { uuid } } }
                if (e.type === 'enemy' && e.data && e.data.options && e.data.options.uuid === enemyUuid) {
                    if (result === 'victory') {
                        // Remove permanently
                        return false;
                    }
                    // TODO: Handle 'flee' (maybe add temporary immunity or no-op)
                }
                return true;
            });
        };

        // 1. Update Current
        if (currentMapState.value && currentMapState.value.entities) {
            currentMapState.value.entities = handleEntities(currentMapState.value.entities);
        }

        // 2. Update Persisted
        if (worldStates.value[currentMapId.value]) {
            worldStates.value[currentMapId.value].entities = handleEntities(worldStates.value[currentMapId.value].entities);
        }
    };

    /**
     * 手动初始化当前地图状态（用于首次加载默认地图后）
     */
    const initCurrentState = (entities) => {
        const newState = {
            isInitialized: true,
            entities: JSON.parse(JSON.stringify(entities)) // Clone to be safe
        };

        try {
            MapSaveStateSchema.parse(newState);
        } catch (e) {
            logger.error('Init State Validation Failed:', e);
        }

        currentMapState.value = newState;
    };

    const reset = () => {
        currentMapId.value = 'demo_plains';
        currentMapState.value = null;
        worldStates.value = {};
    };

    const serialize = () => {
        return {
            currentMapId: currentMapId.value,
            worldStates: worldStates.value
        };
    };

    const loadState = (data) => {
        if (data.currentMapId) currentMapId.value = data.currentMapId;
        if (data.worldStates) worldStates.value = data.worldStates;
        // 注意：这里没有恢复 currentMapState，因为它通常会在进入场景时根据 worldStates 重新计算
        // 或者我们可以选择加载：
        // loadMap(currentMapId.value);
    };

    const clearState = () => {
        reset();
    };

    return {
        currentMapId,
        currentMapState,
        worldStates,
        saveState,
        loadMap,
        applyBattleResult,
        clearState,
        reset,
        serialize,
        loadState,
        initCurrentState
    };
});
