import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * Movement System (Physics)
 * 整合了位移计算与边界约束。
 */
export const MovementSystem: ISystem = {
    name: 'movement',

    update(dt: number, _callbacks?: any, context: { mapBounds?: { width: number, height: number } | null } = {}) {
        const movingEntities = world.with('transform', 'velocity');
        const mapBounds = context.mapBounds;

        for (const entity of movingEntities) {
            const e = entity as IEntity;
            const { transform, velocity, bounds } = e;

            if (!transform || !velocity) continue;

            // 1. 基础位移 (Euler integration)
            transform.x += velocity.x * dt;
            transform.y += velocity.y * dt;

            // 2. 实体自带的 bounds 组件约束
            if (bounds) {
                const { minX, maxX, minY, maxY } = bounds;
                if (transform.x < minX) transform.x = minX;
                else if (transform.x > maxX) transform.x = maxX;
                if (transform.y < minY) transform.y = minY;
                else if (transform.y > maxY) transform.y = maxY;
            }

            // 3. 地图全局边界约束
            if (mapBounds) {
                if (transform.x < 0) transform.x = 0;
                else if (transform.x > mapBounds.width) transform.x = mapBounds.width;
                if (transform.y < 0) transform.y = 0;
                else if (transform.y > mapBounds.height) transform.y = mapBounds.height;
            }
        }
    }
};
