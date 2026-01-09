import { world } from '@/game/ecs/world'

/**
 * Movement System Components Schema
 * 
 * Required Components:
 * @property {object} position - 位置组件
 * @property {number} position.x
 * @property {number} position.y
 * 
 * @property {object} velocity - 速度组件
 * @property {number} velocity.x - X轴速度 (pixels/sec)
 * @property {number} velocity.y - Y轴速度 (pixels/sec)
 */

const movingEntities = world.with('position', 'velocity')

export const MovementSystem = {
  update(dt) {
    for (const entity of movingEntities) {
      // Basic Euler integration
      entity.position.x += entity.velocity.x * dt
      entity.position.y += entity.velocity.y * dt
    }
  }
}

