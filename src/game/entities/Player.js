import { makeSprite } from '@/game/GameEngine'
import { world } from '@/game/ecs/world'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
 */

export class Player {
  /**
   * @param {GameEngine} engine 
   */
  constructor(engine) {
    this.engine = engine

    // Create ECS Entity
    this.entity = world.add({
      position: { x: 200, y: 260 },
      velocity: { x: 0, y: 0 },
      // Add stats required by InputSystem
      speed: 200,
      fastSpeed: 320,
      // InputSystem checks for 'input' tag
      input: true,
      player: true,
      // Initialize bounds with engine dimensions to prevent clamping to (0,0) on first frame
      bounds: {
        minX: 0,
        maxX: engine.width || 9999,
        minY: 0,
        maxY: engine.height || 9999
      },
      // RenderSystem Data
      render: {
        spriteId: 'sheet', // Texture ID
        // We can put spriteDef props here if we want dynamic sprite switching
        sx: 0, sy: 0, sw: 32, sh: 32,
        ax: 0.5, ay: 1.0,
        scale: 2
      }
    })

    // 状态数据 - Link directly to ECS component
    this.pos = this.entity.position

    this.spriteId = 'hero_idle'
    this.scale = 2

    // speed/fastSpeed are now on the entity, but we keep refs here if old code uses them
    // or just rely on the entity.
    this.speed = 200
    this.fastSpeed = 320

    // 初始化资源
    this._initResources()
  }

  toData() {
    return {
      x: this.pos.x,
      y: this.pos.y
    }
  }

  restore(data) {
    if (!data) return
    this.pos.x = data.x
    this.pos.y = data.y
  }

  destroy() {
    if (this.entity) {
      world.remove(this.entity)
      this.entity = null
    }
  }

  async _initResources() {
    // 这里可以是具体的资源加载逻辑，或者在 Scene 层统一加载
    // 为了独立性，Player 可以定义自己需要的 Sprite
    // 注意：实际项目中，资源通常由 AssetManager 统一预加载，这里简化处理
  }

  _clampPosition() {
    // Deprecated: Logic moved to ConstraintSystem
  }

  /**
   * @param {Renderer2D} renderer 
   */
  // draw(renderer) {
  //   Deprecated: Moved to RenderSystem
  // }
}

