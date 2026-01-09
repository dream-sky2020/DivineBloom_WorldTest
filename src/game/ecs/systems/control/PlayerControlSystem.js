import { world } from '@/game/ecs/world'

/**
 * Player Control System
 * 负责将抽象的输入指令 (Controls) 转换为实际的游戏逻辑 (Velocity)
 * 
 * Required Components:
 * @property {object} velocity
 * @property {object} controls (Created by InputSystem)
 * @property {number} controls.x
 * @property {number} controls.y
 * @property {boolean} controls.fast
 */

const controlEntities = world.with('input', 'velocity')

export const PlayerControlSystem = {
  update(dt) {
    for (const entity of controlEntities) {
      if (!entity.controls) continue

      const { x, y, fast } = entity.controls
      const speed = entity.speed || 200
      const fastSpeed = entity.fastSpeed || 320
      
      const currentSpeed = fast ? fastSpeed : speed

      let dx = x
      let dy = y

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const inv = 1 / Math.sqrt(2)
        dx *= inv
        dy *= inv
      }

      // Apply velocity
      entity.velocity.x = dx * currentSpeed
      entity.velocity.y = dy * currentSpeed
    }
  }
}

