import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import type { SystemContextBase } from '@definitions/interface/SystemContext';

/**
 * BoundSystem
 * 只处理具备 bounds + transform 的实体边界约束。
 */
export const BoundSystem: ISystem<SystemContextBase> = {
    name: 'bound',

    update(_dt: number, context: SystemContextBase = {}) {
        const boundedEntities = world.with('bounds', 'transform');
        const mapBounds = context.mapBounds;

        for (const entity of boundedEntities) {
            const e = entity as IEntity;
            if (e.parent?.entity) continue;

            const bounds = e.bounds;
            const transform = e.transform;
            if (!bounds || !transform) continue;

            const { minX, maxX, minY, maxY } = bounds;
            if (transform.x < minX) transform.x = minX;
            else if (transform.x > maxX) transform.x = maxX;

            if (transform.y < minY) transform.y = minY;
            else if (transform.y > maxY) transform.y = maxY;

            if (bounds.useMapBounds && mapBounds) {
                if (transform.x < 0) transform.x = 0;
                else if (transform.x > mapBounds.width) transform.x = mapBounds.width;

                if (transform.y < 0) transform.y = 0;
                else if (transform.y > mapBounds.height) transform.y = mapBounds.height;
            }
        }
    }
};
