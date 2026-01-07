import { world } from '@/game/ecs/world'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 */

export class Player {
  /**
   * @param {GameEngine} engine 
   * @param {object} [config]
   */
  constructor(engine, config = {}) {
    this.engine = engine

    // Create ECS Entity
    this.entity = world.add({
      position: { x: 200, y: 260 },
      velocity: { x: 0, y: 0 },
      speed: 200,
      fastSpeed: 320,
      input: true,
      player: true,
      bounds: {
        minX: 0, maxX: engine.width || 9999,
        minY: 0, maxY: engine.height || 9999
      },

      // --- 新视觉系统 ---
      visual: {
        id: 'hero',         // 对应 Visuals.js
        state: 'idle',      // 当前动作状态
        frameIndex: 0,      // 当前帧
        timer: 0,           // 动画计时器
        scale: config.scale || 0.7 // 缩放覆盖
      }
    })

    this.pos = this.entity.position
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

  // draw() 方法已移除，完全由 RenderSystem 接管
}
