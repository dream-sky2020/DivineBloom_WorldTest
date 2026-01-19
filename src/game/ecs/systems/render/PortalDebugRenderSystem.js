import { world } from '@/game/ecs/world'

/**
 * Portal Debug Render System
 * 负责渲染：传送门与其目的地（Entry Point）之间的连接线，并在目的地打叉标记
 * 特别针对“移动位置”类传送门（同地图传送）
 */

// 查询所有带有传送行为和位置的实体
const portals = world.with('actionTeleport', 'position')
// 查询所有目的地实体
const destinations = world.with('destinationId', 'position')

let currentMapData = null

export const PortalDebugRenderSystem = {
    // 渲染层级，放在 Debug 区域
    LAYER: 105,

    /**
     * @param {object} mapData 
     */
    init(mapData) {
        currentMapData = mapData
    },

    /**
     * @param {import('@/game/ecs/GameEngine').Renderer2D} renderer 
     */
    draw(renderer) {
        if (!renderer || !renderer.ctx) return

        const ctx = renderer.ctx
        const camera = renderer.camera || { x: 0, y: 0 }

        // === 第一步：渲染所有目的地实体 ===
        this._drawDestinations(ctx, camera)

        // === 第二步：渲染传送门到目的地的连接 ===
        this._drawPortalConnections(ctx, camera)
    },

    /**
     * 渲染所有目的地实体
     */
    _drawDestinations(ctx, camera) {
        for (const dest of destinations) {
            const { position, visual, destinationId, name } = dest

            // 转换为屏幕坐标
            const x = position.x - camera.x
            const y = position.y - camera.y

            const color = visual?.color || '#8b5cf6'
            const size = visual?.size || 20

            ctx.save()

            // 1. 绘制目的地圆形标记
            ctx.beginPath()
            ctx.arc(x, y, size / 2, 0, Math.PI * 2)
            ctx.fillStyle = color.replace(')', ', 0.3)').replace('rgb', 'rgba')
            ctx.fill()
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.stroke()

            // 2. 绘制中心十字标记
            const crossSize = size / 3
            ctx.beginPath()
            ctx.moveTo(x - crossSize, y)
            ctx.lineTo(x + crossSize, y)
            ctx.moveTo(x, y - crossSize)
            ctx.lineTo(x, y + crossSize)
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.lineCap = 'round'
            ctx.stroke()

            // 3. 绘制文字标识
            ctx.fillStyle = color
            ctx.font = 'bold 12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(name || destinationId, x, y + size / 2 + 15)

            // 4. 查找所有连接到此目的地的传送门，绘制反向连接线
            this._drawIncomingConnections(ctx, camera, dest, color)

            ctx.restore()
        }
    },

    /**
     * 绘制所有连接到指定目的地的传送门（反向连接）
     */
    _drawIncomingConnections(ctx, camera, destination, color) {
        const destId = destination.destinationId
        const destX = destination.position.x - camera.x
        const destY = destination.position.y - camera.y

        // 查找所有指向此目的地的传送门
        for (const portal of portals) {
            const { actionTeleport, position, detectArea } = portal
            const { destinationId } = actionTeleport

            if (destinationId !== destId) continue

            // 计算传送门中心
            let portalX = position.x
            let portalY = position.y
            if (detectArea && detectArea.offset) {
                portalX += detectArea.offset.x
                portalY += detectArea.offset.y
            }

            const pX = portalX - camera.x
            const pY = portalY - camera.y

            // 绘制从目的地到传送门的连接线（较细的虚线）
            ctx.save()
            ctx.beginPath()
            ctx.setLineDash([3, 6])
            ctx.moveTo(destX, destY)
            ctx.lineTo(pX, pY)
            ctx.strokeStyle = color.replace(')', ', 0.4)').replace('rgb', 'rgba')
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.restore()
        }
    },

    /**
     * 渲染传送门到目的地的连接
     */
    _drawPortalConnections(ctx, camera) {
        for (const entity of portals) {
            const { actionTeleport, position, detectArea } = entity
            const { mapId, entryId, destinationId, targetX, targetY } = actionTeleport

            // 判断传送类型（使用 != null 来同时排除 null 和 undefined）
            const isCrossMap = mapId != null && entryId != null
            const isLocalTeleport = destinationId != null || (targetX != null && targetY != null)

            // 仅渲染同地图传送
            if (isCrossMap) continue
            if (!isLocalTeleport) continue

            // 1. 计算起点（传送门中心）
            let startX = position.x
            let startY = position.y
            
            // 如果有检测区域，使用检测区域中心作为连线起点
            if (detectArea && detectArea.offset) {
                startX += detectArea.offset.x
                startY += detectArea.offset.y
            }

            // 2. 确定终点（目的地实体或直接坐标）
            let destX, destY, destEntity

            if (destinationId != null) {
                // 查找目的地实体
                destEntity = [...destinations].find(d => d.destinationId === destinationId)
                if (destEntity) {
                    destX = destEntity.position.x
                    destY = destEntity.position.y
                } else {
                    console.warn(`[PortalDebugRenderSystem] Destination '${destinationId}' not found`)
                    continue
                }
            } else if (targetX != null && targetY != null) {
                // 使用直接坐标
                destX = targetX
                destY = targetY
            } else {
                continue
            }

            // 转换为屏幕坐标
            const sX = startX - camera.x
            const sY = startY - camera.y
            const tX = destX - camera.x
            const tY = destY - camera.y

            ctx.save()

            // 3. 绘制连接线 (紫色虚线)
            ctx.beginPath()
            ctx.setLineDash([5, 5])
            ctx.moveTo(sX, sY)
            ctx.lineTo(tX, tY)
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)' // purple-500
            ctx.lineWidth = 2
            ctx.stroke()

            // 4. 如果是直接坐标模式（旧式），绘制目的地打叉 (X)
            if (!destinationId && targetX != null && targetY != null) {
                const xSize = 12
                ctx.setLineDash([]) // 实线
                ctx.beginPath()
                // 第一画 \
                ctx.moveTo(tX - xSize, tY - xSize)
                ctx.lineTo(tX + xSize, tY + xSize)
                // 第二画 /
                ctx.moveTo(tX + xSize, tY - xSize)
                ctx.lineTo(tX - xSize, tY + xSize)
                
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.9)'
                ctx.lineWidth = 3
                ctx.lineCap = 'round'
                ctx.stroke()

                // 5. 绘制文字标识（显示目标坐标）
                ctx.fillStyle = 'rgba(168, 85, 247, 1)'
                ctx.font = 'bold 12px Arial'
                ctx.textAlign = 'center'
                ctx.fillText(`(${Math.round(destX)}, ${Math.round(destY)})`, tX, tY + xSize + 15)
            }

            ctx.restore()
        }
    }
}
