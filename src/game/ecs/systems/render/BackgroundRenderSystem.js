import { world } from '@/game/ecs/world'
import { Visuals } from '@/data/visuals'

/**
 * Background Render System
 * 负责渲染：背景层 (Z-Index < 0)
 * 层级：最底层 (Layer 10)
 * 
 * Required Components:
 * @property {object} position
 * @property {object} visual
 */

const renderEntities = world.with('position', 'visual')

export const BackgroundRenderSystem = {
    // 定义渲染层级 (Z-Index)
    LAYER: 10,

    /**
     * @param {import('@/game/GameEngine').Renderer2D} renderer 
     */
    draw(renderer) {
        // 1. 收集实体 (仅 Z < 0)
        const entities = []
        for (const entity of renderEntities) {
            if (!entity.position || !entity.visual) continue;

            const z = entity.zIndex || 0
            if (z < 0) {
                entities.push(entity)
            }
        }

        // 2. 排序
        entities.sort((a, b) => {
            const zA = a.zIndex || 0
            const zB = b.zIndex || 0
            return zA - zB
        })

        // 3. 剔除与绘制
        const viewW = renderer.width || 9999
        const viewH = renderer.height || 9999
        const camera = renderer.camera

        if (!camera) return

        // 背景剔除通常可以放宽，或者如果是大背景，需要特殊处理
        // 这里沿用简单的 cull margin
        const cullMargin = 200

        const isVisible = (pos, visual) => {
            // 如果是 Rect，考虑宽高
            let w = 100, h = 100
            if (visual.type === 'rect') {
                w = visual.width || 100
                h = visual.height || 100
            }

            // 简单点剔除 (对于大背景，pos 是左上角)
            return !(pos.x > camera.x + viewW + cullMargin ||
                pos.x + w < camera.x - cullMargin ||
                pos.y > camera.y + viewH + cullMargin ||
                pos.y + h < camera.y - cullMargin)
        }

        for (const entity of entities) {
            if (!isVisible(entity.position, entity.visual)) continue
            this.drawVisual(renderer, entity)
        }
    },

    drawVisual(renderer, entity) {
        const { visual, position } = entity

        // --- Rect Support (Backgrounds usually use this) ---
        if (visual.type === 'rect') {
            renderer.ctx.fillStyle = visual.color || 'magenta'
            renderer.ctx.fillRect(position.x, position.y, visual.width || 10, visual.height || 10)
            return
        }

        // --- Sprite Support (For decorated tiles) ---
        if (!visual.id) return

        const def = Visuals[visual.id]
        if (!def) return

        const texture = renderer.assetManager.getTexture(def.assetId)
        if (!texture) return

        // ... (Simplified sprite drawing for background if needed) ...
        // Assuming background doesn't animate for now to save perf, or reuse VisualRenderSystem logic if complex.
        // copying standard logic:

        let sx = 0, sy = 0, sw = texture.width, sh = texture.height
        // Simple draw
        const spriteDef = {
            sx, sy, sw, sh,
            ax: def.anchor?.x ?? 0, // Backgrounds usually top-left anchor?
            ay: def.anchor?.y ?? 0
        }

        // Background decorations created by BackgroundEntity use Rect, but if they used Sprites:
        // They likely want standard anchor. Let's stick to default.
        // However, createDecoration doesn't specify anchor.

        renderer.drawSprite(texture, spriteDef, position, visual.scale || 1.0)
    }
}
