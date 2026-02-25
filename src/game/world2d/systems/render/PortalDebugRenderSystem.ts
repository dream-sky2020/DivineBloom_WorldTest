import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * Portal Debug Render System
 * 负责渲染：传送门与其目的地（Entry Point）之间的连接线，并在目的地绘制标记
 * 专注于展现传送的“指向性”
 */
export const PortalDebugRenderSystem: ISystem & {
    LAYER: number;
    _drawPortalAreas(ctx: any, camera: any): void;
    _drawDestinations(ctx: any, camera: any): void;
    _drawPortalConnections(ctx: any, camera: any): void;
} = {
    name: 'portal-debug-render',
    LAYER: 105,

    init(mapData?: any) {
        // 保留接口
    },

    draw(renderer: any) {
        if (!renderer || !renderer.ctx) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera || { x: 0, y: 0 };

        // 0. 渲染传送区域 (Area)
        this._drawPortalAreas(ctx, camera);

        // 1. 渲染目的地标记 (Circle & Cross)
        this._drawDestinations(ctx, camera);

        // 2. 渲染传送门到目的地的连接线 (Lines)
        this._drawPortalConnections(ctx, camera);
    },

    /**
     * 渲染传送区域（portal sensor shape）
     */
    _drawPortalAreas(ctx: any, camera: any) {
        // 以 portalDetect 为准绘制传送区域，和 PortalDetectSenseSystem 对齐
        const detectors = world.with('portalDetect', 'shape', 'transform');
        for (const entity of detectors) {
            const e = entity as IEntity;
            const { shape, transform } = e;
            if (!shape || !transform) continue;

            const centerX = (transform.x + (shape.offsetX || 0)) - camera.x;
            const centerY = (transform.y + (shape.offsetY || 0)) - camera.y;
            const isTriggered = !!(e.portalDetect?.results && e.portalDetect.results.length > 0);

            ctx.save();
            // 高对比调试色：触发=红，未触发=青，避免紫色系不易分辨
            ctx.strokeStyle = isTriggered ? '#ff1f45' : '#00e5ff';
            ctx.fillStyle = isTriggered ? 'rgba(255, 31, 69, 0.35)' : 'rgba(0, 229, 255, 0.26)';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);

            // AABB / OBB
            if (shape.width != null && shape.height != null) {
                const w = Number(shape.width || 0);
                const h = Number(shape.height || 0);
                const rotation = Number(shape.rotation || 0);

                ctx.translate(centerX, centerY);
                if (rotation) ctx.rotate(rotation);
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.strokeRect(-w / 2, -h / 2, w, h);
            } else {
                // Circle / fallback
                const radius = Number(shape.radius || 20);
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            // 中心十字辅助定位
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY);
            ctx.lineTo(centerX + 8, centerY);
            ctx.moveTo(centerX, centerY - 8);
            ctx.lineTo(centerX, centerY + 8);
            ctx.stroke();

            ctx.restore();
        }
    },

    /**
     * 渲染所有目的地实体标记
     */
    _drawDestinations(ctx: any, camera: any) {
        // 查询所有目的地实体
        const destinations = world.with('destinationId', 'transform');
        for (const dest of destinations) {
            const e = dest as IEntity;
            const { transform, visual, destinationId, name } = e;
            if (!transform) continue;

            const x = transform.x - camera.x;
            const y = transform.y - camera.y;

            // 目的地统一高亮黄，优先可读性；不再受原 visual 偏紫配色影响
            const color = '#ffd400';
            const size = visual?.size || 20;

            ctx.save();
            // 绘制目的地标记
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 212, 0, 0.32)';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // 绘制中心十字
            const cs = size / 3;
            ctx.beginPath();
            ctx.moveTo(x - cs, y); ctx.lineTo(x + cs, y);
            ctx.moveTo(x, y - cs); ctx.lineTo(x, y + cs);
            ctx.stroke();

            // 绘制文字
            // 黑边+黄字，亮背景下也清晰
            ctx.strokeStyle = '#111111';
            ctx.lineWidth = 3;
            ctx.fillStyle = color;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.strokeText(name || destinationId, x, y + size / 2 + 15);
            ctx.fillText(name || destinationId, x, y + size / 2 + 15);
            ctx.restore();
        }
    },

    /**
     * 渲染从传送门到其目的地的连接线
     */
    _drawPortalConnections(ctx: any, camera: any) {
        // 查询所有带有 Portal 数据和位置的实体（新结构下通常是 sensor 子节点）
        const portals = world.with('portal', 'transform');
        // 查询所有目的地实体，用于连接线终点查找
        const destinations = world.with('destinationId', 'transform');
        const destList = [...destinations];

        for (const entity of portals) {
            const e = entity as IEntity;
            const { portal, transform } = e;
            if (!portal || !transform) continue;
            const { mapId, destinationId, targetX, targetY } = portal;

            // 仅渲染同地图传送的连线
            if (mapId != null) continue;

            // 1. 确定起点（传送门中心）
            // 新结构下 portal 在 sensor 上，直接用当前实体坐标
            const startX = transform.x;
            const startY = transform.y;
            const isTriggered = !!(e.portalDetect?.results && e.portalDetect.results.length > 0);
            // 连接线：触发中=红，destinationId=绿，坐标传送=橙
            const debugColor = isTriggered
                ? '#ff1f45'
                : (destinationId != null ? '#22c55e' : '#ff8a00');

            // 2. 确定终点
            let destX: number | undefined;
            let destY: number | undefined;

            if (destinationId != null) {
                const destEntity = destList.find(d => (d as IEntity).destinationId === destinationId) as IEntity | undefined;
                if (destEntity && destEntity.transform) {
                    destX = destEntity.transform.x;
                    destY = destEntity.transform.y;
                }
            } else if (targetX != null && targetY != null) {
                destX = targetX;
                destY = targetY;
            }

            if (destX == null || destY == null) continue;

            // 3. 绘制连接线
            const sX = startX - camera.x, sY = startY - camera.y;
            const tX = destX - camera.x, tY = destY - camera.y;

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([8, 4]);
            ctx.moveTo(sX, sY);
            ctx.lineTo(tX, tY);

            // 优先使用实体自带的 debugColor，否则使用默认紫色
            ctx.strokeStyle = debugColor;
            ctx.lineWidth = 3;
            ctx.stroke();

            // 4. 如果是旧式坐标传送，在终点画个 X
            if (!destinationId) {
                const xs = 10;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(tX - xs, tY - xs); ctx.lineTo(tX + xs, tY + xs);
                ctx.moveTo(tX + xs, tY - xs); ctx.lineTo(tX - xs, tY + xs);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
};
