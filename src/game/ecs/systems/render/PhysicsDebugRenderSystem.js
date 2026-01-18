import { world } from '@/game/ecs/world'

/**
 * 物理调试渲染系统
 * 绘制实体的自定义碰撞体形状
 */

const collidableEntities = world.with('position', 'collider')

export const PhysicsDebugRenderSystem = {
  LAYER: 110, // 渲染在最顶层

  draw(renderer) {
    const { ctx, camera } = renderer
    if (!ctx || !camera) return

    ctx.save()

    for (const entity of collidableEntities) {
      const { position, collider } = entity
      const x = position.x + (collider.offsetX || 0) - camera.x
      const y = position.y + (collider.offsetY || 0) - camera.y

      ctx.strokeStyle = collider.isStatic ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 255, 0.8)'
      ctx.fillStyle = collider.isStatic ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)'
      ctx.lineWidth = 1

      ctx.beginPath()

      if (collider.type === 'circle') {
        ctx.arc(x, y, collider.radius, 0, Math.PI * 2)
      }
      else if (collider.type === 'aabb' || collider.type === 'obb') {
        const { width, height, rotation } = collider
        ctx.save()
        ctx.translate(x, y)
        if (rotation) ctx.rotate(rotation)
        ctx.rect(-width / 2, -height / 2, width, height)
        ctx.restore()
      }
      else if (collider.type === 'capsule') {
        const { p1, p2, radius, rotation } = collider

        // 计算线段的长度和角度（在局部坐标系中）
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const angle = Math.atan2(dy, dx)
        const length = Math.sqrt(dx * dx + dy * dy)

        ctx.save()
        ctx.translate(x, y)                 // 1. 移动到实体中心
        if (rotation) ctx.rotate(rotation)  // 2. 应用整体旋转
        ctx.translate(p1.x, p1.y)           // 3. 移动到胶囊起始点（局部坐标）
        ctx.rotate(angle)                   // 4. 旋转到胶囊方向

        ctx.beginPath()
        // 绘制专业、平滑的胶囊体轮廓
        // 左半圆（起点）
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, true)
        ctx.lineTo(length, radius)
        // 右半圆（终点）
        ctx.arc(length, 0, radius, Math.PI / 2, -Math.PI / 2, true)
        ctx.closePath()

        ctx.fill()
        ctx.stroke()
        ctx.restore()
        continue
      }

      ctx.fill()
      ctx.stroke()
    }

    ctx.restore()
  }
}
