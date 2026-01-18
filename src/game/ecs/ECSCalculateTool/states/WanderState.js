import { changeState } from '@/game/ai/utils'

export const WanderState = {
    update(entity, dt) {
        const { aiState, aiConfig, aiSensory, position } = entity

        // 1. Enter Logic
        if (aiState.justEntered) {
            aiState.colorHex = '#eab308' // Yellow
            aiState.suspicion = 0
            aiState.justEntered = false
        }

        // 2. Vision / Suspicion Check (Using Pre-calculated Sensory Data)
        if (aiConfig.type !== 'wander' && aiSensory) {
             // Synchronize suspicion from sensory to aiState
             aiState.suspicion = aiSensory.suspicion

             if (aiState.suspicion >= 1.0) {
                 changeState(entity, aiConfig.type === 'chase' ? 'chase' : 'flee')
                 return
             }
        }

        // 3. Movement Logic
        if (aiState.suspicion > 0 && aiSensory && aiSensory.hasPlayer) {
            // Stop to observe
            aiState.moveDir.x = 0
            aiState.moveDir.y = 0
            
            // Face player
            const playerPos = aiSensory.playerPos
            const dx = playerPos.x - position.x
            const dy = playerPos.y - position.y
            const distSq = aiSensory.distSqToPlayer
            
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
