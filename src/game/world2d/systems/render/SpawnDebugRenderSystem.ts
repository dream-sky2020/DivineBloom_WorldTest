import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

type XY = { x: number; y: number };

function toNumber(value: any, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function getSelfPosition(entity: any): XY {
    return {
        x: toNumber(entity?.transform?.x, 0),
        y: toNumber(entity?.transform?.y, 0)
    };
}

function getTargetPosition(entity: any, fallback: XY): XY {
    const candidates = [
        entity?.motion?.runtime?.targetPos,
        entity?.aiState?.targetPos,
        entity?.targetPos,
        entity?.target?.transform
    ];

    for (const pos of candidates) {
        if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
            return { x: Number(pos.x), y: Number(pos.y) };
        }
    }

    return fallback;
}

/**
 * Spawn Debug Render System
 * 可视化 Spawn 组件的生成区域，便于调试与编辑。
 */
export const SpawnDebugRenderSystem: ISystem & { LAYER: number } = {
    name: 'spawn-debug-render',
    LAYER: 104,

    draw(renderer: any) {
        if (!renderer || !renderer.ctx) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera || { x: 0, y: 0 };
        const entities = world.with('spawn', 'transform');

        for (const entity of entities) {
            const e = entity as IEntity;
            if (!e.spawn || !e.transform) continue;

            const spawn = e.spawn;
            const selfPos = getSelfPosition(e);
            const mode = String(spawn?.spawnPosition?.mode || 'self');
            const offsetX = toNumber(spawn?.spawnPosition?.offsetX, 0);
            const offsetY = toNumber(spawn?.spawnPosition?.offsetY, 0);
            const center =
                mode === 'offset'
                    ? { x: selfPos.x + offsetX, y: selfPos.y + offsetY }
                    : mode === 'target'
                        ? getTargetPosition(e, selfPos)
                        : selfPos;

            const sx = center.x - camera.x;
            const sy = center.y - camera.y;

            ctx.save();
            ctx.strokeStyle = spawn.enabled ? 'rgba(34, 197, 94, 0.9)' : 'rgba(107, 114, 128, 0.9)';
            ctx.fillStyle = spawn.enabled ? 'rgba(34, 197, 94, 0.18)' : 'rgba(107, 114, 128, 0.16)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);

            if (mode === 'randomRadius') {
                const radius = Math.max(0, toNumber(spawn?.spawnPosition?.radius, 120));
                ctx.beginPath();
                ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else if (mode === 'randomRect') {
                const width = Math.max(0, toNumber(spawn?.spawnPosition?.rectWidth, 240));
                const height = Math.max(0, toNumber(spawn?.spawnPosition?.rectHeight, 160));
                ctx.fillRect(sx - width / 2, sy - height / 2, width, height);
                ctx.strokeRect(sx - width / 2, sy - height / 2, width, height);
            } else {
                // self / target / offset: 至少画一个定位圈，保证可见
                ctx.beginPath();
                ctx.arc(sx, sy, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            // 中心十字
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(sx - 6, sy);
            ctx.lineTo(sx + 6, sy);
            ctx.moveTo(sx, sy - 6);
            ctx.lineTo(sx, sy + 6);
            ctx.stroke();

            // offset / target 模式下画一条到自身的参考线
            if (mode === 'offset' || mode === 'target') {
                const ox = selfPos.x - camera.x;
                const oy = selfPos.y - camera.y;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }

            // 标签
            ctx.setLineDash([]);
            ctx.fillStyle = spawn.enabled ? '#22c55e' : '#6b7280';
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Spawn: ${mode}`, sx + 8, sy - 8);
            ctx.restore();
        }
    }
};

