import { world } from '../world'
import { Visuals } from '@/data/visuals'
import { drawVision, drawSuspicion, drawAlert, drawStunned } from '@/game/utils/renderUtils'

// 筛选出所有拥有 visual 组件的实体
const renderEntities = world.with('position', 'visual')

// 筛选出遗留的（还没迁移到 visual 系统）的实体
const legacyEntities = world.with('position', 'render')

export const RenderSystem = {
  /**
   * @param {import('@/game/GameEngine').Renderer2D} renderer 
   * @param {number} dt 
   */
  update(renderer, dt = 0) {
    const entities = []

    // 1. 收集实体并更新动画状态
    for (const entity of renderEntities) {
      this.updateAnimation(entity, dt)
      entities.push(entity)
    }

    // 2. 收集遗留实体
    for (const entity of legacyEntities) {
      if (!entity.visual) {
        entities.push(entity)
      }
    }

    // 3. Y轴排序 (用于 Entity Layer)
    entities.sort((a, b) => a.position.y - b.position.y)

    const viewW = renderer.width || 9999
    const viewH = renderer.height || 9999
    const camera = renderer.camera
    const cullMargin = 200 // 增加 margin 保证 Vision 不会被过早剔除

    // 辅助函数：判断是否在屏幕内
    const isVisible = (pos) => {
      return !(pos.x < camera.x - cullMargin ||
        pos.x > camera.x + viewW + cullMargin ||
        pos.y < camera.y - cullMargin ||
        pos.y > camera.y + viewH + cullMargin)
    }

    const ctx = renderer.ctx

    // --- Layer 1: Bottom (Vision, Shadows, Selection) ---
    // 这一层不需要 Y 排序，或者说通常在角色脚下
    for (const entity of entities) {
      if (!isVisible(entity.position)) continue

      // 绘制敌人视野
      if (entity.aiConfig && entity.aiState && entity.enemy) {
        // 只有非晕眩、非 idle (wander/chase) 才画视野，或者根据设计需求调整
        if (entity.aiState.state !== 'stunned') {
          drawVision(ctx, entity.position, entity.aiConfig, entity.aiState)
        }
      }
    }

    // --- Layer 2: Entity (Sprites) ---
    // 这一层必须严格按 Y 排序
    for (const entity of entities) {
      if (!isVisible(entity.position)) continue

      if (entity.visual) {
        this.drawVisual(renderer, entity)
      } else if (entity.render) {
        // Legacy Support
        if (entity.render.onDraw) entity.render.onDraw(renderer, entity)
        else if (entity.render.spriteId) {
          renderer.drawSprite(entity.render.spriteId, {
            imageId: entity.render.spriteId, sx: 0, sy: 0, sw: 0, sh: 0, ax: 0.5, ay: 1.0
          }, entity.position, entity.render.scale || 1)
        }
      }
    }

    // --- Layer 3: Top (UI, Status, Alerts) ---
    // 这一层通常覆盖在所有物体之上
    for (const entity of entities) {
      if (!isVisible(entity.position)) continue

      if (entity.aiState) {
        const { state } = entity.aiState

        // 1. Suspicion (?)
        if (entity.aiState.suspicion > 0) {
          drawSuspicion(ctx, entity.position, entity.aiState, entity.aiConfig)
        }

        // 2. Alert (!)
        if (state === 'chase') {
          drawAlert(ctx, entity.position, entity.aiState)
        }

        // 3. Stunned (Stars + Bar)
        if (state === 'stunned') {
          drawStunned(ctx, entity.position, entity.aiState)
        }
      }
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

  drawVisual(renderer, entity) {
    const { visual, position } = entity
    const def = Visuals[visual.id]

    if (!def) {
      renderer.drawCircle(position.x, position.y, 10, 'red')
      return
    }

    const texture = renderer.assetManager.getTexture(def.assetId)
    if (!texture) return

    const animName = visual.state || 'default'
    const anim = def.animations[animName] || def.animations['default'] || def.animations['idle']

    let frameId = 0
    if (anim && anim.frames.length > 0) {
      // 防止 frameIndex 越界 (比如切换动作时)
      if (visual.frameIndex >= anim.frames.length) visual.frameIndex = 0
      frameId = anim.frames[visual.frameIndex]
    }

    let sx = 0, sy = 0, sw = 0, sh = 0

    if (def.layout.type === 'grid') {
      const cols = def.layout.cols || 1
      const rows = def.layout.rows || 1
      // 容错：如果 texture 还没加载好，width 为 0，下面会算出 0
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
