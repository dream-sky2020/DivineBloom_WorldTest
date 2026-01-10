import { world } from '@/game/ecs/world'

// ECS 查询: 所有带有 detectArea 和 position 的实体
const detectors = world.with('detectArea', 'position')

export const DetectAreaRenderSystem = {
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
        const ctx = renderer.ctx

        for (const entity of detectors) {
            const { detectArea, position } = entity

            // 计算中心点 (加上偏移)
            const centerX = position.x + (detectArea.offset?.x || 0)
            const centerY = position.y + (detectArea.offset?.y || 0)

            // 设置绘制样式
            // 根据是否有检测结果改变颜色 (如果有 detected result 则变红，否则保持默认)
            const isTriggered = detectArea.results && detectArea.results.length > 0

            if (isTriggered) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)' // red-500
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
            } else {
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)' // cyan-400
                ctx.fillStyle = 'rgba(34, 211, 238, 0.1)'
            }

            ctx.lineWidth = 1

            if (detectArea.shape === 'circle') {
                const radius = detectArea.radius || 0

                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
                ctx.fill()
                ctx.stroke()
            }
            else if (detectArea.shape === 'aabb') {
                const w = detectArea.size?.w || 0
                const h = detectArea.size?.h || 0

                // AABB 通常定义为中心点扩展，或者根据 offset 定义
                // 在 DetectAreaSystem 中我们使用了 center +/- half size
                // 这里保持一致
                const x = centerX - w / 2
                const y = centerY - h / 2

                ctx.fillRect(x, y, w, h)
                ctx.strokeRect(x, y, w, h)
            }
        }
    }
}

