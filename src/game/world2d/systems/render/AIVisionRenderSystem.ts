import { world } from '@world2d/world';
// @ts-ignore
import { drawVision } from '@world2d/ECSCalculateTool/ECSSceneGizmosRendererCalculateTool';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * AI Vision Render System
 * 负责渲染：AI 的视野范围 (扇形/圆形/混合)
 * 层级：通常位于角色之下 (Layer 15)
 */
export const AIVisionRenderSystem: ISystem & { LAYER: number } = {
    name: 'ai-vision-render',
    // 定义渲染层级 (Z-Index)
    LAYER: 15,

    draw(renderer: any) {
        if (!renderer || !renderer.ctx || !renderer.camera) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera;
        const viewW = renderer.width || 0;
        const viewH = renderer.height || 0;
        const cullMargin = 200; // 视野范围可能较大，剔除边缘放宽

        const isVisible = (pos: any) => {
            if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
            return !(pos.x < camera.x - cullMargin ||
                pos.x > camera.x + viewW + cullMargin ||
                pos.y < camera.y - cullMargin ||
                pos.y > camera.y + viewH + cullMargin);
        };

        const visionEntities = world.with('transform', 'aiConfig', 'aiState');
        for (const entity of visionEntities) {
            const e = entity as IEntity;
            if (!e.transform || !e.aiConfig || !e.aiState) continue;

            // 剔除屏幕外的
            if (!isVisible(e.transform)) continue;

            // 如果处于晕眩状态，通常不绘制视野，或者视野失效
            // 这里由设计决定，暂时保持原逻辑：晕眩时不画视野
            if (e.aiState.state === 'stunned') continue;

            // 转换世界坐标到屏幕坐标 (Screen Space)
            const screenPos = {
                x: e.transform.x - camera.x,
                y: e.transform.y - camera.y
            };

            // 直接绘制，不依赖 Gizmos 工具类 (为了调试和确保可见性)
            const { visionRadius, visionType, visionAngle, visionProximity } = e.aiConfig;
            const { facing, colorHex, state } = e.aiState;

            const isAlert = state === 'chase';
            const isFleeing = state === 'flee';

            ctx.save();
            ctx.translate(screenPos.x, screenPos.y);

            // 计算角度
            const currentAngle = Math.atan2(facing.y, facing.x);
            ctx.rotate(currentAngle);

            // 设置样式
            // 提高 alpha 值以确保在不同背景下都清晰可见
            if (isAlert) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; // Red (Chase)
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
            } else if (isFleeing) {
                ctx.fillStyle = 'rgba(25, 25, 112, 0.25)'; // Midnight Blue (Flee)
                ctx.strokeStyle = 'rgba(25, 25, 112, 0.7)';
            } else {
                ctx.fillStyle = 'rgba(234, 179, 8, 0.15)'; // Yellow (Default)
                ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
            }
            ctx.lineWidth = 1;

            ctx.beginPath();

            if (visionType === 'circle') {
                ctx.arc(0, 0, visionRadius, 0, Math.PI * 2);
            } else if (visionType === 'cone' || visionType === 'hybrid') {
                const halfAngle = (visionAngle || Math.PI / 2) / 2;
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, visionRadius, -halfAngle, halfAngle);
                ctx.lineTo(0, 0);

                if (visionType === 'hybrid') {
                    // Hybrid circle part
                    const prox = visionProximity || 40;
                    // Just draw another path for proximity
                    ctx.arc(0, 0, prox, 0, Math.PI * 2);
                }
            }

            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
};
