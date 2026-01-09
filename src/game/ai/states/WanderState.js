import { changeState, canSeePlayer } from '../utils'

/**
 * @param {object} p1
 * @param {object} p2
 */
function getDistSq(p1, p2) {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return dx * dx + dy * dy
}

export const WanderState = {
    update(entity, dt, playerPos) {
        const { aiState, aiConfig, position } = entity

        // 1. Enter Logic
        if (aiState.justEntered) {
            aiState.colorHex = '#eab308' // Yellow
            aiState.suspicion = 0
            aiState.justEntered = false
            aiState.visionTimer = Math.random() * 0.5 
        }

        // 2. Vision Check (Throttled)
        if (aiConfig.type !== 'wander') {
            aiState.visionTimer = (aiState.visionTimer || 0) - dt

            if (aiState.visionTimer <= 0) {
                const distSq = getDistSq(position, playerPos)
                const visionRadiusSq = aiConfig.visionRadius * aiConfig.visionRadius
                
                // Dynamic throttling: Check less often if far away
                let interval = 0.2 // ~12 frames @ 60fps
                if (distSq > visionRadiusSq * 4) { // Far away
                    interval = 1.0 
                } else if (distSq < visionRadiusSq * 0.5) { // Close
                    interval = 0.1 
                }
                aiState.visionTimer = interval + Math.random() * 0.05

                // Check if potentially visible
                if (distSq <= visionRadiusSq * 1.5) {
                    if (canSeePlayer(entity, distSq, playerPos)) {
                        // Increase Suspicion
                        const fillRate = aiConfig.suspicionTime > 0 ? (1.0 / aiConfig.suspicionTime) : 1.0
                        aiState.suspicion += fillRate * interval 
                        
                        if (aiState.suspicion >= 1.0) {
                            aiState.suspicion = 1.0
                            changeState(entity, aiConfig.type === 'chase' ? 'chase' : 'flee')
                            return
                        }
                    } else {
                        // Decrease Suspicion
                        if (aiState.suspicion > 0) {
                            aiState.suspicion -= interval * 0.5
                            if (aiState.suspicion < 0) aiState.suspicion = 0
                        }
                    }
                } else {
                    // Too far
                    if (aiState.suspicion > 0) {
                        aiState.suspicion -= interval * 0.5
                        if (aiState.suspicion < 0) aiState.suspicion = 0
                    }
                }
            }
        }

        // 3. Movement Logic
        if (aiState.suspicion > 0) {
            // Stop to observe
            aiState.moveDir.x = 0
            aiState.moveDir.y = 0
            // Face player - Optimize: Avoid atan2/cos/sin
            const dx = playerPos.x - position.x
            const dy = playerPos.y - position.y
            const distSq = dx * dx + dy * dy
            if (distSq > 0.001) {
                const invDist = 1 / Math.sqrt(distSq)
                aiState.facing.x = dx * invDist
                aiState.facing.y = dy * invDist
            }
            return
        }

        aiState.timer -= dt
        if (aiState.timer <= 0) {
            aiState.timer = 2 + Math.random() * 2
            const angle = Math.random() * Math.PI * 2
            aiState.moveDir.x = Math.cos(angle)
            aiState.moveDir.y = Math.sin(angle)

            if (Math.random() < 0.3) {
                aiState.moveDir.x = 0
                aiState.moveDir.y = 0
            }
        }
    }
}

