import { changeState } from '../utils'

function getDistSq(p1, p2) {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return dx * dx + dy * dy
}

export const ChaseState = {
    update(entity, dt, playerPos) {
        const { aiState, aiConfig, position } = entity
      
        if (aiState.justEntered) {
          aiState.colorHex = '#ef4444' // Red
          aiState.alertAnim = 0.5
          aiState.justEntered = false
          aiState.chaseTimer = 0 // Initialize timer
        }
      
        if (aiState.alertAnim > 0) aiState.alertAnim -= dt
      
        // Throttle chase updates
        aiState.chaseTimer = (aiState.chaseTimer || 0) - dt
        if (aiState.chaseTimer > 0) return
      
        aiState.chaseTimer = 0.1 // Update every ~6 frames
      
        const distSq = getDistSq(position, playerPos)
        const visionRadiusSq = aiConfig.visionRadius * aiConfig.visionRadius
      
        // Check exit condition (squared distance)
        if (distSq > visionRadiusSq * 2.25) { // 1.5 * 1.5 = 2.25
          changeState(entity, 'wander')
          return
        }
      
        // Move towards player (Vector normalization instead of atan2)
        if (distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          aiState.moveDir.x = (playerPos.x - position.x) / dist
          aiState.moveDir.y = (playerPos.y - position.y) / dist
        }
    }
}

