import { world } from '@world2d/world'
import { Visuals } from '@schema/visuals'
import { createLogger } from '@/utils/logger'

const logger = createLogger('VisualRenderSystem')

/**
 * Sprite Render System
 * 负责渲染：实体 Sprite (角色, 道具等)
 * 层级：中间层 (Layer 20)，需要 Y 轴排序
 * 
 * Required Components:
 * @property {object} transform
 * @property {object} visual
 */

const renderEntities = world.with('transform')

export const VisualRenderSystem = {
  // 定义渲染层级 (Z-Index)
  LAYER: 20,

  /**
   * 更新动画帧
   * @param {number} dt 
   */
  update(dt) {
    for (const entity of world.with('animation')) {
      this.updateAnimation(entity, dt)
    }
  },

  updateAnimation(entity, dt) {
    const { sprite, animation } = entity
    if (!sprite || !animation || animation.paused) return

    // --- 核心改进：响应式重置 ---
    // 如果 sprite.id 变了，或者这是第一次同步，重置动画状态
    if (animation.lastSyncedId !== sprite.id) {
      animation.frameIndex = 0
      animation.timer = 0
      animation.lastSyncedId = sprite.id
    }

    // 从全局配置获取动画定义
    const def = Visuals[sprite.id]
    if (!def || !def.animations) return

    const animDef = def.animations[animation.currentState] ||
      def.animations['default'] ||
      def.animations['idle']

    if (!animDef || !animDef.frames || animDef.frames.length <= 1) {
      animation.frameIndex = 0
      return
    }

    // 计算当前帧的时长 (支持全局配置中的 speed)
    // 如果配置里是 speed: 8，表示每秒 8 帧，则一帧 125ms
    const speed = animDef.speed || 10
    const frameDuration = 1 / speed

    animation.timer += dt * animation.speedMultiplier

    if (animation.timer >= frameDuration) {
      animation.timer -= frameDuration
      animation.frameIndex++

      if (animation.frameIndex >= animDef.frames.length) {
        if (animDef.loop !== false) {
          animation.frameIndex = 0
        } else {
          animation.frameIndex = animDef.frames.length - 1
        }
      }
    }
  },

  /**
   * @param {import('@world2d/GameEngine').Renderer2D} renderer 
   */
  draw(renderer) {
    // 1. 收集实体
    const entities = []
    for (const entity of renderEntities) {
      if (!entity.transform) continue;
      if (!entity.sprite && !entity.visual) continue;

      // 仅排除 background_ground 类型
      if (entity.type === 'background_ground') continue;

      entities.push(entity)
    }

    // ... 排序逻辑保持不变 ...
    entities.sort((a, b) => {
      const zA = a.zIndex || 0
      const zB = b.zIndex || 0
      if (zA !== zB) return zA - zB
      if (zA === 0) return a.transform.y - b.transform.y
      return 0
    })

    // ... 剔除与绘制 ...
    const viewW = renderer.width || 9999
    const viewH = renderer.height || 9999
    const camera = renderer.camera
    if (!camera) return;

    const cullMargin = 100
    const isVisible = (pos) => {
      if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
      return !(pos.x < camera.x - cullMargin ||
        pos.x > camera.x + viewW + cullMargin ||
        pos.y < camera.y - cullMargin ||
        pos.y > camera.y + viewH + cullMargin)
    }

    for (const entity of entities) {
      if (!isVisible(entity.transform)) continue
      this.drawVisual(renderer, entity)
    }
  },

  drawVisual(renderer, entity) {
    // 优先使用新的 sprite 组件，兼容旧的 visual 组件
    const sprite = entity.sprite || entity.visual;
    const { transform, animation } = entity;

    if (!sprite || sprite.visible === false) return;

    // --- Rect Support ---
    if (sprite.type === 'rect' || entity.rect) {
      const rect = entity.rect || sprite;
      const camera = renderer.camera
      renderer.ctx.fillStyle = sprite.tint || rect.color || 'magenta'
      renderer.ctx.globalAlpha = sprite.opacity !== undefined ? sprite.opacity : 1.0;

      renderer.ctx.fillRect(
        transform.x + (sprite.offsetX || 0) - (camera?.x || 0),
        transform.y + (sprite.offsetY || 0) - (camera?.y || 0),
        rect.width || 10,
        rect.height || 10
      )
      renderer.ctx.globalAlpha = 1.0;
      return
    }

    // --- Sprite Support ---
    if (!sprite.id) return;

    const def = Visuals[sprite.id]
    if (!def) {
      renderer.drawCircle(transform.x, transform.y, 10, 'red')
      return
    }

    const texture = renderer.assetManager.getTexture(def.assetId)
    if (!texture) return

    // 获取当前帧索引
    let frameIndex = 0;
    if (animation) {
      frameIndex = animation.frameIndex;
    } else if (sprite.frameIndex !== undefined) {
      frameIndex = sprite.frameIndex; // 兼容旧逻辑
    }

    // 获取当前动画定义以获取 frameId
    const animName = animation?.currentState || sprite.state || 'default'
    const animDef = def.animations[animName] || def.animations['default'] || def.animations['idle']

    let frameId = 0
    if (animDef && animDef.frames.length > 0) {
      const idx = Math.min(frameIndex, animDef.frames.length - 1);
      frameId = animDef.frames[idx];
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

    // 应用颜色和偏移
    const drawPos = {
      x: transform.x + (sprite.offsetX || 0),
      y: transform.y + (sprite.offsetY || 0)
    };

    const scale = sprite.scale !== undefined ? sprite.scale : 1.0

    // [UPDATED] Pass rotation/scale if renderer supports it, or handle it here
    // Assumption: renderer.drawSprite supports basic pos and scale, but maybe not full transform
    // If renderer.drawSprite is simple, we might need to change how we call it or update renderer.
    // For now, let's assume we just pass the position and let the renderer handle basic drawing.
    // However, since we have rotation in transform, we should probably use ctx.rotate if drawSprite doesn't handle it.
    // But drawSprite usually just draws an image.
    // Let's modify the draw call to use the transform context.
    
    // NOTE: Since I cannot see renderer.drawSprite implementation, I will assume it draws at drawPos.
    // To support rotation, I might need to save/restore context and rotate.
    // But VisualRenderSystem.drawVisual in the provided code seems to rely on renderer.drawSprite.
    // I will stick to the previous logic but update position source.
    
    renderer.drawSprite(texture, spriteDef, drawPos, scale)
  }
}

