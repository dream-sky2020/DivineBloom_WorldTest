import { world } from '@/game/ecs/world'

/**
 * Player Control System
 * 负责将玩家意图 (PlayerIntent) 转换为物理速度 (Velocity)
 * 
 * Required Components:
 * @property {object} velocity
 * @property {object} playerIntent (Created by PlayerIntentSystem)
 * @property {object} playerIntent.move { x, y }
 * @property {boolean} playerIntent.wantsToRun
 */

const controlEntities = world.with('playerIntent', 'velocity')

export const PlayerControlSystem = {
  update(dt) {
    for (const entity of controlEntities) {
      if (!entity.playerIntent) continue

      const { move, wantsToRun } = entity.playerIntent
      const speed = entity.speed || 200
      const fastSpeed = entity.fastSpeed || 320

      const currentSpeed = wantsToRun ? fastSpeed : speed

      // Apply velocity directly from intent
      entity.velocity.x = move.x * currentSpeed
      entity.velocity.y = move.y * currentSpeed
    }
  }
}

