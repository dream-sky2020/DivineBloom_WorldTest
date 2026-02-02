import { world } from '@world2d/world'
import { ShapeType } from '@world2d/definitions/enums/Shape'

// ECS 查询: 所有带有 detectArea 和 position 的实体
const detectors = world.with('detectArea', 'position')

export const DetectAreaRenderSystem = {
    // 定义渲染层级 (Z-Index) - Debug 层通常最高
    LAYER: 100,

    /**
     * 初始化检测区域渲染系统
     * @param {object} mapData 地图数据
     */
    init(mapData) {
        // 保留接口一致性，但不再依赖 mapData 绘制
    },

    /**
     * 绘制检测区域 (Debug / Editor Mode)
     * @param {object} renderer Renderer2D
     */
    draw(renderer) {
        // Defensive check
        if (!renderer || !renderer.ctx) return;

        const ctx = renderer.ctx
        const camera = renderer.camera || { x: 0, y: 0 }

        for (const entity of detectors) {
            // Defensive Check
            if (!entity.detectArea || !entity.position) continue;

            const { detectArea, position } = entity

            // 计算中心点 (加上偏移) - 并转换为屏幕坐标
            // [UPDATED] 适配新的扁平化结构: offsetX, offsetY
            const centerX = (position.x + (detectArea.offsetX || 0)) - camera.x
            const centerY = (position.y + (detectArea.offsetY || 0)) - camera.y

            // 设置绘制样式
            // 根据是否有检测结果改变颜色 (如果有 detected result 则变红，否则保持默认)
            // Defensive check for results array
            const isTriggered = detectArea.results && Array.isArray(detectArea.results) && detectArea.results.length > 0

            if (isTriggered) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)' // red-500
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
            } else if (detectArea.debugColor) {
                // 优先使用组件定义的调试颜色
                ctx.strokeStyle = detectArea.debugColor
                // 自动处理填充色透明度
                ctx.fillStyle = detectArea.debugColor.replace(/[\d.]+\)$/g, '0.1)')
            } else {
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)' // cyan-400
                ctx.fillStyle = 'rgba(34, 211, 238, 0.1)'
            }

            ctx.lineWidth = 1

            // [UPDATED] 适配新的 type 枚举
            if (detectArea.type === ShapeType.CIRCLE) {
                const radius = detectArea.radius || 0

                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
                ctx.fill()
                ctx.stroke()
            }
            else if (detectArea.type === ShapeType.AABB || detectArea.type === ShapeType.OBB) {
                // [UPDATED] 适配新的 width/height
                const w = detectArea.width || 0
                const h = detectArea.height || 0
                const rotation = detectArea.rotation || 0

                // AABB/OBB 绘制
                ctx.save()
                ctx.translate(centerX, centerY)
                if (rotation) ctx.rotate(rotation)
                
                // 绘制矩形 (中心对齐)
                ctx.fillRect(-w/2, -h/2, w, h)
                ctx.strokeRect(-w/2, -h/2, w, h)
                
                ctx.restore()
            }
        }
    }
}
