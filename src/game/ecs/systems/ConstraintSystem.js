import { world } from '../world'

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

