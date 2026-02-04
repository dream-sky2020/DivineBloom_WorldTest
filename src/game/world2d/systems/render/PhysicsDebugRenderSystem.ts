import { world } from '@world2d/world';
import { ShapeType } from '@world2d/definitions/enums/Shape';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * 物理调试渲染系统
 * 绘制实体的自定义碰撞体形状
 */
export const PhysicsDebugRenderSystem: ISystem & { LAYER: number } = {
    name: 'physics-debug-render',
    LAYER: 110, // 渲染在最顶层

    draw(renderer: any) {
        const { ctx, camera } = renderer;
        if (!ctx || !camera) return;

        // [Updated] 现在主要基于 shape 进行渲染，collider 用于样式
        // 仅渲染具有 collider 的实体，这符合“物理调试”的本意
        const collidableEntities = world.with('transform', 'shape', 'collider');

        ctx.save();

        for (const entity of collidableEntities) {
            const e = entity as IEntity;
            const { transform, shape, collider } = e;

            if (!transform || !shape || !collider) continue;

            // 计算世界坐标 (使用 shape.offsetX/Y)
            const x = transform.x + (shape.offsetX || 0) - camera.x;
            const y = transform.y + (shape.offsetY || 0) - camera.y;

            // 样式设置: 红色表示静态，青色表示动态
            ctx.strokeStyle = collider.isStatic ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 255, 0.8)';
            ctx.fillStyle = collider.isStatic ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)';

            ctx.lineWidth = 1;

            ctx.beginPath();

            if (shape.type === ShapeType.CIRCLE) {
                ctx.arc(x, y, shape.radius, 0, Math.PI * 2);
            }
            else if (shape.type === ShapeType.AABB || shape.type === ShapeType.OBB) {
                const { width, height, rotation } = shape;
                ctx.save();
                ctx.translate(x, y);
                if (rotation) ctx.rotate(rotation);
                ctx.rect(-width / 2, -height / 2, width, height);
                ctx.restore();
            }
            else if (shape.type === ShapeType.CAPSULE) {
                const { p1, p2, radius, rotation } = shape;

                if (p1 && p2) {
                    // 计算线段的长度和角度（在局部坐标系中）
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const angle = Math.atan2(dy, dx);
                    const length = Math.sqrt(dx * dx + dy * dy);

                    ctx.save();
                    ctx.translate(x, y);                 // 1. 移动到中心偏移点
                    if (rotation) ctx.rotate(rotation);  // 2. 应用整体旋转
                    ctx.translate(p1.x, p1.y);           // 3. 移动到胶囊起始点（局部坐标）
                    ctx.rotate(angle);                   // 4. 旋转到胶囊方向

                    ctx.beginPath();
                    // 绘制专业、平滑的胶囊体轮廓
                    // 左半圆（起点）
                    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, true);
                    ctx.lineTo(length, radius);
                    // 右半圆（终点）
                    ctx.arc(length, 0, radius, Math.PI / 2, -Math.PI / 2, true);
                    ctx.closePath();

                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                    continue;
                }
            }

            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
};
