// @ts-ignore
import { AssetManifest } from '@schema/assets';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AssetManager')

/**
 * 资源管理器 (Simplified)
 * 职责单一化：只负责根据 ID 加载资源，不关心业务逻辑
 */
export class AssetManager {
    constructor() {
        /** @type {Map<string, HTMLCanvasElement|HTMLImageElement>} */
        this.textures = new Map()

        /** @type {Map<string, Promise>} */
        this.loading = new Map()
    }

    /**
     * 加载单个资源
     * @param {string} assetId 对应 assets.js 中的 key
     */
    loadTexture(assetId) {
        // 1. 缓存命中
        if (this.textures.has(assetId)) {
            return Promise.resolve(this.textures.get(assetId))
        }

        // 2. 请求去重
        if (this.loading.has(assetId)) {
            return this.loading.get(assetId)
        }

        // 3. 查找路径
        const url = AssetManifest[assetId]
        if (!url) {
            logger.warn(`Asset ID not found in manifest: ${assetId}`)
            return Promise.resolve(null)
        }

        // 4. 执行加载
        const p = new Promise((resolve, reject) => {
            const img = new Image()
            
            img.onload = () => {
                // 转换为 Canvas 以优化渲染性能
                const offCanvas = document.createElement('canvas')
                const w = img.width || 32
                const h = img.height || 32
                offCanvas.width = w
                offCanvas.height = h
                
                const ctx = offCanvas.getContext('2d')
                ctx.drawImage(img, 0, 0)

                this.textures.set(assetId, offCanvas)
                this.loading.delete(assetId)
                resolve(offCanvas)
            }

            img.onerror = (e) => {
                logger.error(`Failed to load: ${assetId}`, e)
                // Fallback: 红色方块
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

    getTexture(assetId) {
        return this.textures.get(assetId)
    }

    clear() {
        this.textures.clear()
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
