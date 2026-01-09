import { world } from '@/game/ecs/world'

// 缓存状态
let currentMap = null

// ECS 查询: 所有带有 trigger 和 actionTeleport 的实体 (即 PortalEntity)
const portalEntities = world.with('trigger', 'actionTeleport', 'position')

export const DetectionAreaRenderSystem = {
    /**
     * 初始化检测区域渲染系统
     * @param {object} mapData 地图数据
     */
    init(mapData) {
        currentMap = mapData
    },

    /**
     * 更新地图数据 (当切换地图时)
     * @param {object} mapData 
     */
    setMap(mapData) {
        currentMap = mapData
    },

    /**
     * 绘制检测区域 (Debug / Editor Mode)
     * @param {object} renderer Renderer2D
     */
    draw(renderer) {
        if (!currentMap) return

        // 1. 绘制 MapData 中的静态 Portals (legacy / editor 预览)
        // 这些通常是在地图加载时就已经存在的，直接从 mapData 读取
        if (currentMap.portals) {
            currentMap.portals.forEach(p => {
                // 使用半透明青色表示传送区域
                renderer.drawRect(p.x, p.y, p.w, p.h, 'rgba(34, 211, 238, 0.3)')
                
                // 可选：绘制边框使其更清晰
                const ctx = renderer.ctx
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)'
                ctx.lineWidth = 1
                ctx.strokeRect(p.x, p.y, p.w, p.h)
            })
        }

        // 2. 绘制 ECS 中的动态 Portal Entities (运行时)
        // 实际上，mapData.portals 通常会转化为 ECS 实体。
        // 为了避免重复绘制，如果已经转化为实体，我们应该只绘制实体。
        // 但目前的架构中，EnvironmentRenderSystem 之前是直接绘制 mapData.portals。
        // 为了保持一致并支持动态生成的传送门，我们也遍历 ECS 实体。
        
        for (const entity of portalEntities) {
            const { trigger, position } = entity
            if (trigger.type === 'ZONE' && trigger.bounds) {
                const { x, y, w, h } = trigger.bounds
                const absX = position.x + x
                const absY = position.y + y
                
                // 稍微使用不同的颜色来区分 ECS 实体 (调试用)
                // 实际生产中可能需要去重逻辑
                // renderer.drawRect(absX, absY, w, h, 'rgba(34, 211, 238, 0.3)')
            }
        }
    }
}

