import { world } from '@/game/ecs/world'
import { Visuals } from '@/data/visuals'
import { drawVision } from '@/game/utils/renderUtils'

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
   * 更新动画帧 (原 AnimationSystem 的职责)
   * @param {number} dt 
   */
  update(dt) {
    for (const entity of renderEntities) {
      this.updateAnimation(entity, dt)
    }
  },

  updateAnimation(entity, dt) {
    const { visual } = entity
    const def = Visuals[visual.id]
    if (!def) return

    const animName = visual.state || 'default'
    const anim = def.animations[animName] || def.animations['default'] || def.animations['idle']
    if (!anim) return

    if (anim.frames.length <= 1) {
      visual.frameIndex = 0
      return
    }

    visual.timer += dt * (visual.speedMultiplier || 1)

    // 如果是 loop=false 且播放完了，保持最后一帧
    const frameDuration = 1 / (anim.speed || 10)
    if (visual.timer >= frameDuration) {
      visual.timer -= frameDuration
      visual.frameIndex++

      if (visual.frameIndex >= anim.frames.length) {
        if (anim.loop !== false) { // 默认 loop true
          visual.frameIndex = 0
        } else {
          visual.frameIndex = anim.frames.length - 1
        }
      }
    }
  },

  /**
   * @param {import('@/game/GameEngine').Renderer2D} renderer 
   */
  draw(renderer) {
    // 1. 收集实体
    const entities = []
    for (const entity of renderEntities) {
      entities.push(entity)
    }

    // 2. 排序 (Z-Index First, then Y-Sort for entities)
    entities.sort((a, b) => {
      const zA = a.zIndex || 0
      const zB = b.zIndex || 0

      if (zA !== zB) return zA - zB

      // 同层级下，如果是普通实体 (z=0)，按 Y 轴排序
      if (zA === 0) {
        return a.position.y - b.position.y
      }

      return 0
    })

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

    // --- Rect Support ---
    if (visual.type === 'rect') {
      renderer.ctx.fillStyle = visual.color
      // rect is drawn from top-left by default in canvas
      renderer.ctx.fillRect(position.x, position.y, visual.width, visual.height)
      return
    }

    // --- Vision Support ---
    if (visual.type === 'vision') {
      const target = entity.target
      // Check if target is alive/valid
      // If target is removed from world, we should probably destroy this indicator too
      // But for render system, just skipping draw is safe enough.
      // Cleanup should be handled elsewhere or lazily.
      if (target && target.aiState && target.aiConfig) {
        if (target.aiState.state !== 'stunned') {
          // Use shared position
          drawVision(renderer.ctx, position, target.aiConfig, target.aiState)
        }
      } else {
        // Target invalid (dead?), maybe mark for removal?
        // world.remove(entity) // Risky inside loop if not careful, but miniplex handles it.
        // For now, just don't draw.
      }
      return
    }

    // --- Sprite Support ---
    const def = Visuals[visual.id]

    if (!def) {
      // Fallback placeholder
      renderer.drawCircle(position.x, position.y, 10, 'red')
      if (Math.random() < 0.01) console.warn(`[VisualRenderSystem] Missing visual definition for: ${visual.id}`)
      return
    }

    const texture = renderer.assetManager.getTexture(def.assetId)
    if (!texture) {
      if (Math.random() < 0.01) console.warn(`[VisualRenderSystem] Missing texture for asset: ${def.assetId}`)
      return
    }

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
