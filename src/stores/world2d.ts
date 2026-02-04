import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MapSaveStateSchema } from '@schema/save';
import { world2d } from '@world2d'; 
import { createLogger } from '@/utils/logger';
import { InitialWorldState } from '@/data/initialWorldState';

const logger = createLogger('World2dStore');

interface SceneBundleHeader {
    version: string;
    config: { id: string };
}

interface SceneBundle {
    header: SceneBundleHeader;
    entities: any[];
}

interface WorldStates {
    [mapId: string]: SceneBundle;
}

export const useWorld2dStore = defineStore('world2d', () => {
    // Current Map State
    const currentMapId = ref<string>('scene_light_green');
    const currentMapState = ref<SceneBundle | null>(null);

    // Persistent World State
    // 初始化时直接加载静态配置，后续的修改都会保存在这里
    const worldStates = ref<WorldStates>(JSON.parse(JSON.stringify(InitialWorldState)));

    /**
     * 保存当前场景状态到内存 (Persistence)
     */
    const saveState = () => {
        // 使用 ScenarioLoader.exportScene 导出的标准 Bundle
        const bundle = world2d.exportCurrentScene();
        
        if (!bundle) {
            logger.warn('Failed to export scene');
            return;
        }

        // 1. 更新当前运行时状态
        currentMapState.value = bundle as SceneBundle;

        // 2. 持久化到 Store
        if (currentMapId.value) {
            worldStates.value[currentMapId.value] = bundle as SceneBundle;
        }
    };

    /**
     * 切换/加载地图
     */
    const loadMap = (mapId: string) => {
        currentMapId.value = mapId;

        // 直接从持久化状态中获取 (因为初始化时已经包含了初始数据)
        const targetState = worldStates.value[mapId];

        if (targetState && targetState.header && targetState.entities) {
            currentMapState.value = targetState;
        } else {
            logger.error(`Map data not found for [${mapId}]`);
            currentMapState.value = null;
        }
    };

    /**
     * 应用战斗结果 (示例逻辑)
     */
    const applyBattleResult = (result: 'victory' | 'defeat' | 'flee', enemyUuid: string) => {
        const removeEnemy = (entities: any[]) => {
            if (!entities) return [];
            return entities.filter(e => {
                // 假设 Enemy 组件数据结构: { type: 'enemy', options: { uuid: ... } }
                if (e.type === 'enemy' && e.options && e.options.uuid === enemyUuid) {
                     if (result === 'victory') return false; 
                }
                return true;
            });
        };

        // Update Current
        if (currentMapState.value?.entities) {
            currentMapState.value.entities = removeEnemy(currentMapState.value.entities);
        }

        // Update Persisted
        if (worldStates.value[currentMapId.value]?.entities) {
            worldStates.value[currentMapId.value].entities = removeEnemy(worldStates.value[currentMapId.value].entities);
        }
    };

    const reset = () => {
        currentMapId.value = 'scene_light_green';
        currentMapState.value = null;
        // 重置回初始状态
        worldStates.value = JSON.parse(JSON.stringify(InitialWorldState));
    };

    return {
        currentMapId,
        currentMapState,
        worldStates,
        saveState,
        loadMap,
        applyBattleResult,
        reset
    };
});
