import { createLogger } from '@/utils/logger'

const logger = createLogger('ResourcePipeline')

/**
 * 资源加载管线 (Simplified)
 * 仅保留批量加载和进度控制功能，移除复杂的业务逻辑
 */
export class ResourcePipeline {
    constructor(assetManager) {
        this.assetManager = assetManager
    }

    /**
     * 批量加载资源
     * @param {string[]} assetIds 
     * @param {Function} onProgress 
     */
    async loadAssets(assetIds, onProgress = null) {
        const uniqueIds = [...new Set(assetIds)];
        const total = uniqueIds.length;
        let loaded = 0;

        // 过滤掉已经加载好的
        const toLoad = uniqueIds.filter(id => !this.assetManager.textures.has(id));

        if (toLoad.length === 0) {
            if (onProgress) onProgress({ loaded: total, total, progress: 1.0 });
            return;
        }

        logger.info(`Pipeline loading ${toLoad.length} assets...`);

        const promises = toLoad.map(async (id) => {
            try {
                await this.assetManager.loadTexture(id);
            } catch (e) {
                logger.error(`Failed to load ${id}`, e);
            } finally {
                loaded++;
                if (onProgress) {
                    onProgress({
                        loaded,
                        total, // 注意：这里的 total 应该是本次任务的总数，还是包括已加载的？通常是本次任务
                        progress: loaded / toLoad.length
                    });
                }
            }
        });

        await Promise.all(promises);
        logger.info('Pipeline batch finished.');
    }
}
