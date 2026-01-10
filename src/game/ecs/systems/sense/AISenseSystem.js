import { world } from '@/game/ecs/world'
import { canSeePlayer } from '@/game/ai/utils'

/**
 * AI Sense System
 * 负责 AI 的感知逻辑 (Sense)
 * 收集环境信息并更新 aiSensory 组件
 * 
 * Target Entities:
 * @property {object} aiConfig
 * @property {object} aiState
 * @property {object} position
 * 
 * Output Component:
 * @property {object} aiSensory
 * @property {number} aiSensory.distSqToPlayer
 * @property {object} aiSensory.playerPos { x, y } (Copy for safety)
 * @property {boolean} aiSensory.hasPlayer
 * @property {boolean} aiSensory.canSeePlayer
 * @property {number} aiSensory.suspicion (0-1)
 */

const aiEntities = world.with('aiConfig', 'aiState', 'position')

// Helper to get player
const getPlayer = () => {
    return world.with('player', 'position').first
}

export const AISenseSystem = {
    update(dt) {
        const player = getPlayer()
        const playerPos = player ? player.position : null

        for (const entity of aiEntities) {
            // Ensure aiSensory component exists
            if (!entity.aiSensory) {
                world.addComponent(entity, 'aiSensory', {
                    distSqToPlayer: Infinity,
                    playerPos: { x: 0, y: 0 },
                    hasPlayer: false,
                    canSeePlayer: false,
                    suspicion: 0,
                    senseTimer: Math.random() // Stagger updates
                })
            }

            const sensory = entity.aiSensory
            const { aiConfig, position } = entity

            // Throttle sensing logic (e.g. 10 times per second)
            sensory.senseTimer -= dt
            if (sensory.senseTimer > 0) continue

            // Adaptive throttle based on distance (handled in next frame) or fixed
            sensory.senseTimer = 0.1

            if (!playerPos) {
                sensory.hasPlayer = false
                sensory.distSqToPlayer = Infinity
                sensory.canSeePlayer = false
                sensory.suspicion = 0
                continue
            }

            // Update basic info
            sensory.hasPlayer = true
            sensory.playerPos.x = playerPos.x
            sensory.playerPos.y = playerPos.y

            const dx = playerPos.x - position.x
            const dy = playerPos.y - position.y
            sensory.distSqToPlayer = dx * dx + dy * dy

            // Check Visibility
            const isVisible = canSeePlayer(entity, sensory.distSqToPlayer, playerPos)
            sensory.canSeePlayer = isVisible

            // Update Suspicion (Migrated from WanderState)
            // Note: This logic might be better placed here or in Intent, 
            // but Sense is about interpreting raw data into "knowledge".
            // Suspicion is "how much I think I see someone".

            const suspicionTime = aiConfig.suspicionTime || 1.0 // Default 1s to fill
            const fillRate = 1.0 / suspicionTime
            const interval = 0.1 // Matches our throttle

            if (isVisible) {
                sensory.suspicion += fillRate * interval
                if (sensory.suspicion > 1.0) sensory.suspicion = 1.0
            } else {
                // Decay suspicion
                if (sensory.suspicion > 0) {
                    sensory.suspicion -= interval * 0.5 // Decay at half speed
                    if (sensory.suspicion < 0) sensory.suspicion = 0
                }
            }
        }
    }
}

