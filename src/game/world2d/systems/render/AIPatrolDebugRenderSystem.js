import { world } from '@world2d/world'

/**
 * AI Patrol Debug Render System
 * 负责渲染：AI 的游荡范围 (出生点 + 巡逻半径)
 * 层级：调试层 (Layer 12)
 * 
 * Required Components:
 * @property {object} position
 * @property {object} aiConfig
 */

const aiEntities = world.with('aiConfig', 'transform')

export const AIPatrolDebugRenderSystem = {
    // 调试层级，位于视野 (15) 之下，背景 (10) 之上
    LAYER: 12,

    /**
     * @param {import('@world2d/GameEngine').Renderer2D} renderer 
     */
    draw(renderer) {
        if (!renderer || !renderer.ctx || !renderer.camera) return

        const ctx = renderer.ctx
        const camera = renderer.camera
        const viewW = renderer.width || 0
        const viewH = renderer.height || 0
        const cullMargin = 300

        for (const entity of aiEntities) {
            const { aiConfig, transform } = entity
            
            // 如果没有家位置或巡逻半径，不渲染
            if (!aiConfig.homePosition || !aiConfig.patrolRadius) continue

            const homeX = aiConfig.homePosition.x
            const homeY = aiConfig.homePosition.y
            
            // 剔除屏幕外的
            if (homeX < camera.x - cullMargin ||
                homeX > camera.x + viewW + cullMargin ||
                homeY < camera.y - cullMargin ||
                homeY > camera.y + viewH + cullMargin) {
                continue
            }

            const screenHomeX = homeX - camera.x
            const screenHomeY = homeY - camera.y

            ctx.save()
            
            // 1. 绘制巡逻范围虚线圆
            ctx.beginPath()
            ctx.setLineDash([5, 5])
            ctx.arc(screenHomeX, screenHomeY, aiConfig.patrolRadius, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)' // 绿色 (green-500)
            ctx.lineWidth = 1
            ctx.stroke()

            // 2. 绘制家(出生点)标记
            ctx.beginPath()
            ctx.setLineDash([])
            ctx.arc(screenHomeX, screenHomeY, 3, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
            ctx.fill()
            
            // 3. 绘制从 AI 到家的连接线，直观显示距离
            const screenAiX = transform.x - camera.x
            const screenAiY = transform.y - camera.y
            
            ctx.beginPath()
            ctx.moveTo(screenHomeX, screenHomeY)
            ctx.lineTo(screenAiX, screenAiY)
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)'
            ctx.setLineDash([2, 2])
            ctx.stroke()

            // 4. 绘制 AI 的移动意图向量 (moveDir)
            if (entity.aiState && entity.aiState.moveDir) {
                const moveX = entity.aiState.moveDir.x
                const moveY = entity.aiState.moveDir.y
                if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
                    ctx.beginPath()
                    ctx.setLineDash([])
                    ctx.moveTo(screenAiX, screenAiY)
                    ctx.lineTo(screenAiX + moveX * 30, screenAiY + moveY * 30)
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
                    ctx.lineWidth = 2
                    ctx.stroke()
                }
            }

            // 5. 绘制感知到的捷径 (Portal)
            if (entity.aiSensory && entity.aiSensory.bestPortal) {
                const portalPos = entity.aiSensory.bestPortal.pos
                const portalX = portalPos.x - camera.x
                const portalY = portalPos.y - camera.y
                
                ctx.beginPath()
                ctx.moveTo(screenAiX, screenAiY)
                ctx.lineTo(portalX, portalY)
                ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)' // 紫色
                ctx.setLineDash([4, 4])
                ctx.stroke()
            }

            ctx.restore()
        }
    }
}
