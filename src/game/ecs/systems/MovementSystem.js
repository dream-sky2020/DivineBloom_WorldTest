import { world } from '../world'

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

