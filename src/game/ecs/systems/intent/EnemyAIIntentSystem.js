import { world } from '@/game/ecs/world'
import { WanderState } from '@/game/ai/states/WanderState'
import { ChaseState } from '@/game/ai/states/ChaseState'
import { FleeState } from '@/game/ai/states/FleeState'
import { StunnedState } from '@/game/ai/states/StunnedState'

/**
 * Enemy AI Intent System (Formerly EnemyAISystem)
 * 负责 AI 决策 (Think)
 * 根据感知数据 (aiSensory) 运行状态机，更新状态和意图
 * 
 * Required Components:
 * ... (同前)
 * @property {object} aiSensory (From AISenseSystem)
 */

const enemyEntities = world.with('enemy', 'position', 'velocity', 'aiState', 'aiConfig')

// State Map
const STATES = {
  'wander': WanderState,
  'chase': ChaseState,
  'flee': FleeState,
  'stunned': StunnedState
}

export const EnemyAIIntentSystem = {
  update(dt) {
    // No longer need to fetch player here, States use aiSensory

    for (const entity of enemyEntities) {
      const { aiState } = entity
      
      const currentState = STATES[aiState.state]
      if (currentState) {
          // States now read from entity.aiSensory internally
          currentState.update(entity, dt)
      }
      
      // Control Logic moved to EnemyControlSystem
    }
  }
}
