import { world } from '@world2d/world'
import { createLogger } from '@/utils/logger'
import { CollisionUtils } from '@world2d/ECSCalculateTool/CollisionUtils'
import { ShapeType } from '@world2d/definitions/enums/Shape'

const logger = createLogger('DetectAreaSystem')

/**
 * DetectAreaSystem
 * 负责处理空间感知逻辑
 * 输出: 更新实体上的 detectArea.results
 */
export const DetectAreaSystem = {
  update(dt) {
    // 1. 获取所有具有 DetectArea 的实体
    const detectors = world.with('detectArea', 'position')

    // 2. 获取所有具备被探测资格的实体
    const targets = world.with('detectable', 'position')

    for (const entity of detectors) {
      const detect = entity.detectArea
      detect.results = [] // 重置结果

      // 构造 Detector 的临时 Collider
      // 现在的 DetectArea 结构已与 PhysicsCollider 统一 (扁平化 + type)
      const detectorProxy = {
        position: entity.position,
        collider: {
          type: detect.type,
          radius: detect.radius || 0,
          width: detect.width || 0,
          height: detect.height || 0,
          offsetX: detect.offsetX || 0,
          offsetY: detect.offsetY || 0,
          rotation: detect.rotation || 0,
          p1: detect.p1 || { x: 0, y: 0 },
          p2: detect.p2 || { x: 0, y: 0 },
          layer: 1, // 确保能通过 CollisionUtils 的 mask 检查
          mask: 1
        }
      }

      // 获取探测器要求的目标标签
      const requiredLabels = Array.isArray(detect.target) ? detect.target : [detect.target]
      const requiredSet = new Set([...requiredLabels, ...(detect.includeTags || [])])

      // 遍历潜在目标
      for (const target of targets) {
        if (target === entity) continue // 不探测自己

        const detectable = target.detectable

        // 标签匹配检查
        const hasMatch = detectable.labels.some(label => requiredSet.has(label))

        if (hasMatch) {
          // 排除标签检查
          if (detect.excludeTags && detectable.labels.some(label => detect.excludeTags.includes(label))) {
            continue
          }

          // 构造 Target 的临时 Collider
          // 处理特殊类型 'point' -> 极小圆
          let targetType = detectable.type;
          let targetRadius = detectable.radius || 0;

          if (targetType === 'point') {
            targetType = ShapeType.CIRCLE;
            targetRadius = 0.1;
          }

          const targetProxy = {
            position: target.position,
            collider: {
              type: targetType,
              radius: targetRadius,
              width: detectable.width || 0,
              height: detectable.height || 0,
              offsetX: detectable.offsetX || 0,
              offsetY: detectable.offsetY || 0,
              rotation: 0,
              layer: 1,
              mask: 1
            }
          }

          // 使用 CollisionUtils 进行碰撞/重叠检测
          if (CollisionUtils.checkCollision(detectorProxy, targetProxy)) {
            detect.results.push(target)
          }
        }
      }
    }
  }
}
