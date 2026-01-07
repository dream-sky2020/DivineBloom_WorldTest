import { world } from '../world'

const inputEntities = world.with('input', 'velocity')

export const InputSystem = {
  update(dt, input) {
    for (const entity of inputEntities) {
      const keys = input
      const speed = entity.speed || 200
      const fastSpeed = entity.fastSpeed || 320
      
      const isFast = keys.isDown('ShiftLeft') || keys.isDown('ShiftRight')
      const currentSpeed = isFast ? fastSpeed : speed

      let dx = 0
      let dy = 0

      if (keys.isDown('KeyW') || keys.isDown('ArrowUp')) dy -= 1
      if (keys.isDown('KeyS') || keys.isDown('ArrowDown')) dy += 1
      if (keys.isDown('KeyA') || keys.isDown('ArrowLeft')) dx -= 1
      if (keys.isDown('KeyD') || keys.isDown('ArrowRight')) dx += 1

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

