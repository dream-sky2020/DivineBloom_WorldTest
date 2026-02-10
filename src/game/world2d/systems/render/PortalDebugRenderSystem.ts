import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * Portal Debug Render System
 * 负责渲染：传送门与其目的地（Entry Point）之间的连接线，并在目的地绘制标记
 * 专注于展现传送的“指向性”
 */
export const PortalDebugRenderSystem: ISystem & {
    LAYER: number;
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

        // 1. 渲染目的地标记 (Circle & Cross)
        this._drawDestinations(ctx, camera);

        // 2. 渲染传送门到目的地的连接线 (Lines)
        this._drawPortalConnections(ctx, camera);
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

            const color = visual?.color || '#8b5cf6';
            const size = visual?.size || 20;

            ctx.save();
            // 绘制目的地标记
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fillStyle = color.replace(')', ', 0.3)').replace('rgb', 'rgba');
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制中心十字
            const cs = size / 3;
            ctx.beginPath();
            ctx.moveTo(x - cs, y); ctx.lineTo(x + cs, y);
            ctx.moveTo(x, y - cs); ctx.lineTo(x, y + cs);
            ctx.stroke();

            // 绘制文字
            ctx.fillStyle = color;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
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
            const debugColor = isTriggered ? 'rgba(239, 68, 68, 0.7)' : 'rgba(168, 85, 247, 0.6)';

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
            ctx.setLineDash([5, 5]);
            ctx.moveTo(sX, sY);
            ctx.lineTo(tX, tY);

            // 优先使用实体自带的 debugColor，否则使用默认紫色
            ctx.strokeStyle = debugColor;
            ctx.lineWidth = 2;
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
