import { world } from '@world2d/world'
import { CollisionUtils } from '@world2d/ECSCalculateTool/CollisionUtils'
import { ShapeType } from '@world2d/definitions/enums/Shape'

/**
 * 自定义碰撞处理系统
 * 负责检测实体间重叠并进行位置修正（Resolution）
 */

// [Updated] 查询条件增加 'shape'
// 现在所有参与碰撞的实体都必须有 transform (由 SyncTransformSystem 保证同步)
const collidableEntities = world.with('collider', 'shape', 'transform');

export const CollisionSystem = {
  // 迭代次数，防止物体在角落抖动
  ITERATIONS: 2,

  /**
   * @param {number} dt 
   * @param {object} [options]
   * @param {object} [options.mapBounds] { width, height }
   */
  update(dt, { mapBounds = null } = {}) {
    for (let n = 0; n < this.ITERATIONS; n++) {
      const entities = [...collidableEntities]

      // 1. 处理实体间的碰撞
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const entityA = entities[i]
          const entityB = entities[j]

          if (!entityA.collider || !entityB.collider) continue
          if (entityA.collider.isStatic && entityB.collider.isStatic) continue

          const shapeA = entityA.shape;
          const shapeB = entityB.shape;

          if (!shapeA || !shapeB) continue;

          // 获取世界位置 (现在直接使用 entity.transform)
          const transformA = entityA.transform;
          const transformB = entityB.transform;

          if (!transformA || !transformB) continue;

          // [Updated] 传入具体的 shape 对象和计算后的 transform
          if (!this._checkBroadphase(transformA, transformB, shapeA, shapeB)) continue

          // [Updated] 构造 Proxy 对象传递给 CollisionUtils
          const proxyA = { transform: transformA, shape: shapeA, collider: entityA.collider };
          const proxyB = { transform: transformB, shape: shapeB, collider: entityB.collider };

          const mtv = CollisionUtils.checkCollision(proxyA, proxyB)
          if (mtv) {
            this._resolveCollision(entityA, entityB, mtv)
          }
        }

        // 2. 处理地图边界碰撞 (仅对非静态物体)
        const entity = entities[i]
        if (mapBounds && entity.collider && !entity.collider.isStatic) {
          const shape = entity.shape;
          const transform = entity.transform;
          
          if (shape && transform) {
            // 注意：resolveMapBounds 会直接修改传入的 transform 对象
            // 如果是子实体，由于它被修正了，我们可能需要反向同步回父实体，或者在这里做特殊处理
            // 简单起见，目前主要支持直接有 Transform 的实体
            CollisionUtils.resolveMapBounds(transform, shape, mapBounds)
          }
        }
      }
    }
  },

  /**
   * 简单的 AABB 粗略检查
   */
  _checkBroadphase(transA, transB, shapeA, shapeB) {
    const margin = 10 // 额外的安全距离

    const sizeA = this._getBroadphaseSize(shapeA) + margin
    const sizeB = this._getBroadphaseSize(shapeB) + margin

    return Math.abs(transA.x - transB.x) < (sizeA + sizeB) / 2 &&
      Math.abs(transA.y - transB.y) < (sizeA + sizeB) / 2
  },

  /**
   * 计算碰撞体的粗略包围盒大小
   */
  _getBroadphaseSize(shape) {
    if (!shape) return 0;
    
    if (shape.type === ShapeType.CAPSULE) {
      // 对于胶囊体，需要考虑线段长度和旋转
      const dx = shape.p2.x - shape.p1.x
      const dy = shape.p2.y - shape.p1.y
      const length = Math.sqrt(dx * dx + dy * dy)

      // 胶囊体的包围盒是线段长度 + 直径
      // 旋转后，使用对角线长度作为安全估计
      const capsuleLength = length + shape.radius * 2
      return capsuleLength
    }

    if (shape.type === ShapeType.CIRCLE || shape.type === ShapeType.POINT) {
      return (shape.radius || (shape.type === ShapeType.POINT ? 0.1 : 0)) * 2
    }

    // 对于 AABB/OBB，如果有旋转，使用对角线长度
    if (shape.type === ShapeType.OBB && shape.rotation) {
      const diagonal = Math.sqrt(shape.width * shape.width + shape.height * shape.height)
      return diagonal
    }

    return Math.max(shape.width || 0, shape.height || 0)
  },

  /**
   * 碰撞解算 (Resolution)
   * @param {Object} entityA - 实体A
   * @param {Object} entityB - 实体B
   * @param {Object} mtv - 最小位移向量 (从 A 指向 B)
   */
  _resolveCollision(entityA, entityB, mtv) {
    // 如果其中一个是触发器 (Trigger)，只处理事件，不产生物理排斥
    if (entityA.collider.isTrigger || entityB.collider.isTrigger) {
      // TODO: 发送碰撞事件，例如 entityA.onTriggerEnter?.(entityB)
      return
    }

    const colA = entityA.collider
    const colB = entityB.collider

    // 获取需要移动的目标 Transform (如果是子实体，我们希望移动它的父实体)
    const transA = entityA.parent?.entity?.transform || entityA.transform;
    const transB = entityB.parent?.entity?.transform || entityB.transform;

    if (!transA || !transB) return;

    if (colA.isStatic) {
      // A 是静态物体，只推开 B（沿 MTV 方向，远离 A）
      transB.x += mtv.x
      transB.y += mtv.y
    } else if (colB.isStatic) {
      // B 是静态物体，只推开 A（沿 MTV 反方向，远离 B）
      transA.x -= mtv.x
      transA.y -= mtv.y
    } else {
      // 两个都是动态物体，各推开一半
      transA.x -= mtv.x * 0.5
      transA.y -= mtv.y * 0.5
      transB.x += mtv.x * 0.5
      transB.y += mtv.y * 0.5
    }
  }
}
