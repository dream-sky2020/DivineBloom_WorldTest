import { world } from '@/game/ecs/world'

/**
 * Enemy Control System
 * 负责将 AI 意图 (aiState.moveDir) 转换为物理速度 (Velocity)
 * 同时也负责更新朝向 (Facing)
 * 
 * Required Components:
 * @property {object} velocity
 * @property {object} aiState (Intent source)
 * @property {object} aiConfig (Speed source)
 */

const controlEntities = world.with('enemy', 'velocity', 'aiState', 'aiConfig')

export const EnemyControlSystem = {
    update(dt) {
        for (const entity of controlEntities) {
            const { aiState, aiConfig, velocity } = entity

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

