import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { getWeaponFireDirection } from '@entities/WeaponEntity';
import { worldToScreenXY } from '../../../render/core/CameraTransform';
import { isPointVisible } from '../../../render/core/Culling';
import { DebugPalette } from '../../../render/styles/DebugPalette';
import type { RenderContext } from '../../../render/core/RenderTypes';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

/**
 * Weapon Debug Render System
 * 绘制武器发射方向箭头
 * 层级：调试层 (Layer 115)
 */
export const WeaponDebugRenderSystem: ISystem & { LAYER: number } = {
    name: 'weapon-debug-render',
    executionPolicy: ExecutionPolicy.RunningOnly,
    LAYER: 115,

    draw(renderer: RenderContext) {
        if (!renderer || !renderer.ctx || !renderer.camera) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera;
        const viewW = renderer.width || 0;
        const viewH = renderer.height || 0;
        const cullMargin = 200;
        const viewport = { width: viewW, height: viewH };

        const weaponEntities = world.with('weapon', 'transform');
        for (const entity of weaponEntities) {
            const e = entity as IEntity;
            if (!e.transform) continue;

            if (!isPointVisible(e.transform.x, e.transform.y, camera, viewport, cullMargin)) {
                continue;
            }

            const dir = getWeaponFireDirection(e);
            if (!dir) continue;

            const screenStart = worldToScreenXY(e.transform.x, e.transform.y, camera);
            const startX = screenStart.x;
            const startY = screenStart.y;
            const length = 30;
            const endX = startX + dir.x * length;
            const endY = startY + dir.y * length;

            ctx.save();
            ctx.strokeStyle = DebugPalette.weapon.direction; // 蓝色
            ctx.lineWidth = DebugPalette.weapon.lineWidth;

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
            ctx.fillStyle = DebugPalette.weapon.direction;
            ctx.fill();

            ctx.restore();
        }
    }
};
