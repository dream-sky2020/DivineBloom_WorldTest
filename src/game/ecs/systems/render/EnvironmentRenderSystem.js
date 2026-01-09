import { world } from '@/game/ecs/world'

/**
 * Environment System Components Schema
 * 
 * 1. Global Map Data (Init Parameter)
 * @param {object} mapData
 * @param {object} mapData.background - { groundColor: string, decorations: [] }
 * @param {object} [mapData.constraints] - { minYRatio: number }
 * @param {Array} [mapData.portals] - 传送门调试数据 (实际逻辑在 PortalEntity)
 * 
 * 2. Bounded Entity Components (Resize Logic)
 * Required Components:
 * @property {object} bounds - 边界限制组件
 * @property {number} bounds.minX
 * @property {number} bounds.maxX
 * @property {number} bounds.minY
 * @property {number} bounds.maxY
 * 
 * Optional:
 * @property {object} [aiConfig]
 * @property {number} [aiConfig.minYRatio] - 覆盖地图默认的 Y 轴约束比例
 */

// 缓存状态
let currentMap = null
let staticLayer = null
let lastCacheWidth = 0
let lastCacheHeight = 0

// ECS 查询
const boundedEntities = world.with('bounds')

export const EnvironmentRenderSystem = {
    /**
     * 初始化环境系统
     * @param {object} mapData 地图数据
     */
    init(mapData) {
        currentMap = mapData
        staticLayer = null
        lastCacheWidth = 0
        lastCacheHeight = 0
    },

    /**
     * 更新逻辑 (主要是处理 Resize)
     * @param {number} dt 
     * @param {object} engine GameEngine 实例，用于获取宽高
     */
    update(dt, engine) {
        if (!currentMap) return

        const { width, height } = engine
        if (width === 0 || height === 0) return

        // 如果尺寸变化，触发 Resize 逻辑
        if (lastCacheWidth !== width || lastCacheHeight !== height) {
            this._handleResize(width, height)
        }
    },

    /**
     * 绘制环境背景
     * @param {object} renderer Renderer2D
     * @param {object} engine GameEngine
     */
    draw(renderer, engine) {
        if (!currentMap) return
        const { width, height } = engine

        // 检查缓存层是否有效，无效则刷新
        if (!staticLayer || lastCacheWidth !== width || lastCacheHeight !== height) {
            this._refreshStaticLayer(width, height)
        }

        // 绘制静态层
        if (staticLayer) {
            renderer.ctx.drawImage(staticLayer, 0, 0)
        }
    },

    _handleResize(width, height) {
        const minYRatio = currentMap.constraints?.minYRatio ?? 0.35

        // 更新所有受约束实体的边界
        for (const ent of boundedEntities) {
            ent.bounds.minX = 0
            ent.bounds.maxX = width
            ent.bounds.maxY = height
            const ratio = ent.aiConfig?.minYRatio ?? minYRatio
            ent.bounds.minY = height * ratio
        }

        this._refreshStaticLayer(width, height)
    },

    _refreshStaticLayer(width, height) {
        if (!staticLayer) {
            staticLayer = document.createElement('canvas')
        }
        staticLayer.width = width
        staticLayer.height = height

        const ctx = staticLayer.getContext('2d')
        const bg = currentMap.background
        const minYRatio = currentMap.constraints?.minYRatio ?? 0.35

        ctx.clearRect(0, 0, width, height)

        // 1. 绘制地面
        ctx.fillStyle = bg.groundColor || '#bbf7d0'
        const groundY = height * minYRatio
        ctx.fillRect(0, groundY, width, height - groundY)

        // 2. 绘制装饰物
        if (bg.decorations) {
            bg.decorations.forEach(dec => {
                if (dec.type === 'rect') {
                    const y = dec.yRatio ? height * dec.yRatio : dec.y
                    ctx.fillStyle = dec.color
                    ctx.fillRect(dec.x, y, dec.width, dec.height)
                }
            })
        }

        lastCacheWidth = width
        lastCacheHeight = height
    },

    // 清理资源
    destroy() {
        staticLayer = null
        currentMap = null
    }
}

