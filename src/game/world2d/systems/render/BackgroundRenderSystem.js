import { world } from '@world2d/world'

/**
 * Background Render System
 * 负责渲染：背景层 (Z-Index < 0)
 * 层级：最底层 (Layer 10)
 * 
 * 目前仅负责地面纯色填充。
 */

const renderEntities = world.with('transform')

export const BackgroundRenderSystem = {
    LAYER: 10,

    /**
     * @param {import('@world2d/GameEngine').Renderer2D} renderer 
     */
    draw(renderer) {
        const camera = renderer.camera
        if (!camera) return

        // 1. 收集背景实体 (Z < 0 或者 type 为 background_ground)
        const entities = []
        for (const entity of renderEntities) {
            if ((entity.zIndex !== undefined && entity.zIndex < 0) || entity.type === 'background_ground') {
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
        const sprite = entity.sprite || entity.visual
        const rect = entity.rect || (sprite?.type === 'rect' ? sprite : null)
        const { transform } = entity
        const camera = renderer.camera

        if (!transform || !camera) return

        // 仅处理矩形填充 (地面或其他背景块)
        if (rect) {
            // 优先从 sprite.tint 获取颜色，兼容 visual.color
            renderer.ctx.fillStyle = sprite?.tint || entity.visual?.color || '#000'
            renderer.ctx.globalAlpha = sprite?.opacity ?? 1.0

            renderer.ctx.fillRect(
                transform.x - camera.x + (sprite?.offsetX || 0),
                transform.y - camera.y + (sprite?.offsetY || 0),
                rect.width || 2000,
                rect.height || 2000
            )
            renderer.ctx.globalAlpha = 1.0
        }
    }
}
