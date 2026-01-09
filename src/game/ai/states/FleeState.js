import { changeState } from '../utils'

function getDistSq(p1, p2) {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return dx * dx + dy * dy
}

export const FleeState = {
    update(entity, dt, playerPos) {
        const { aiState, aiConfig, position } = entity
        
        if (aiState.justEntered) {
          aiState.colorHex = '#3b82f6' // Blue
          aiState.justEntered = false
          aiState.fleeTimer = 0
        }
      
        // Throttle flee updates
        aiState.fleeTimer = (aiState.fleeTimer || 0) - dt
        if (aiState.fleeTimer > 0) return
      
        aiState.fleeTimer = 0.1
      
        const distSq = getDistSq(position, playerPos)
        const visionRadiusSq = aiConfig.visionRadius * aiConfig.visionRadius
      
        // Check exit condition (squared distance)
        if (distSq > visionRadiusSq * 2.25) {
          changeState(entity, 'wander')
          return
        }
      
        // Move opposite (Vector normalization)
        if (distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          aiState.moveDir.x = -((playerPos.x - position.x) / dist)
          aiState.moveDir.y = -((playerPos.y - position.y) / dist)
        }
    }
}

