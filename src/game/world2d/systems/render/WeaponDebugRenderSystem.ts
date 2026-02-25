import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { getWeaponFireDirection } from '@entities/WeaponEntity';

/**
 * Weapon Debug Render System
 * 绘制武器发射方向箭头
 * 层级：调试层 (Layer 115)
 */
export const WeaponDebugRenderSystem: ISystem & { LAYER: number } = {
    name: 'weapon-debug-render',
    LAYER: 115,

    draw(renderer: any) {
        if (!renderer || !renderer.ctx || !renderer.camera) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera;
        const viewW = renderer.width || 0;
        const viewH = renderer.height || 0;
        const cullMargin = 200;

        const weaponEntities = world.with('weapon', 'transform');
        for (const entity of weaponEntities) {
            const e = entity as IEntity;
            if (!e.transform) continue;

            if (e.transform.x < camera.x - cullMargin ||
                e.transform.x > camera.x + viewW + cullMargin ||
                e.transform.y < camera.y - cullMargin ||
                e.transform.y > camera.y + viewH + cullMargin) {
                continue;
            }

            const dir = getWeaponFireDirection(e);
            if (!dir) continue;

            const startX = e.transform.x - camera.x;
            const startY = e.transform.y - camera.y;
            const length = 30;
            const endX = startX + dir.x * length;
            const endY = startY + dir.y * length;

            ctx.save();
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // 蓝色
            ctx.lineWidth = 2;

            // 主线
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // 箭头
            const headLen = 8;
            const angle = Math.atan2(dir.y, dir.x);
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
            ctx.lineTo(endX, endY);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.fill();

            ctx.restore();
        }
    }
};
