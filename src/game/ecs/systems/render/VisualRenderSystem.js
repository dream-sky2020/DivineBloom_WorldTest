import { world } from '@/game/ecs/world'
import { Visuals } from '@/data/visuals'

/**
 * Sprite Render System
 * 负责渲染：实体 Sprite (角色, 道具等)
 * 层级：中间层 (Layer 2)，需要 Y 轴排序
 * 
 * Required Components:
 * @property {object} position
 * @property {object} visual
 */

const renderEntities = world.with('position', 'visual')

export const VisualRenderSystem = {
  /**
   * @param {import('@/game/GameEngine').Renderer2D} renderer 
   */
  draw(renderer) {
    // 1. 收集实体
    const entities = []
    for (const entity of renderEntities) {
      entities.push(entity)
    }

    // 2. Y轴排序
    entities.sort((a, b) => a.position.y - b.position.y)

    // 3. 剔除与绘制
    const viewW = renderer.width || 9999
    const viewH = renderer.height || 9999
    const camera = renderer.camera
    const cullMargin = 100

    const isVisible = (pos) => {
      return !(pos.x < camera.x - cullMargin ||
        pos.x > camera.x + viewW + cullMargin ||
        pos.y < camera.y - cullMargin ||
        pos.y > camera.y + viewH + cullMargin)
    }

    for (const entity of entities) {
      if (!isVisible(entity.position)) continue
      this.drawVisual(renderer, entity)
    }
  },

  drawVisual(renderer, entity) {
    const { visual, position } = entity
    const def = Visuals[visual.id]

    if (!def) {
      // Fallback placeholder
      renderer.drawCircle(position.x, position.y, 10, 'red')
      return
    }

    const texture = renderer.assetManager.getTexture(def.assetId)
    if (!texture) return

    const animName = visual.state || 'default'
    const anim = def.animations[animName] || def.animations['default'] || def.animations['idle']

    let frameId = 0
    if (anim && anim.frames.length > 0) {
      if (visual.frameIndex >= anim.frames.length) visual.frameIndex = 0
      frameId = anim.frames[visual.frameIndex]
    }

    let sx = 0, sy = 0, sw = 0, sh = 0

    if (def.layout.type === 'grid') {
      const cols = def.layout.cols || 1
      const rows = def.layout.rows || 1
      const tileW = def.layout.width || (texture.width ? texture.width / cols : 32)
      const tileH = def.layout.height || (texture.height ? texture.height / rows : 32)

      const col = frameId % cols
      const row = Math.floor(frameId / cols)

      sx = col * tileW
      sy = row * tileH
      sw = tileW
      sh = tileH
    } else {
      sx = 0; sy = 0; sw = texture.width; sh = texture.height
    }

    const spriteDef = {
      sx, sy, sw, sh,
      ax: def.anchor?.x ?? 0.5,
      ay: def.anchor?.y ?? 1.0
    }

    const scale = visual.scale !== undefined ? visual.scale : 1.0
    renderer.drawSprite(texture, spriteDef, position, scale)
  }
}
