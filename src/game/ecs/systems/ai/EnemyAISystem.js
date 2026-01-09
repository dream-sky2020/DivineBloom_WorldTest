import { world } from '@/game/ecs/world'
import { WanderState } from '@/game/ai/states/WanderState'
import { ChaseState } from '@/game/ai/states/ChaseState'
import { FleeState } from '@/game/ai/states/FleeState'
import { StunnedState } from '@/game/ai/states/StunnedState'

/**
 * Enemy AI System Components Schema
 * 
 * Required Components:
 * @property {boolean} enemy - Tag: 标记为敌人
 * @property {object} position - { x: number, y: number }
 * @property {object} velocity - { x: number, y: number }
 * 
 * @property {object} aiConfig - AI 静态配置 (ReadOnly)
 * @property {number} aiConfig.speed - 移动速度
 * @property {number} aiConfig.visionRadius - 视野半径
 * @property {string} [aiConfig.type] - 基础 AI 类型 ('wander' 等)
 * @property {string} [aiConfig.visionType] - 视野形状 ('circle', 'cone' 等)
 * 
 * @property {object} aiState - AI 运行时状态 (Read/Write)
 * @property {string} aiState.state - 当前状态名 ('wander', 'chase', 'flee', 'stunned')
 * @property {object} aiState.moveDir - 期望移动向量 { x, y }
 * @property {object} aiState.facing - 朝向向量 { x, y }
 * @property {number} [aiState.timer] - 通用计时器
 * @property {number} [aiState.suspicion] - 警戒值 (0-1)
 * @property {boolean} [aiState.justEntered] - 是否刚进入当前状态
 */

// Helper to get player (assuming single player)
const getPlayer = () => {
  const p = world.with('player', 'position').first
  return p
}

const enemyEntities = world.with('enemy', 'position', 'velocity', 'aiState', 'aiConfig')

// State Map
const STATES = {
    'wander': WanderState,
    'chase': ChaseState,
    'flee': FleeState,
    'stunned': StunnedState
}

export const EnemyAISystem = {
  update(dt) {
    const player = getPlayer()
    if (!player) return

    const playerPos = player.position

    for (const entity of enemyEntities) {
      const { aiState, aiConfig, velocity } = entity
      
      const currentState = STATES[aiState.state]
      if (currentState) {
          currentState.update(entity, dt, playerPos)
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
