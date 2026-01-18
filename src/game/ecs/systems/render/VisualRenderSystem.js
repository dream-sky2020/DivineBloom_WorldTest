import { world } from '@/game/ecs/world'
import { Visuals } from '@/data/visuals'

/**
 * Sprite Render System
 * 负责渲染：实体 Sprite (角色, 道具等)
 * 层级：中间层 (Layer 20)，需要 Y 轴排序
 * 
 * Required Components:
 * @property {object} position
 * @property {object} visual
 */

const renderEntities = world.with('position', 'visual')

export const VisualRenderSystem = {
  // 定义渲染层级 (Z-Index)
  LAYER: 20,

  /**
   * 更新动画帧 (原 AnimationSystem 的职责)
   * @param {number} dt 
   */
  update(dt) {
    for (const entity of renderEntities) {
      if (!entity.visual) {
        console.warn(`[VisualRenderSystem] Entity ${entity.id || 'N/A'} missing visual component!`);
        continue;
      }
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
   * @param {import('@/game/ecs/GameEngine').Renderer2D} renderer 
   */
  draw(renderer) {
    // 1. 收集实体 (排除纯地面)
    const entities = []
    for (const entity of renderEntities) {
      if (!entity.position || !entity.visual) continue;

      // 仅排除 background_ground 类型，其余全部由本系统渲染
      if (entity.type === 'background_ground') continue;

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

    // Defensive check for camera
    if (!camera) {
      console.error('[VisualRenderSystem] Camera not initialized!');
      return;
    }

    const cullMargin = 100

    const isVisible = (pos) => {
      // Defensive check for pos
      if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;

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
      const camera = renderer.camera
      renderer.ctx.fillStyle = visual.color || 'magenta' // fallback color
      // 使用相机偏移绘制矩形
      renderer.ctx.fillRect(
        position.x - (camera?.x || 0),
        position.y - (camera?.y || 0),
        visual.width || 10,
        visual.height || 10
      )
      return
    }

    // --- Vision Support (Deprecated) ---
    // Vision is now handled by AIVisionRenderSystem.
    // If we encounter a 'vision' type visual, just ignore it to prevent errors.
    if (visual.type === 'vision') {
      return
    }

    // --- Sprite Support ---
    // Defensive check
    if (!visual.id) {
      console.warn(`[VisualRenderSystem] Visual component missing 'id'. Entity: ${entity.id || 'N/A'}`);
      return;
    }

    const def = Visuals[visual.id]

    if (!def) {
      // Fallback placeholder
      renderer.drawCircle(position.x, position.y, 10, 'red')
      if (Math.random() < 0.01) console.warn(`[VisualRenderSystem] Missing visual definition for: ${visual.id}`)
      return
    }

    const texture = renderer.assetManager.getTexture(def.assetId)
    if (!texture) {
      // Only warn occasionally to avoid spamming console
      if (Math.random() < 0.01) console.warn(`[VisualRenderSystem] Missing texture for asset: ${def.assetId}`)
      return
    }

    const animName = visual.state || 'default'
    const anim = def.animations[animName] || def.animations['default'] || def.animations['idle']

    let frameId = 0
    if (anim && anim.frames.length > 0) {
      // Safe access
      if (visual.frameIndex === undefined) visual.frameIndex = 0;

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
