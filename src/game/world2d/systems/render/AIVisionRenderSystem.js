import { world } from '@world2d/world'
import { drawVision } from '@world2d/ECSCalculateTool/ECSSceneGizmosRendererCalculateTool'

/**
 * AI Vision Render System
 * 负责渲染：AI 的视野范围 (扇形/圆形/混合)
 * 层级：通常位于角色之下 (Layer 15)
 * 
 * Required Components:
 * @property {object} position
 * @property {object} aiConfig
 * @property {object} aiState
 */

// 直接查询 AI 相关的组件，不再依赖 Visual 组件
const visionEntities = world.with('transform', 'aiConfig', 'aiState')

export const AIVisionRenderSystem = {
    // 定义渲染层级 (Z-Index)
    LAYER: 15,

    /**
     * @param {import('@world2d/GameEngine').Renderer2D} renderer 
     */
    draw(renderer) {
        if (!renderer || !renderer.ctx || !renderer.camera) return

        const ctx = renderer.ctx
        const camera = renderer.camera
        const viewW = renderer.width || 0
        const viewH = renderer.height || 0
        const cullMargin = 200 // 视野范围可能较大，剔除边缘放宽

        const isVisible = (pos) => {
            if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
            return !(pos.x < camera.x - cullMargin ||
                pos.x > camera.x + viewW + cullMargin ||
                pos.y < camera.y - cullMargin ||
                pos.y > camera.y + viewH + cullMargin)
        }

        // 批量渲染设置
        // 视野通常是半透明的，我们可以在这里统一设置一些 Context 属性（如果需要优化）
        // 但由于 drawVision 内部使用了 cached canvas 并处理了样式，这里直接循环调用即可

        for (const entity of visionEntities) {
            if (!entity.transform) continue

            // 剔除屏幕外的
            if (!isVisible(entity.transform)) continue

            // 如果处于晕眩状态，通常不绘制视野，或者视野失效
            // 这里由设计决定，暂时保持原逻辑：晕眩时不画视野
            if (entity.aiState.state === 'stunned') continue

            // 转换世界坐标到屏幕坐标 (Screen Space)
            const screenPos = {
                x: entity.transform.x - camera.x,
                y: entity.transform.y - camera.y
            }

            // 直接绘制，不依赖 Gizmos 工具类 (为了调试和确保可见性)
            const { visionRadius, visionType, visionAngle, visionProximity } = entity.aiConfig
            const { facing, colorHex, state } = entity.aiState

            const isAlert = state === 'chase'
            const isFleeing = state === 'flee'
            const baseColor = colorHex || '#eab308'

            ctx.save()
            ctx.translate(screenPos.x, screenPos.y)

            // 计算角度
            const currentAngle = Math.atan2(facing.y, facing.x)
            ctx.rotate(currentAngle)

            // 设置样式
            // 必须显式设置 fillStyle，防止之前的设置残留或未设置
            if (isAlert) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)' // Red (Chase)
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'
            } else if (isFleeing) {
                ctx.fillStyle = 'rgba(25, 25, 112, 0.2)' // Midnight Blue (Flee)
                ctx.strokeStyle = 'rgba(25, 25, 112, 0.6)'
            } else {
                ctx.fillStyle = 'rgba(234, 179, 8, 0.1)' // Yellow (Default)
                ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)'
            }
            ctx.lineWidth = 1

            ctx.beginPath()

            if (visionType === 'circle') {
                ctx.arc(0, 0, visionRadius, 0, Math.PI * 2)
            } else if (visionType === 'cone' || visionType === 'hybrid') {
                const halfAngle = (visionAngle || Math.PI / 2) / 2
                ctx.moveTo(0, 0)
                ctx.arc(0, 0, visionRadius, -halfAngle, halfAngle)
                ctx.lineTo(0, 0)

                if (visionType === 'hybrid') {
                    // Hybrid circle part
                    const prox = visionProximity || 40
                    ctx.moveTo(prox, 0) // move to start of arc to avoid line to center? No, moveTo(prox, 0) is wrong context
                    // Just draw another path for proximity?
                    // Let's keep it simple: just draw the cone for now or simple hybrid
                    ctx.arc(0, 0, prox, 0, Math.PI * 2)
                }
            }

            ctx.fill()
            ctx.stroke()

            ctx.restore()
        }
    }
}
