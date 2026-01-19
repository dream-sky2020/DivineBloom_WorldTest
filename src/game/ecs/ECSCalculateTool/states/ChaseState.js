import { changeState } from '@/game/ai/utils'

export const ChaseState = {
    update(entity, dt) {
        const { aiState, aiConfig, aiSensory, position } = entity
      
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
        
        // Use pre-calculated sensory data
        if (!aiSensory || !aiSensory.hasPlayer) {
             changeState(entity, 'wander')
             return
        }
      
        const distSq = aiSensory.distSqToPlayer
        const visionRadiusSq = aiConfig.visionRadius * aiConfig.visionRadius
      
        // Check exit condition (squared distance)
        // 1.5 * 1.5 = 2.25
        if (distSq > visionRadiusSq * 2.25) { 
          changeState(entity, 'wander')
          return
        }
      
        // Move towards player (Vector normalization)
        if (distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const playerPos = aiSensory.playerPos
          
          let targetX = playerPos.x
          let targetY = playerPos.y

          // 如果感知到了更优的传送门捷径，则改为向传送门移动
          if (aiSensory.bestPortal) {
              targetX = aiSensory.bestPortal.pos.x
              targetY = aiSensory.bestPortal.pos.y
          }

          const dx = targetX - position.x
          const dy = targetY - position.y
          const targetDist = Math.sqrt(dx * dx + dy * dy)

          if (targetDist > 0.1) {
              aiState.moveDir.x = dx / targetDist
              aiState.moveDir.y = dy / targetDist
          }
        }
    }
}
