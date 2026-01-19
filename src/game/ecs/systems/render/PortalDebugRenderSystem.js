import { world } from '@/game/ecs/world'

/**
 * Portal Debug Render System
 * 负责渲染：传送门与其目的地（Entry Point）之间的连接线，并在目的地绘制标记
 * 专注于展现传送的“指向性”
 */

// 查询所有带有传送行为和位置的实体
const portals = world.with('actionTeleport', 'position')
// 查询所有目的地实体
const destinations = world.with('destinationId', 'position')

export const PortalDebugRenderSystem = {
    LAYER: 105,

    init(mapData) {
        // 保留接口
    },

    /**
     * @param {import('@/game/ecs/GameEngine').Renderer2D} renderer 
     */
    draw(renderer) {
        if (!renderer || !renderer.ctx) return

        const ctx = renderer.ctx
        const camera = renderer.camera || { x: 0, y: 0 }

        // 1. 渲染目的地标记 (Circle & Cross)
        this._drawDestinations(ctx, camera)

        // 2. 渲染传送门到目的地的连接线 (Lines)
        this._drawPortalConnections(ctx, camera)
    },

    /**
     * 渲染所有目的地实体标记
     */
    _drawDestinations(ctx, camera) {
        for (const dest of destinations) {
            const { position, visual, destinationId, name } = dest
            const x = position.x - camera.x
            const y = position.y - camera.y

            const color = visual?.color || '#8b5cf6'
            const size = visual?.size || 20

            ctx.save()
            // 绘制目的地标记
            ctx.beginPath()
            ctx.arc(x, y, size / 2, 0, Math.PI * 2)
            ctx.fillStyle = color.replace(')', ', 0.3)').replace('rgb', 'rgba')
            ctx.fill()
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.stroke()

            // 绘制中心十字
            const cs = size / 3
            ctx.beginPath()
            ctx.moveTo(x - cs, y); ctx.lineTo(x + cs, y)
            ctx.moveTo(x, y - cs); ctx.lineTo(x, y + cs)
            ctx.stroke()

            // 绘制文字
            ctx.fillStyle = color
            ctx.font = 'bold 12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(name || destinationId, x, y + size / 2 + 15)
            ctx.restore()
        }
    },

    /**
     * 渲染从传送门到其目的地的连接线
     */
    _drawPortalConnections(ctx, camera) {
        for (const entity of portals) {
            const { actionTeleport, position, detectArea } = entity
            const { mapId, destinationId, targetX, targetY } = actionTeleport

            // 仅渲染同地图传送的连线
            if (mapId != null) continue

            // 1. 确定起点（传送门中心）
            const startX = position.x + (detectArea?.offset?.x || 0)
            const startY = position.y + (detectArea?.offset?.y || 0)

            // 2. 确定终点
            let destX, destY
            if (destinationId != null) {
                const destEntity = [...destinations].find(d => d.destinationId === destinationId)
                if (destEntity) {
                    destX = destEntity.position.x
                    destY = destEntity.position.y
                }
            } else if (targetX != null && targetY != null) {
                destX = targetX
                destY = targetY
            }

            if (destX == null || destY == null) continue

            // 3. 绘制连接线
            const sX = startX - camera.x, sY = startY - camera.y
            const tX = destX - camera.x, tY = destY - camera.y

            ctx.save()
            ctx.beginPath()
            ctx.setLineDash([5, 5])
            ctx.moveTo(sX, sY)
            ctx.lineTo(tX, tY)
            
            // 优先使用实体自带的 debugColor，否则使用默认紫色
            ctx.strokeStyle = detectArea?.debugColor || 'rgba(168, 85, 247, 0.6)'
            ctx.lineWidth = 2
            ctx.stroke()

            // 4. 如果是旧式坐标传送，在终点画个 X
            if (!destinationId) {
                const xs = 10
                ctx.setLineDash([])
                ctx.beginPath()
                ctx.moveTo(tX - xs, tY - xs); ctx.lineTo(tX + xs, tY + xs)
                ctx.moveTo(tX + xs, tY - xs); ctx.lineTo(tX - xs, tY + xs)
                ctx.stroke()
            }
            ctx.restore()
        }
    }
}
