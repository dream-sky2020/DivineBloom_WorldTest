import { createLogger } from '@/utils/logger'

const logger = createLogger('ResourcePipeline')

/**
 * 资源加载管线
 * 负责批量加载、缓存管理、进度跟踪
 */
export class ResourcePipeline {
    /**
     * @param {import('@/game/ecs/resources/AssetManager').AssetManager} assetManager
     */
    constructor(assetManager) {
        this.assetManager = assetManager
        this.loadQueue = []
        this.isLoading = false
        this.loadedCache = new Set()
    }

    /**
     * 批量加载资源（带进度回调）
     * @param {string[]} assetIds 资源文件 ID 数组
     * @param {Function} [onProgress] 进度回调 ({ loaded, total, progress })
     * @returns {Promise<void>}
     */
    async loadAssets(assetIds, onProgress = null) {
        // 🎯 [FIX] 过滤掉已加载的资源，同时检查正在加载中的资源
        const toLoad = assetIds.filter(id => {
            // 已完全加载
            if (this.isAssetLoaded(id) || this.assetManager.textures.has(id)) {
                return false
            }
            // 🎯 正在加载中的资源也不需要再次加载（避免重复请求）
            if (this.assetManager.loading.has(id)) {
                return false
            }
            return true
        })

        if (toLoad.length === 0) {
            // 🎯 [FIX] 即使没有新资源需要加载，也要等待正在加载的资源完成
            const pending = assetIds.filter(id => this.assetManager.loading.has(id))
            if (pending.length > 0) {
                logger.info('Waiting for assets in progress:', pending)
                const waitPromises = pending.map(id => this.assetManager.loading.get(id))
                await Promise.all(waitPromises)
            } else {
                logger.info('All assets already loaded')
            }
            return
        }

        logger.info('Loading assets:', toLoad)

        this.isLoading = true
        const total = toLoad.length
        let loaded = 0

        try {
            const promises = toLoad.map(async (id) => {
                try {
                    const texture = await this.assetManager.loadTexture(id)
                    // 🎯 [FIX] 验证加载结果，确保不是空或 fallback
                    if (!texture) {
                        logger.warn(`Asset loaded but texture is null: ${id}`)
                    }
                    this.loadedCache.add(id)
                    loaded++

                    if (onProgress) {
                        onProgress({
                            loaded,
                            total,
                            progress: loaded / total,
                            currentAsset: id
                        })
                    }
                } catch (error) {
                    logger.error(`Failed to load asset: ${id}`, error)
                    // 继续加载其他资源，不中断流程
                }
            })

            await Promise.all(promises)
            logger.info(`✅ Load complete: ${loaded} / ${total}`)
        } finally {
            this.isLoading = false
        }
    }

    /**
     * 从地图配置预加载资源
     * @param {object} mapData 地图配置
     * @param {Function} [onProgress] 进度回调
     */
    async preloadMap(mapData, onProgress = null) {
        const { ResourceDeclaration } = await import('./ResourceDeclaration')
        const assetIds = ResourceDeclaration.getMapAssetIds(mapData)
        await this.loadAssets(Array.from(assetIds), onProgress)
    }

    /**
     * 从 World 预加载资源
     * @param {World} world ECS World 实例
     * @param {Function} [onProgress] 进度回调
     */
    async preloadWorld(world, onProgress = null) {
        const { ResourceDeclaration } = await import('./ResourceDeclaration')
        const assetIds = ResourceDeclaration.getWorldAssetIds(world)
        await this.loadAssets(Array.from(assetIds), onProgress)
    }

    /**
     * 检查资源是否已加载
     * @param {string} assetId 资源文件 ID
     * @returns {boolean}
     */
    isAssetLoaded(assetId) {
        return this.loadedCache.has(assetId) || this.assetManager.textures.has(assetId)
    }

    /**
     * 获取加载进度信息
     * @returns {{ isLoading: boolean, loadedCount: number }}
     */
    getLoadingStatus() {
        return {
            isLoading: this.isLoading,
            loadedCount: this.loadedCache.size
        }
    }

    /**
     * 清理缓存（可选，用于内存管理）
     */
    clearCache() {
        this.loadedCache.clear()
        logger.info('Cache cleared')
    }

    /**
     * 验证资源完整性
     * @param {string[]} assetIds 需要验证的资源 ID
     * @returns {string[]} 缺失的资源 ID
     */
    validateAssets(assetIds) {
        const missing = []

        for (const id of assetIds) {
            if (!this.isAssetLoaded(id)) {
                missing.push(id)
            }
        }

        return missing
    }
}
