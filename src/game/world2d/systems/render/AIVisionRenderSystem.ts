import { world } from '@world2d/runtime/WorldEcsRuntime';
// @ts-ignore
import { drawVision } from '@world2d/ECSCalculateTool/ECSSceneGizmosRendererCalculateTool';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

type VisionStyleKey = 'chase' | 'flee' | 'default';

type VisionStyle = {
    fillColor: string;
    fillAlpha: number;
    strokeStyle: string;
    strokeWidth: number;
};

type VisionDrawItem = {
    x: number;
    y: number;
    facingX: number;
    facingY: number;
    visionRadius: number;
    visionType: string;
    visionAngle: number;
    visionProximity: number;
};

const VISION_STYLES: Record<VisionStyleKey, VisionStyle> = {
    chase: {
        fillColor: 'rgb(239, 68, 68)',
        fillAlpha: 0.25,
        strokeStyle: 'rgba(239, 68, 68, 0.95)',
        strokeWidth: 2
    },
    flee: {
        fillColor: 'rgb(25, 25, 112)',
        fillAlpha: 0.25,
        strokeStyle: 'rgba(25, 25, 112, 0.95)',
        strokeWidth: 2
    },
    default: {
        fillColor: 'rgb(234, 179, 8)',
        fillAlpha: 0.15,
        strokeStyle: 'rgba(234, 179, 8, 0.9)',
        strokeWidth: 2
    }
};

const layerCanvasMap = new Map<VisionStyleKey, HTMLCanvasElement>();

function ensureLayerCanvas(key: VisionStyleKey, width: number, height: number): CanvasRenderingContext2D | null {
    let canvas = layerCanvasMap.get(key);
    if (!canvas) {
        canvas = document.createElement('canvas');
        layerCanvasMap.set(key, canvas);
    }

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, width, height);
    return ctx;
}

function drawVisionPath(
    ctx: CanvasRenderingContext2D,
    visionType: string,
    visionRadius: number,
    visionAngle: number,
    visionProximity: number
) {
    ctx.beginPath();

    if (visionType === 'circle') {
        ctx.arc(0, 0, visionRadius, 0, Math.PI * 2);
        return;
    }

    if (visionType === 'cone' || visionType === 'hybrid') {
        const halfAngle = (visionAngle || Math.PI / 2) / 2;
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, visionRadius, -halfAngle, halfAngle);
        ctx.lineTo(0, 0);
        ctx.closePath();

        if (visionType === 'hybrid') {
            const prox = visionProximity || 40;
            ctx.moveTo(prox, 0);
            ctx.arc(0, 0, prox, 0, Math.PI * 2);
        }
        return;
    }

    // Fallback: keep unknown vision types visible.
    ctx.arc(0, 0, visionRadius, 0, Math.PI * 2);
}

/**
 * AI Vision Render System
 * 负责渲染：AI 的视野范围 (扇形/圆形/混合)
 * 层级：通常位于角色之下 (Layer 15)
 */
export const AIVisionRenderSystem: ISystem & { LAYER: number } = {
    name: 'ai-vision-render',
    executionPolicy: ExecutionPolicy.RunningOnly,
    // 定义渲染层级 (Z-Index)
    LAYER: 15,

    draw(renderer: any) {
        if (!renderer || !renderer.ctx || !renderer.camera) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera;
        const viewW = renderer.width || 0;
        const viewH = renderer.height || 0;
        const cullMargin = 200; // 视野范围可能较大，剔除边缘放宽

        const groupedDrawItems: Record<VisionStyleKey, VisionDrawItem[]> = {
            chase: [],
            flee: [],
            default: []
        };

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
            if (e.aiConfig.hideVisionRender) continue;

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

            const { visionRadius, visionType, visionAngle, visionProximity } = e.aiConfig;
            const { facing, state } = e.aiState;

            const isAlert = state === 'chase';
            const isFleeing = state === 'flee';
            const styleKey: VisionStyleKey = isAlert ? 'chase' : (isFleeing ? 'flee' : 'default');

            groupedDrawItems[styleKey].push({
                x: screenPos.x,
                y: screenPos.y,
                facingX: facing.x,
                facingY: facing.y,
                visionRadius,
                visionType,
                visionAngle,
                visionProximity
            });
        }

        // 1) 先按颜色把填充并集到离屏层，再一次性贴回主画布，避免同色 alpha 叠加变深。
        for (const key of Object.keys(groupedDrawItems) as VisionStyleKey[]) {
            const items = groupedDrawItems[key];
            if (items.length === 0) continue;

            const style = VISION_STYLES[key];
            const layerCtx = ensureLayerCanvas(key, viewW, viewH);
            const layerCanvas = layerCanvasMap.get(key);
            if (!layerCtx || !layerCanvas) continue;

            layerCtx.fillStyle = style.fillColor;
            for (const item of items) {
                layerCtx.save();
                layerCtx.translate(item.x, item.y);
                layerCtx.rotate(Math.atan2(item.facingY, item.facingX));
                drawVisionPath(layerCtx, item.visionType, item.visionRadius, item.visionAngle, item.visionProximity);
                layerCtx.fill();
                layerCtx.restore();
            }

            ctx.save();
            ctx.globalAlpha = style.fillAlpha;
            ctx.drawImage(layerCanvas, 0, 0);
            ctx.restore();
        }

        // 2) 轮廓线逐个绘制，强化边界与方向感。
        for (const key of Object.keys(groupedDrawItems) as VisionStyleKey[]) {
            const items = groupedDrawItems[key];
            if (items.length === 0) continue;

            const style = VISION_STYLES[key];
            ctx.save();
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineWidth = style.strokeWidth;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            for (const item of items) {
                ctx.save();
                // Align to half-pixel to reduce thin-line blur on many cameras/zooms.
                const alignedX = Math.round(item.x) + 0.5;
                const alignedY = Math.round(item.y) + 0.5;
                ctx.translate(alignedX, alignedY);
                ctx.rotate(Math.atan2(item.facingY, item.facingX));
                drawVisionPath(ctx, item.visionType, item.visionRadius, item.visionAngle, item.visionProximity);
                ctx.stroke();
                ctx.restore();
            }

            ctx.restore();
        }
    }
};
