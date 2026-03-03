import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { worldToScreen } from '../../../render/core/CameraTransform';
import type { XY } from '../../../render/core/RenderTypes';
import { DebugPalette } from '../../../render/styles/DebugPalette';
import type { RenderContext } from '../../../render/core/RenderTypes';

type EntityWithTargetCandidates = {
    motion?: { runtime?: { targetPos?: Partial<XY> } };
    aiState?: { targetPos?: Partial<XY> };
    targetPos?: Partial<XY>;
    target?: { transform?: Partial<XY> };
};

function toNumber(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function getSelfPosition(entity: Partial<{ transform: Partial<XY> }>): XY {
    return {
        x: toNumber(entity?.transform?.x, 0),
        y: toNumber(entity?.transform?.y, 0)
    };
}

function getTargetPosition(entity: EntityWithTargetCandidates, fallback: XY): XY {
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

    draw(renderer: RenderContext) {
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

            const screenCenter = worldToScreen(center, camera);
            const sx = screenCenter.x;
            const sy = screenCenter.y;

            ctx.save();
            ctx.strokeStyle = spawn.enabled ? DebugPalette.spawn.enabledStroke : DebugPalette.spawn.disabledStroke;
            ctx.fillStyle = spawn.enabled ? DebugPalette.spawn.enabledFill : DebugPalette.spawn.disabledFill;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([...DebugPalette.spawn.mainDash]);

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
                const selfScreen = worldToScreen(selfPos, camera);
                const ox = selfScreen.x;
                const oy = selfScreen.y;
                ctx.setLineDash([...DebugPalette.spawn.refDash]);
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }

            // 标签
            ctx.setLineDash([]);
            ctx.fillStyle = spawn.enabled ? DebugPalette.spawn.labelEnabled : DebugPalette.spawn.labelDisabled;
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Spawn: ${mode}`, sx + 8, sy - 8);
            ctx.restore();
        }
    }
};

