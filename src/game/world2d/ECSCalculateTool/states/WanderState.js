import { changeState } from '@world2d/ECSCalculateTool/AIUtils'
import { SteeringTool } from '@world2d/ECSCalculateTool/SteeringTool'

export const WanderState = {
    update(entity, dt) {
        const { aiState, aiConfig, aiSensory, transform } = entity

        // 1. Enter Logic
        if (aiState.justEntered) {
            aiState.colorHex = '#eab308' // Yellow
            aiState.suspicion = 0
            aiState.lostTargetTimer = 0
            aiState.targetPos = null
            aiState.justEntered = false
        }

        // 2. Vision / Suspicion Check (Using Pre-calculated Sensory Data)
        if (aiConfig.type !== 'wander' && aiSensory) {
             // Synchronize suspicion from sensory to aiState
             aiState.suspicion = aiSensory.suspicion

             if (aiState.suspicion >= 1.0) {
                 // [DECOUPLED] Use detectedState from config
                 changeState(entity, aiConfig.detectedState || 'chase')
                 return
             }
        }

        // 3. Home Area Constraint & Random Movement
        const obstacles = aiSensory?.nearbyObstacles || [];
        
        let isReturningHome = false
        if (aiConfig.homePosition && aiConfig.patrolRadius) {
            const dx = transform.x - aiConfig.homePosition.x
            const dy = transform.y - aiConfig.homePosition.y
            const distSq = dx * dx + dy * dy
            const radiusSq = aiConfig.patrolRadius * aiConfig.patrolRadius

            if (distSq > radiusSq) {
                isReturningHome = true
                // --- 使用 SteeringTool 回家 ---
                const moveDir = SteeringTool.calculateMoveDir(entity, aiConfig.homePosition, obstacles);
                aiState.moveDir.x = moveDir.x;
                aiState.moveDir.y = moveDir.y;
                
                // Reset timer if we were idle or moving elsewhere
                if (aiState.timer <= 0) aiState.timer = 1.0 
            }
        }

        // 4. Observation Logic
        if (!isReturningHome && aiState.suspicion > 0 && aiSensory && aiSensory.hasPlayer) {
            // Stop to observe
            aiState.moveDir.x = 0
            aiState.moveDir.y = 0
            
            // Face player
            const playerPos = aiSensory.playerPos
            const dx = playerPos.x - transform.x
            const dy = playerPos.y - transform.y
            const distSq = aiSensory.distSqToPlayer
            
            if (distSq > 0.001) {
                const invDist = 1 / Math.sqrt(distSq)
                aiState.facing.x = dx * invDist
                aiState.facing.y = dy * invDist
            }
            return
        }

        // 5. Random Wander Logic
        if (!isReturningHome) {
            aiState.timer -= dt
            if (aiState.timer <= 0) {
                aiState.timer = 2 + Math.random() * 2
                
                if (Math.random() < 0.3) {
                    aiState.targetPos = null; // Idle
                } else {
                    const angle = Math.random() * Math.PI * 2
                    // 设定一个临时目标点用于转向系统
                    aiState.targetPos = {
                        x: transform.x + Math.cos(angle) * 100,
                        y: transform.y + Math.sin(angle) * 100
                    }
                }
            }

            if (aiState.targetPos) {
                const moveDir = SteeringTool.calculateMoveDir(entity, aiState.targetPos, obstacles);
                aiState.moveDir.x = moveDir.x;
                aiState.moveDir.y = moveDir.y;
            } else {
                aiState.moveDir.x = 0
                aiState.moveDir.y = 0
            }
        }
    }
}
