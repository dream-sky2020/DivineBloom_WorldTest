import { world } from '../world'

// Helper to get player (assuming single player)
const getPlayer = () => {
  const p = world.with('player', 'position').first
  return p
}

const enemyEntities = world.with('enemy', 'position', 'velocity', 'aiState', 'aiConfig')

export const EnemyAISystem = {
  update(dt) {
    const player = getPlayer()
    if (!player) return

    const playerPos = player.position

    for (const entity of enemyEntities) {
      const { aiState, aiConfig, position, velocity } = entity
      
      // State Machine Logic
      switch (aiState.state) {
        case 'wander':
          updateWander(entity, dt, playerPos)
          break
        case 'chase':
          updateChase(entity, dt, playerPos)
          break
        case 'flee':
          updateFlee(entity, dt, playerPos)
          break
        case 'stunned':
          updateStunned(entity, dt)
          break
      }
      
      // Update Physics / Facing based on moveDir calculated by states
      // Note: moveDir is now stored in aiState for continuity
      const moveDir = aiState.moveDir
      const speed = aiConfig.speed
      
      // Update Facing
      const lenSq = moveDir.x * moveDir.x + moveDir.y * moveDir.y
      if (lenSq > 0.001) {
        const len = Math.sqrt(lenSq)
        aiState.facing.x = moveDir.x / len
        aiState.facing.y = moveDir.y / len
      }

      // Sync to Velocity
      velocity.x = moveDir.x * speed
      velocity.y = moveDir.y * speed
    }
  }
}

// --- State Update Functions ---

function updateWander(entity, dt, playerPos) {
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

function updateChase(entity, dt, playerPos) {
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

function updateFlee(entity, dt, playerPos) {
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

function updateStunned(entity, dt) {
  const { aiState } = entity

  if (aiState.justEntered) {
    aiState.moveDir.x = 0
    aiState.moveDir.y = 0
    aiState.colorHex = '#9ca3af' // Grayish
    aiState.starAngle = 0
    aiState.justEntered = false
  }

  aiState.timer -= dt
  aiState.starAngle += dt * 4

  if (aiState.timer <= 0) {
    // Unstun
    // Need to sync back to MapEnemy wrapper if possible, or just trust the system
    // The MapEnemy wrapper might have 'isStunned' prop which will be out of sync.
    // Ideally we remove that prop from MapEnemy entirely.
    changeState(entity, 'wander')
  }
}

// --- Helpers ---

function changeState(entity, newState) {
  entity.aiState.state = newState
  entity.aiState.justEntered = true
  entity.aiState.timer = 0 // Reset timer for new state (generic)
}

function getDistSq(p1, p2) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return dx * dx + dy * dy
}

function getDist(p1, p2) {
  return Math.sqrt(getDistSq(p1, p2))
}

function canSeePlayer(entity, distSq, playerPos) {
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

