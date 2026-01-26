import { changeState } from '@world2d/ECSCalculateTool/AIUtils'
import { SteeringTool } from '@world2d/ECSCalculateTool/SteeringTool'

export const ChaseState = {
    update(entity, dt) {
        const { aiState, aiConfig, aiSensory, position } = entity
      
        if (aiState.justEntered) {
          aiState.colorHex = '#ef4444' // Red
          aiState.alertAnim = 0.5
          aiState.justEntered = false
          aiState.chaseTimer = 0 // Initialize timer
          aiState.lostTargetTimer = 10 // 初始化 10s 追击时长
        }
      
        if (aiState.alertAnim > 0) aiState.alertAnim -= dt
      
        // Throttle chase updates
        aiState.chaseTimer = (aiState.chaseTimer || 0) - dt
        
        // 核心逻辑：即使节流，也要更新计时器
        const canSee = aiSensory && aiSensory.canSeePlayer;
        if (canSee) {
            aiState.lostTargetTimer = 10;
        } else {
            aiState.lostTargetTimer -= dt;
            if (aiState.lostTargetTimer <= 0) {
                changeState(entity, 'wander')
                return
            }
        }

        if (aiState.chaseTimer > 0) return
        aiState.chaseTimer = 0.1 // Update every ~6 frames
        
        // 确定移动目标
        let targetPos = null;

        // 1. 如果有感知的传送门（捷径或玩家消失的门），优先去传送门
        if (aiSensory && aiSensory.bestPortal) {
            targetPos = aiSensory.bestPortal.pos;
        } 
        // 2. 否则如果看到玩家，直接追玩家
        else if (canSee) {
            targetPos = aiSensory.playerPos;
        }
        // 3. 否则如果没看到玩家但还在追击时间内，去最后看到玩家的地方
        else if (aiState.lastSeenPos) {
            targetPos = aiState.lastSeenPos;
        }

        // --- 执行移动 ---
        if (targetPos) {
          // 获取感知到的障碍物
          const obstacles = aiSensory ? (aiSensory.nearbyObstacles || []) : [];
          
          // 计算最优移动方向
          const moveDir = SteeringTool.calculateMoveDir(entity, targetPos, obstacles);
          
          aiState.moveDir.x = moveDir.x;
          aiState.moveDir.y = moveDir.y;
        } else {
          // 彻底没目标了，停止移动
          aiState.moveDir.x = 0;
          aiState.moveDir.y = 0;
        }
    }
}
