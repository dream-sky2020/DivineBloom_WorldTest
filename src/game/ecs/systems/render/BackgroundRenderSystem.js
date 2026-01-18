import { world } from '@/game/ecs/world'

/**
 * Background Render System
 * 负责渲染：背景层 (Z-Index < 0)
 * 层级：最底层 (Layer 10)
 * 
 * 目前仅负责地面纯色填充。
 */

const renderEntities = world.with('position', 'visual')

export const BackgroundRenderSystem = {
    LAYER: 10,

    /**
     * @param {import('@/game/ecs/GameEngine').Renderer2D} renderer 
     */
    draw(renderer) {
        const camera = renderer.camera
        if (!camera) return

        // 1. 收集背景实体 (Z < 0)
        const entities = []
        for (const entity of renderEntities) {
            if (entity.zIndex !== undefined && entity.zIndex < 0) {
                entities.push(entity)
            }
        }

        // 2. 排序
        entities.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

        // 3. 绘制
        for (const entity of entities) {
            this.drawVisual(renderer, entity)
        }
    },

    drawVisual(renderer, entity) {
        const { visual, position } = entity
        const camera = renderer.camera

        // 仅处理矩形填充 (地面)
        if (visual.type === 'rect') {
            renderer.ctx.fillStyle = visual.color || '#000'
            // 地面通常是 (0,0) 开始的巨大矩形，需要减去相机偏移
            renderer.ctx.fillRect(
                position.x - camera.x,
                position.y - camera.y,
                visual.width || 2000,
                visual.height || 2000
            )
        }
    }
}
