import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * SyncTransformSystem
 * 负责将父实体的 WorldTransform 同步到子实体的 WorldTransform。
 */
export const SyncTransformSystem: ISystem = {
    name: 'sync-transform',

    update() {
        // 1. 处理带有 LocalTransform 的子实体
        const childrenWithLocal = world.with('parent', 'transform', 'localTransform');
        for (const entity of childrenWithLocal) {
            const e = entity as IEntity;
            const parent = e.parent.entity;
            if (parent && parent.transform) {
                const parentTrans = parent.transform;
                const localTrans = e.localTransform;

                // 简单的坐标相加 (如果不考虑旋转嵌套)
                e.transform.prevX = e.transform.x;
                e.transform.prevY = e.transform.y;
                e.transform.x = parentTrans.x + localTrans.x;
                e.transform.y = parentTrans.y + localTrans.y;

                // 如果有旋转同步需求
                if (e.transform.rotation !== undefined) {
                    e.transform.rotation = (parentTrans.rotation || 0) + localTrans.rotation;
                }
            }
        }

        // 2. 处理没有 LocalTransform 的子实体 (直接跟随父实体，或使用 Shape 的 offset)
        const childrenWithoutLocal = world.with('parent', 'transform').without('localTransform');
        for (const entity of childrenWithoutLocal) {
            const e = entity as IEntity;
            const parent = e.parent.entity;
            if (parent && parent.transform) {
                // 如果没有 LocalTransform，但有 Shape，可以尝试同步 Shape 的 offset
                const ox = e.shape?.offsetX || 0;
                const oy = e.shape?.offsetY || 0;

                e.transform.prevX = e.transform.x;
                e.transform.prevY = e.transform.y;
                e.transform.x = parent.transform.x + ox;
                e.transform.y = parent.transform.y + oy;
            }
        }
    }
};
