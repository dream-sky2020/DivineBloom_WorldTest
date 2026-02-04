import { ScenarioLoader } from '@world2d/ScenarioLoader'
import { ResourceDeclaration } from './ResourceDeclaration'
import { world } from '@world2d/world'
import { createLogger } from '@/utils/logger'

const logger = createLogger('SceneLifecycle')

/**
 * 场景生命周期管理 (Simplified)
 * 流程: Preload Assets -> Create Entities -> Ready
 */
export class SceneLifecycle {
    /**
     * 准备场景
     * @param {object} mapData SceneBundle 数据
     * @param {object} engine 
     * @param {string} entryId 
     */
    static async prepareScene(mapData, engine, entryId = 'default', savedState = null, onProgress = null) {
        logger.info(`Starting scene preparation for [${mapData?.header?.config?.id || 'unknown'}]`)

        // 1. 决定使用的数据源 (存档优先于默认配置)
        const sourceData = savedState || mapData;

        // 2. 资源预加载 (Preload)
        // 使用新的通用扫描器提取资源
        const assetIds = ResourceDeclaration.getMapAssetIds(sourceData);
        logger.info(`Required assets found: ${assetIds.size}`);

        if (engine.resources && engine.resources.pipeline) {
            await engine.resources.pipeline.loadAssets(Array.from(assetIds), onProgress);
        } else {
            // Fallback 直接使用 AssetManager
            const promises = Array.from(assetIds).map(id => engine.assets.loadTexture(id));
            await Promise.all(promises);
        }

        // 3. 实体创建 (Creation)
        logger.info('Creating entities...');
        // 如果是 savedState，它本身就是 Bundle；如果是 mapData，它也是 Bundle
        // 我们的 ScenarioLoader 现在只接受 Bundle，完美匹配
        const result = ScenarioLoader.load(engine, sourceData, entryId);

        logger.info(`Scene ready. Entities: ${result.entities.length}`);
        return result.entities;
    }

    static destroyScene(scene, engine) {
        if (scene && scene.destroy) scene.destroy();
        // 可以在这里做一些资源卸载策略，但通常建议由 AssetManager 统一管理
    }
}
