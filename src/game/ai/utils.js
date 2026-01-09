/**
 * @param {import('@/game/ecs/world').Entity} entity
 * @param {string} newState
 */
export function changeState(entity, newState) {
    if (entity.aiState.state === newState) return
    
    entity.aiState.state = newState
    entity.aiState.justEntered = true
    entity.aiState.timer = 0
}

/**
 * @param {import('@/game/ecs/world').Entity} entity
 * @param {number} distSq
 * @param {object} playerPos
 * @returns {boolean}
 */
export function canSeePlayer(entity, distSq, playerPos) {
    const { position, aiConfig, aiState } = entity
    const { visionRadius, visionType, visionProximity, visionAngle } = aiConfig
  
    // Optimization: Pre-check squared distance
    // 30 * 30 = 900 (Proximity check)
    if (distSq < 900) return true
    
    const radiusSq = visionRadius * visionRadius
    if (distSq > radiusSq) return false
    
    if (visionType === 'circle') return true
    
    if (visionType === 'hybrid' && distSq <= visionProximity * visionProximity) return true
  
    if (visionType === 'cone' || visionType === 'hybrid') {
      // Only calculate sqrt if we passed distance checks and need angle
      const dist = Math.sqrt(distSq)
      
      const dx = playerPos.x - position.x
      const dy = playerPos.y - position.y
      const nx = dx / (dist || 1)
      const ny = dy / (dist || 1)
      const dot = nx * aiState.facing.x + ny * aiState.facing.y
      const threshold = Math.cos(visionAngle / 2)
      return dot >= threshold
    }
    return false
  }

