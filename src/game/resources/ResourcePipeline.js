/**
 * 资源加载管线
 * 负责批量加载、缓存管理、进度跟踪
 */
export class ResourcePipeline {
    /**
     * @param {import('@/game/resources/AssetManager').AssetManager} assetManager
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
        // 过滤掉已加载的资源
        const toLoad = assetIds.filter(id => !this.isAssetLoaded(id) && !this.assetManager.textures.has(id))

        if (toLoad.length === 0) {
            console.log('[ResourcePipeline] All assets already loaded')
            return
        }

        console.log('[ResourcePipeline] Loading assets:', toLoad)

        this.isLoading = true
        const total = toLoad.length
        let loaded = 0

        try {
            const promises = toLoad.map(async (id) => {
                try {
                    await this.assetManager.loadTexture(id)
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
                    console.error(`[ResourcePipeline] Failed to load asset: ${id}`, error)
                    // 继续加载其他资源，不中断流程
                }
            })

            await Promise.all(promises)
            console.log('[ResourcePipeline] Load complete:', loaded, '/', total)
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
        console.log('[ResourcePipeline] Cache cleared')
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
