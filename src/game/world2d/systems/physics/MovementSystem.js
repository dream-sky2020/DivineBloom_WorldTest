import { world } from '@world2d/world'

/**
 * Movement System (Physics)
 * 整合了位移计算与边界约束。
 * 
 * Required Components:
 * @property {object} transform - 位置组件 {x, y}
 * @property {object} velocity - 速度组件 {x, y}
 * 
 * Optional Components:
 * @property {object} bounds - 边界限制 {minX, maxX, minY, maxY}
 */

const movingEntities = world.with('transform', 'velocity')

export const MovementSystem = {
  /**
   * @param {number} dt 
   * @param {object} [options]
   * @param {object} [options.mapBounds] { width, height }
   */
  update(dt, { mapBounds = null } = {}) {
    for (const entity of movingEntities) {
      const { transform, velocity, bounds } = entity

      // 1. 基础位移 (Euler integration)
      transform.x += velocity.x * dt
      transform.y += velocity.y * dt

      // 2. 实体自带的 bounds 组件约束
      if (bounds) {
        const { minX, maxX, minY, maxY } = bounds
        if (transform.x < minX) transform.x = minX
        else if (transform.x > maxX) transform.x = maxX
        if (transform.y < minY) transform.y = minY
        else if (transform.y > maxY) transform.y = maxY
      }

      // 3. 地图全局边界约束
      if (mapBounds) {
        if (transform.x < 0) transform.x = 0
        else if (transform.x > mapBounds.width) transform.x = mapBounds.width
        if (transform.y < 0) transform.y = 0
        else if (transform.y > mapBounds.height) transform.y = mapBounds.height
      }
    }
  }
}
