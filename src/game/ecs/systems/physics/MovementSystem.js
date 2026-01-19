import { world } from '@/game/ecs/world'

/**
 * Movement System (Physics)
 * 整合了位移计算与边界约束。
 * 
 * Required Components:
 * @property {object} position - 位置组件 {x, y}
 * @property {object} velocity - 速度组件 {x, y}
 * 
 * Optional Components:
 * @property {object} bounds - 边界限制 {minX, maxX, minY, maxY}
 */

const movingEntities = world.with('position', 'velocity')

export const MovementSystem = {
  /**
   * @param {number} dt 
   * @param {object} [options]
   * @param {object} [options.mapBounds] { width, height }
   */
  update(dt, { mapBounds = null } = {}) {
    for (const entity of movingEntities) {
      const { position, velocity, bounds } = entity

      // 1. 基础位移 (Euler integration)
      position.x += velocity.x * dt
      position.y += velocity.y * dt

      // 2. 实体自带的 bounds 组件约束
      if (bounds) {
        const { minX, maxX, minY, maxY } = bounds
        if (position.x < minX) position.x = minX
        else if (position.x > maxX) position.x = maxX
        if (position.y < minY) position.y = minY
        else if (position.y > maxY) position.y = maxY
      }

      // 3. 地图全局边界约束
      if (mapBounds) {
        if (position.x < 0) position.x = 0
        else if (position.x > mapBounds.width) position.x = mapBounds.width
        if (position.y < 0) position.y = 0
        else if (position.y > mapBounds.height) position.y = mapBounds.height
      }
    }
  }
}
