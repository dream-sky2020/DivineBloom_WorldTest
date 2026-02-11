import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * Movement System (Physics)
 * 仅处理基础位移计算。
 */
export const MovementSystem: ISystem = {
    name: 'movement',

    update(dt: number) {
        const movingEntities = world.with('transform', 'velocity');

        for (const entity of movingEntities) {
            const e = entity as IEntity;
            if (e.parent?.entity) continue;
            const { transform, velocity } = e;

            if (!transform || !velocity) continue;

            // 基础位移 (Euler integration)
            transform.prevX = transform.x;
            transform.prevY = transform.y;
            transform.x += velocity.x * dt;
            transform.y += velocity.y * dt;
        }
    }
};
