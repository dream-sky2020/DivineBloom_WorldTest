import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * Player Control System
 * 负责将玩家意图 (PlayerIntent) 转换为物理速度 (Velocity)
 */
export const PlayerControlSystem: ISystem = {
    name: 'player-control',

    update(dt: number) {
        const controlEntities = world.with('playerIntent', 'velocity');
        for (const entity of controlEntities) {
            const e = entity as IEntity;
            // Defensive checks
            if (!e.playerIntent) {
                console.warn(`[PlayerControlSystem] Entity ${e.id || 'N/A'} missing playerIntent!`);
                continue;
            }
            if (!e.velocity) {
                console.error(`[PlayerControlSystem] Entity ${e.id || 'N/A'} missing velocity!`);
                continue;
            }

            const { move, wantsToRun } = e.playerIntent;

            // Defensive check for move object
            if (!move || typeof move.x !== 'number' || typeof move.y !== 'number') {
                console.error(`[PlayerControlSystem] Invalid move intent for Entity ${e.id || 'N/A'}:`, move);
                e.velocity.x = 0;
                e.velocity.y = 0;
                continue;
            }

            const speed = (e as any).speed || 200;
            const fastSpeed = (e as any).fastSpeed || 320;

            const currentSpeed = wantsToRun ? fastSpeed : speed;

            // Apply velocity directly from intent
            e.velocity.x = move.x * currentSpeed;
            e.velocity.y = move.y * currentSpeed;
        }
    }
};
