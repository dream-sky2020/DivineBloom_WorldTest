import { world } from '@/game/ecs/world'

/**
 * Constraint System Components Schema
 * 
 * Required Components:
 * @property {object} position - 位置组件
 * @property {number} position.x
 * @property {number} position.y
 * 
 * @property {object} bounds - 边界限制组件
 * @property {number} bounds.minX - 最小 X 坐标
 * @property {number} bounds.maxX - 最大 X 坐标
 * @property {number} bounds.minY - 最小 Y 坐标
 * @property {number} bounds.maxY - 最大 Y 坐标
 */

// Entities that need to be constrained within bounds
// They must have 'position' and 'bounds' components
// bounds: { minX, maxX, minY, maxY }
const constrainedEntities = world.with('position', 'bounds')

export const ConstraintSystem = {
  update(dt) {
    for (const entity of constrainedEntities) {
      const { minX, maxX, minY, maxY } = entity.bounds
      const { position } = entity
      
      position.x = Math.max(minX, Math.min(maxX, position.x))
      position.y = Math.max(minY, Math.min(maxY, position.y))
    }
  }
}

