import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MapSaveStateSchema } from '@schema/save';
import { world2d } from '@world2d'; // ✅ 使用统一接口
import { createLogger } from '@/utils/logger';

const logger = createLogger('World2dStore');

export const useWorld2dStore = defineStore('world2d', () => {
    // Current Map State
    const currentMapId = ref('scene_light_green');
    const currentMapState = ref(null); // { playerPos, enemies, isInitialized }

    // Persistent World State: { mapId: { enemies: [], ... } }
    // Note: We only store "enemies" persistently per map. 
    // Player position is only relevant for the *current* map (or last saved spot).
    // When returning to a map, we spawn at an entry point, not where we were last time (usually).
    const worldStates = ref({
        scene_light_green: {
            header: {
                version: '1.1.0',
                config: {
                    id: 'scene_light_green',
                    name: 'Light Green Zone',
                    width: 1200,
                    height: 800,
                    background: { groundColor: '#dcfce7' }, // 浅绿色
                    entryPoints: { default: { x: 1000, y: 1000 } }
                }
            },
            entities: []
        },
        scene_dark_green: {
            header: {
                version: '1.1.0',
                config: {
                    id: 'scene_dark_green',
                    name: 'Dark Green Zone',
                    width: 800,
                    height: 600,
                    background: { groundColor: '#166534' }, // 深绿色
                    entryPoints: { default: { x: 1000, y: 1000 } }
                }
            },
            entities: []
        },
        scene_yellow: {
            header: {
                version: '1.1.0',
                config: {
                    id: 'scene_yellow',
                    name: 'Yellow Zone',
                    width: 2000,
                    height: 2000,
                    background: { groundColor: '#fef9c3' }, // 浅黄色
                    entryPoints: { default: { x: 1000, y: 1000 } }
                }
            },
            entities: []
        }
    });

    const saveState = (sceneInstance) => {
        if (!sceneInstance) return;

        // ✅ 使用统一 API 导出场景
        const bundle = world2d.exportCurrentScene();
        if (!bundle) {
            logger.warn('Failed to export scene');
            return;
        }

        // Update current runtime state
        currentMapState.value = bundle;

        // Persist for this map ID
        if (!worldStates.value[currentMapId.value]) {
            worldStates.value[currentMapId.value] = {};
        }
        worldStates.value[currentMapId.value] = bundle;
    };

    const loadMap = (mapId) => {
        // Switch ID
        currentMapId.value = mapId;

        // Try to load persisted state for this map
        const persisted = worldStates.value[mapId];

        // 🎯 [FIX] 保存完整的 Bundle 数据（包括 header），避免 Ground 实体丢失
        // 即使没有持久化数据，也要清空 currentMapState，防止残留上一张地图的状态
        if (persisted) {
            // 如果是完整的 Bundle 格式（包含 header 和 entities）
            if (persisted.header && persisted.entities) {
                currentMapState.value = persisted;
            }
            // 兼容旧格式：只有 entities 数组
            else if (persisted.entities && Array.isArray(persisted.entities)) {
                currentMapState.value = {
                    isInitialized: true,
                    entities: persisted.entities
                };
            } else {
                currentMapState.value = null;
            }
        } else {
            currentMapState.value = null;
        }

        // Validate loaded state if exists
        if (currentMapState.value && currentMapState.value.entities) {
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
     * 手动初始化当前地图状态
     * @deprecated 已被 saveState 替代，保留用于向后兼容
     */
    const initCurrentState = (entities) => {
        logger.warn('initCurrentState is deprecated, use saveState instead');
        const bundle = {
            header: {
                version: '1.0.0',
                config: { id: currentMapId.value }
            },
            entities: JSON.parse(JSON.stringify(entities))
        };

        currentMapState.value = bundle;
    };

    const reset = () => {
        currentMapId.value = 'scene_light_green';
        currentMapState.value = null;
        // 重置时保留预设场景
        worldStates.value = {
            scene_light_green: {
                header: {
                    version: '1.1.0',
                    config: {
                        id: 'scene_light_green',
                        name: 'Light Green Zone',
                        width: 2000,
                        height: 2000,
                        background: { groundColor: '#dcfce7' },
                        entryPoints: { default: { x: 1000, y: 1000 } }
                    }
                },
                entities: []
            },
            scene_dark_green: {
                header: {
                    version: '1.1.0',
                    config: {
                        id: 'scene_dark_green',
                        name: 'Dark Green Zone',
                        width: 2000,
                        height: 2000,
                        background: { groundColor: '#166534' },
                        entryPoints: { default: { x: 1000, y: 1000 } }
                    }
                },
                entities: []
            },
            scene_yellow: {
                header: {
                    version: '1.1.0',
                    config: {
                        id: 'scene_yellow',
                        name: 'Yellow Zone',
                        width: 2000,
                        height: 2000,
                        background: { groundColor: '#fef9c3' },
                        entryPoints: { default: { x: 1000, y: 1000 } }
                    }
                },
                entities: []
            }
        };
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

    /**
     * [批量更新] 用于项目级导入
     */
    const bulkUpdateStates = (newWorldStates) => {
        worldStates.value = {
            ...worldStates.value,
            ...newWorldStates
        };
        logger.info('Project states updated bulkly');
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
        bulkUpdateStates,
        initCurrentState
    };
});
