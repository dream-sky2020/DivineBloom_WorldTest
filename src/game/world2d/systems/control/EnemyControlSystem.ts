import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { createLogger } from '@/utils/logger';

const logger = createLogger('EnemyControlSystem');

/**
 * Enemy Control System
 * 负责将 AI 意图 (aiState.moveDir) 转换为物理速度 (Velocity)
 * 同时也负责更新朝向 (Facing)
 */
export const EnemyControlSystem: ISystem = {
    name: 'enemy-control',

    update(dt: number) {
        const controlEntities = world.with('enemy', 'velocity', 'aiState', 'aiConfig');
        for (const entity of controlEntities) {
            const e = entity as IEntity;
            // Defensive Checks
            if (!e.aiState) {
                logger.error(`[EnemyControlSystem] Entity ${e.id || 'N/A'} missing aiState!`);
                continue;
            }
            if (!e.aiConfig) {
                logger.error(`[EnemyControlSystem] Entity ${e.id || 'N/A'} missing aiConfig!`);
                continue;
            }
            if (!e.velocity) {
                logger.error(`[EnemyControlSystem] Entity ${e.id || 'N/A'} missing velocity!`);
                continue;
            }

            const { aiState, aiConfig, velocity } = e;

            const moveDir = aiState.moveDir;

            // Validate moveDir
            if (!moveDir || typeof moveDir.x !== 'number' || typeof moveDir.y !== 'number') {
                logger.warn(`[EnemyControlSystem] Invalid moveDir for Entity ${e.id || 'N/A'}:`, moveDir);
                // Fail safe: stop moving
                velocity.x = 0;
                velocity.y = 0;
                continue;
            }

            const speed = aiConfig.speed || 0;

            // Update Facing
            const lenSq = moveDir.x * moveDir.x + moveDir.y * moveDir.y;
            if (lenSq > 0.001) {
                const len = Math.sqrt(lenSq);

                // Defensive: ensure aiState has facing object
                if (!aiState.facing) aiState.facing = { x: 1, y: 0 };

                aiState.facing.x = moveDir.x / len;
                aiState.facing.y = moveDir.y / len;
            }

            // Sync to Velocity
            velocity.x = moveDir.x * speed;
            velocity.y = moveDir.y * speed;
        }
    }
};
