import { world } from '@world2d/world';
import { WanderState } from '@world2d/ECSCalculateTool/states/WanderState';
import { ChaseState } from '@world2d/ECSCalculateTool/states/ChaseState';
import { FleeState } from '@world2d/ECSCalculateTool/states/FleeState';
import { StunnedState } from '@world2d/ECSCalculateTool/states/StunnedState';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { EnemyAIIntent } from '@components';

const logger = createLogger('EnemyAIIntentSystem');

// State Map
const STATES: Record<string, any> = {
    'wander': WanderState,
    'chase': ChaseState,
    'flee': FleeState,
    'stunned': StunnedState
};

/**
 * Enemy AI Intent System
 * 负责 AI 决策 (Think)
 */
export const EnemyAIIntentSystem: ISystem = {
    name: 'enemy-ai-intent',

    update(dt: number) {
        const enemyEntities = world.with('enemy', 'transform', 'velocity', 'aiState', 'aiConfig');
        for (const entity of enemyEntities) {
            const e = entity as IEntity;
            // Defensive Checks
            if (!e.aiState) {
                continue;
            }

            const { aiState, aiSensory } = e;
            if (!e.enemyAIIntent) {
                world.addComponent(e, 'enemyAIIntent', EnemyAIIntent.create({
                    state: aiState.state,
                    action: aiState.state === 'stunned' ? 'stunned' : 'move',
                    targetPos: aiState.targetPos ?? null,
                    suspicion: aiState.suspicion ?? 0,
                    hasBattleResult: !!aiSensory?.lastBattleResult
                }));
            }

            // --------------------------------------------------------
            // 1. High Priority: React to Battle Results (External Events)
            // --------------------------------------------------------
            if (aiSensory && aiSensory.lastBattleResult) {
                const result = aiSensory.lastBattleResult;
                logger.debug(`Processing Battle Result for Entity ${e.id}:`, result);

                // Clear it immediately so we don't process it twice
                aiSensory.lastBattleResult = null;

                if (result.win) {
                    // Player Won -> Enemy Defeated
                    logger.info(`Enemy ${e.id} defeated. Removing.`);
                    world.remove(e);
                    continue; // Stop processing this entity
                }
                else if (result.fled) {
                    // Player Fled -> Enemy Stunned
                    logger.info(`Player fled. Stunning enemy ${e.id}.`);
                    aiState.state = 'stunned';
                    aiState.timer = e.aiConfig?.stunDuration || 5; // 使用配置的持续时间
                }
            }

            // --------------------------------------------------------
            // 2. Standard State Machine Update
            // --------------------------------------------------------
            const currentState = STATES[aiState.state];
            if (currentState) {
                try {
                    if (typeof currentState.update === 'function') {
                        currentState.update(e, dt);
                    }
                } catch (error) {
                    logger.error(`Error in AI State '${aiState.state}'`, error);
                    aiState.state = 'wander';
                }
            } else {
                // Unknown state fallback
                aiState.state = 'wander';
            }

            if (e.enemyAIIntent) {
                e.enemyAIIntent.state = aiState.state;
                e.enemyAIIntent.action = aiState.state === 'stunned' ? 'stunned' : 'move';
                e.enemyAIIntent.targetPos = aiState.targetPos ?? null;
                e.enemyAIIntent.suspicion = aiState.suspicion ?? 0;
                e.enemyAIIntent.hasBattleResult = !!aiSensory?.lastBattleResult;
            }
        }
    }
};
