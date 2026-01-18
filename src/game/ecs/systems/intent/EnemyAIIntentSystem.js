import { world } from '@/game/ecs/world'
import { WanderState } from '@/game/ecs/ECSCalculateTool/states/WanderState'
import { ChaseState } from '@/game/ecs/ECSCalculateTool/states/ChaseState'
import { FleeState } from '@/game/ecs/ECSCalculateTool/states/FleeState'
import { StunnedState } from '@/game/ecs/ECSCalculateTool/states/StunnedState'
import { createLogger } from '@/utils/logger'

const logger = createLogger('EnemyAIIntentSystem')

/**
 * Enemy AI Intent System (Formerly EnemyAISystem)
 * 负责 AI 决策 (Think)
 * 根据感知数据 (aiSensory) 运行状态机，更新状态和意图
 * 
 * Required Components:
 * ... (同前)
 * @property {object} aiSensory (From AISenseSystem & ExternalSenseSystem)
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
    for (const entity of enemyEntities) {
      // Defensive Checks
      if (!entity.aiState) {
        continue;
      }

      const { aiState, aiSensory } = entity

      // --------------------------------------------------------
      // 1. High Priority: React to Battle Results (External Events)
      // --------------------------------------------------------
      if (aiSensory && aiSensory.lastBattleResult) {
        const result = aiSensory.lastBattleResult
        logger.debug(`Processing Battle Result for Entity ${entity.id}:`, result);

        // Clear it immediately so we don't process it twice
        aiSensory.lastBattleResult = null

        if (result.win) {
          // Player Won -> Enemy Defeated
          // For now, simply remove the entity
          logger.info(`Enemy ${entity.id} defeated. Removing.`)
          world.remove(entity)
          continue; // Stop processing this entity
        }
        else if (result.fled) {
          // Player Fled -> Enemy Stunned
          logger.info(`Player fled. Stunning enemy ${entity.id}.`)
          aiState.state = 'stunned'
          aiState.timer = 5 // Stun for 5 seconds
        }
      }

      // --------------------------------------------------------
      // 2. Standard State Machine Update
      // --------------------------------------------------------
      const currentState = STATES[aiState.state]
      if (currentState) {
        try {
          if (typeof currentState.update === 'function') {
            currentState.update(entity, dt)
          }
        } catch (e) {
          logger.error(`Error in AI State '${aiState.state}'`, e);
          aiState.state = 'wander';
        }
      } else {
        // Unknown state fallback
        aiState.state = 'wander';
      }
    }
  }
}
