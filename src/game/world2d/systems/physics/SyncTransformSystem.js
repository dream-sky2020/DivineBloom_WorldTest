import { world } from '@world2d/world'

/**
 * SyncTransformSystem
 * 负责将父实体的 WorldTransform 同步到子实体的 WorldTransform。
 * 
 * 逻辑：
 * 遍历所有具有 Parent 和 Transform 的实体。
 * 如果 Parent 也有 Transform，则：
 * Child.Transform = Parent.Transform + Child.LocalTransform
 */

// 我们查询所有需要被同步的子实体
const childrenWithLocal = world.with('parent', 'transform', 'localTransform');
const childrenWithoutLocal = world.with('parent', 'transform').without('localTransform');

export const SyncTransformSystem = {
  update() {
    // 1. 处理带有 LocalTransform 的子实体
    for (const entity of childrenWithLocal) {
      const parent = entity.parent.entity;
      if (parent && parent.transform) {
        const parentTrans = parent.transform;
        const localTrans = entity.localTransform;
        
        // 简单的坐标相加 (如果不考虑旋转嵌套)
        entity.transform.x = parentTrans.x + localTrans.x;
        entity.transform.y = parentTrans.y + localTrans.y;
        
        // 如果有旋转同步需求
        if (entity.transform.rotation !== undefined) {
            entity.transform.rotation = (parentTrans.rotation || 0) + localTrans.rotation;
        }
      }
    }

    // 2. 处理没有 LocalTransform 的子实体 (直接跟随父实体，或使用 Shape 的 offset)
    for (const entity of childrenWithoutLocal) {
        const parent = entity.parent.entity;
        if (parent && parent.transform) {
          // 如果没有 LocalTransform，但有 Shape，可以尝试同步 Shape 的 offset
          const ox = entity.shape?.offsetX || 0;
          const oy = entity.shape?.offsetY || 0;
          
          entity.transform.x = parent.transform.x + ox;
          entity.transform.y = parent.transform.y + oy;
        }
      }
  }
}
