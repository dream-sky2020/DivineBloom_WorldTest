import { world } from '@world2d/world';
import { ShapeType } from '@world2d/definitions/enums/Shape';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * DetectAreaRenderSystem
 * 负责绘制检测区域 (Debug / Editor Mode)
 */
export const DetectAreaRenderSystem: ISystem & { LAYER: number } = {
    name: 'detect-area-render',
    // 定义渲染层级 (Z-Index) - Debug 层通常最高
    LAYER: 100,

    init(mapData?: any) {
        // 保留接口一致性，但不再依赖 mapData 绘制
    },

    draw(renderer: any) {
        // Defensive check
        if (!renderer || !renderer.ctx) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera || { x: 0, y: 0 };
        const detectors = world.with('detectArea', 'shape');

        for (const entity of detectors) {
            const e = entity as IEntity;
            // Defensive Check
            const { detectArea, shape, transform } = e;
            if (!detectArea || !shape || !transform) continue;

            // 计算中心点 (加上偏移) - 并转换为屏幕坐标
            // [UPDATED] 从 shape 获取偏移
            const centerX = (transform.x + (shape.offsetX || 0)) - camera.x;
            const centerY = (transform.y + (shape.offsetY || 0)) - camera.y;

            // 设置绘制样式
            // 根据是否有检测结果改变颜色 (如果有 detected result 则变红，否则保持默认)
            const isTriggered = detectArea.results && Array.isArray(detectArea.results) && detectArea.results.length > 0;

            if (isTriggered) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // red-500
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            } else if (detectArea.debugColor) {
                // 优先使用组件定义的调试颜色
                ctx.strokeStyle = detectArea.debugColor;
                // 自动处理填充色透明度
                ctx.fillStyle = detectArea.debugColor.replace(/[\d.]+\)$/g, '0.1)');
            } else {
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)'; // cyan-400
                ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
            }

            ctx.lineWidth = 1;

            // [UPDATED] 从 shape 获取几何信息
            if (shape.type === ShapeType.CIRCLE || shape.type === ShapeType.POINT) {
                const radius = shape.radius || (shape.type === ShapeType.POINT ? 0.1 : 0);

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            else if (shape.type === ShapeType.AABB || shape.type === ShapeType.OBB) {
                const w = shape.width || 0;
                const h = shape.height || 0;
                const rotation = shape.rotation || 0;

                // AABB/OBB 绘制
                ctx.save();
                ctx.translate(centerX, centerY);
                if (rotation) ctx.rotate(rotation);

                // 绘制矩形 (中心对齐)
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.strokeRect(-w / 2, -h / 2, w, h);

                ctx.restore();
            }
            else if (shape.type === ShapeType.CAPSULE) {
                const { p1, p2, radius, rotation } = shape;
                if (!p1 || !p2) return;

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                ctx.save();
                ctx.translate(centerX, centerY);
                if (rotation) ctx.rotate(rotation);

                // 移动到胶囊起点
                ctx.translate(p1.x, p1.y);
                ctx.rotate(angle);

                ctx.beginPath();
                // 左半圆
                ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, true);
                // 上边线
                ctx.lineTo(length, radius);
                // 右半圆
                ctx.arc(length, 0, radius, Math.PI / 2, -Math.PI / 2, true);
                // 下边线闭合
                ctx.closePath();

                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
        }
    }
};
