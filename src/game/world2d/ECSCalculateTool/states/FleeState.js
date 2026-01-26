import { changeState } from '@world2d/ECSCalculateTool/AIUtils'
import { SteeringTool } from '@world2d/ECSCalculateTool/SteeringTool'

export const FleeState = {
    update(entity, dt) {
        const { aiState, aiConfig, aiSensory, position } = entity
        
        if (aiState.justEntered) {
          aiState.colorHex = '#3b82f6' // Blue
          aiState.justEntered = false
          aiState.fleeTimer = 0
        }
      
        // Throttle flee updates
        aiState.fleeTimer = (aiState.fleeTimer || 0) - dt
        if (aiState.fleeTimer > 0) return
      
        aiState.fleeTimer = 0.1

        if (!aiSensory || !aiSensory.hasPlayer) {
            changeState(entity, 'wander')
            return
        }
      
        const distSq = aiSensory.distSqToPlayer
        const visionRadiusSq = aiConfig.visionRadius * aiConfig.visionRadius
        const exitMultiplier = aiConfig.chaseExitMultiplier || 1.5
      
        // Check exit condition (squared distance)
        if (distSq > visionRadiusSq * (exitMultiplier * exitMultiplier)) {
          changeState(entity, 'wander')
          return
        }
      
        // --- 核心重构：使用 SteeringTool 进行避障逃跑 ---
        if (distSq > 0.001) {
          const playerPos = aiSensory.playerPos
          
          // 计算逃跑目标点：背离玩家 200 像素的位置
          const dx = position.x - playerPos.x
          const dy = position.y - playerPos.y
          const dist = Math.sqrt(distSq)
          const targetPos = {
              x: position.x + (dx / dist) * 200,
              y: position.y + (dy / dist) * 200
          }

          const obstacles = aiSensory.nearbyObstacles || [];
          const moveDir = SteeringTool.calculateMoveDir(entity, targetPos, obstacles);
          
          aiState.moveDir.x = moveDir.x;
          aiState.moveDir.y = moveDir.y;
        }
    }
}
