import { AssetManifest } from '@/data/assets'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AssetManager')

/**
 * 强大的资源管理器
 * 负责：
 * 1. 加载图片 (Image/Canvas)
 * 2. 解析视觉定义 (Visuals)
 * 3. 缓存管理
 */
export class AssetManager {
    constructor() {
        /** @type {Map<string, HTMLCanvasElement|HTMLImageElement>} 存储加载好的图片对象 */
        this.textures = new Map()

        /** @type {Map<string, Promise>} 正在加载的任务 */
        this.loading = new Map()
    }

    /**
     * 加载单个资源
     * @param {string} assetId 对应 assets.js 中的 key
     * @returns {Promise<HTMLCanvasElement|HTMLImageElement>}
     */
    loadTexture(assetId) {
        // 1. 检查缓存
        if (this.textures.has(assetId)) {
            // 🎯 [DEBUG] 静默返回，避免日志过多
            return Promise.resolve(this.textures.get(assetId))
        }
        if (this.loading.has(assetId)) {
            logger.info(`⏳ Asset already loading, returning existing promise: ${assetId}`)
            return this.loading.get(assetId)
        }

        // 2. 查找路径
        const url = AssetManifest[assetId]
        if (!url) {
            logger.warn(`❌ Asset ID not found in manifest: ${assetId}`)
            return Promise.resolve(null)
        }

        // 🎯 [DEBUG] 开始加载
        logger.info(`📥 Loading asset: ${assetId} from ${url}`)

        // 3. 创建加载任务
        const p = new Promise((resolve, reject) => {
            const img = new Image()
            const startTime = performance.now()

            img.onload = () => {
                // 性能优化：光栅化为 Canvas
                // 这对于游戏循环非常重要，可以避免浏览器在每一帧重新解码图片
                const offCanvas = document.createElement('canvas')
                // 容错处理：有时图片加载了但尺寸为0
                const w = img.width || 32
                const h = img.height || 32
                offCanvas.width = w
                offCanvas.height = h
                const ctx = offCanvas.getContext('2d')
                ctx.drawImage(img, 0, 0)

                const loadTime = (performance.now() - startTime).toFixed(1)
                logger.info(`✅ Loaded: ${assetId} (${w}x${h}, ${loadTime}ms)`)

                this.textures.set(assetId, offCanvas)
                this.loading.delete(assetId)
                resolve(offCanvas)
            }
            img.onerror = (e) => {
                const loadTime = (performance.now() - startTime).toFixed(1)
                logger.error(`❌ Failed to load: ${assetId} from ${url} (${loadTime}ms)`, e)
                // 返回一个红色的占位图，防止游戏崩溃
                const fallback = this._createFallback(32, 32, 'red')
                this.textures.set(assetId, fallback)
                this.loading.delete(assetId)
                resolve(fallback)
            }
            img.src = url
        })

        this.loading.set(assetId, p)
        return p
    }

    /**
     * 预加载一组视觉定义所需的图片
     * @param {string[]} visualIds src/data/visuals.js 中的 keys
     */
    async preloadVisuals(visualIds, visualLib) {
        const promises = []
        const uniqueAssetIds = new Set()

        // 收集所有需要加载的图片 ID
        visualIds.forEach(vid => {
            const def = visualLib[vid]
            if (def && def.assetId) {
                uniqueAssetIds.add(def.assetId)
            }
        })

        // 执行加载
        for (const assetId of uniqueAssetIds) {
            promises.push(this.loadTexture(assetId))
        }

        await Promise.all(promises)
    }

    getTexture(assetId) {
        return this.textures.get(assetId)
    }

    /**
     * 清理资源缓存，释放内存
     * @param {boolean} force 是否强制清理所有资源
     */
    clear(force = false) {
        logger.info(`Clearing assets (force: ${force})`)
        if (force) {
            this.textures.clear()
        } else {
            // 这里可以实现更复杂的 LRU 策略，或者只保留通用资源
            // 目前简单处理为全清，后续可按需优化
            this.textures.clear()
        }
        this.loading.clear()
    }

    _createFallback(w, h, color) {
        const cv = document.createElement('canvas')
        cv.width = w
        cv.height = h
        const ctx = cv.getContext('2d')
        ctx.fillStyle = color
        ctx.fillRect(0, 0, w, h)
        return cv
    }
}
