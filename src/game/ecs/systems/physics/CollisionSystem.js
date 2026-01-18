import { world } from '@/game/ecs/world'
import { CollisionUtils } from '@/utils/CollisionUtils'

/**
 * 自定义碰撞处理系统
 * 负责检测实体间重叠并进行位置修正（Resolution）
 */

const collidableEntities = world.with('position', 'collider')

export const CollisionSystem = {
  // 迭代次数，防止物体在角落抖动
  ITERATIONS: 2,

  update() {
    for (let n = 0; n < this.ITERATIONS; n++) {
      const entities = [...collidableEntities]

      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const entityA = entities[i]
          const entityB = entities[j]

          // 🎯 修复：增加防御性检查，防止 collider 存在但为 null 的情况
          if (!entityA.collider || !entityB.collider) continue

          if (entityA.collider.isStatic && entityB.collider.isStatic) continue

          // 1. Broadphase: 简单的 AABB 距离检查 (初步过滤)
          if (!this._checkBroadphase(entityA, entityB)) continue

          // 2. Narrowphase: 精确碰撞检测
          const mtv = CollisionUtils.checkCollision(entityA, entityB)

          if (mtv) {
            this._resolveCollision(entityA, entityB, mtv)
          }
        }
      }
    }
  },

  /**
   * 简单的 AABB 粗略检查
   */
  _checkBroadphase(a, b) {
    const colA = a.collider
    const colB = b.collider
    const margin = 10 // 额外的安全距离

    const sizeA = this._getBroadphaseSize(colA) + margin
    const sizeB = this._getBroadphaseSize(colB) + margin

    return Math.abs(a.position.x - b.position.x) < (sizeA + sizeB) / 2 &&
      Math.abs(a.position.y - b.position.y) < (sizeA + sizeB) / 2
  },

  /**
   * 计算碰撞体的粗略包围盒大小
   */
  _getBroadphaseSize(collider) {
    if (collider.type === 'capsule') {
      // 对于胶囊体，需要考虑线段长度和旋转
      const dx = collider.p2.x - collider.p1.x
      const dy = collider.p2.y - collider.p1.y
      const length = Math.sqrt(dx * dx + dy * dy)

      // 胶囊体的包围盒是线段长度 + 直径
      // 旋转后，使用对角线长度作为安全估计
      const capsuleLength = length + collider.radius * 2
      return capsuleLength
    }

    if (collider.type === 'circle') {
      return collider.radius * 2
    }

    // 对于 AABB/OBB，如果有旋转，使用对角线长度
    if (collider.type === 'obb' && collider.rotation) {
      const diagonal = Math.sqrt(collider.width * collider.width + collider.height * collider.height)
      return diagonal
    }

    return Math.max(collider.width || 0, collider.height || 0)
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

    if (colA.isStatic) {
      // A 是静态物体，只推开 B（沿 MTV 方向，远离 A）
      entityB.position.x += mtv.x
      entityB.position.y += mtv.y
    } else if (colB.isStatic) {
      // B 是静态物体，只推开 A（沿 MTV 反方向，远离 B）
      // 注意：MTV 是从 A 指向 B 的，所以 A -= MTV 会让 A 远离 B
      entityA.position.x -= mtv.x
      entityA.position.y -= mtv.y
    } else {
      // 两个都是动态物体，各推开一半
      entityA.position.x -= mtv.x * 0.5
      entityA.position.y -= mtv.y * 0.5
      entityB.position.x += mtv.x * 0.5
      entityB.position.y += mtv.y * 0.5
    }
  }
}
