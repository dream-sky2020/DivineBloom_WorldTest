import { world } from '@world2d/runtime/WorldEcsRuntime';
// @ts-ignore
import { drawSuspicion, drawAlert, drawStunned } from '@world2d/ECSCalculateTool/ECSSceneGizmosRendererCalculateTool';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { createLogger } from '@/utils/logger';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

const logger = createLogger('StatusRenderSystem');

/**
 * Status Render System
 * 负责渲染：头顶状态图标 (惊叹号, 问号, 晕眩条)
 * 层级：位于角色 Sprite 之上 (Layer 3)
 */
export const StatusRenderSystem: ISystem & { LAYER: number } = {
    name: 'status-render',
    executionPolicy: ExecutionPolicy.Always,
    // 定义渲染层级 (Z-Index)
    LAYER: 30,

    draw(renderer: any) {
        // Defensive Check: Renderer
        if (!renderer || !renderer.ctx || !renderer.camera) {
            logger.error('[StatusRenderSystem] Invalid renderer instance!');
            return;
        }

        const ctx = renderer.ctx;
        const camera = renderer.camera;
        const viewW = renderer.width || 0;
        const viewH = renderer.height || 0;
        const cullMargin = 100;

        const isVisible = (pos: any) => {
            if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
            return !(pos.x < camera.x - cullMargin ||
                pos.x > camera.x + viewW + cullMargin ||
                pos.y < camera.y - cullMargin ||
                pos.y > camera.y + viewH + cullMargin);
        };

        const statusEntities = world.with('transform', 'aiState');

        for (const entity of statusEntities) {
            const e = entity as IEntity;
            // Defensive checks for components
            if (!e.transform) {
                logger.warn(`[StatusRenderSystem] Entity ${e.id || 'N/A'} missing transform!`);
                continue;
            }
            if (!e.aiState) {
                logger.warn(`[StatusRenderSystem] Entity ${e.id || 'N/A'} missing aiState!`);
                continue;
            }

            if (!isVisible(e.transform)) continue;

            const { state, suspicion } = e.aiState;

            // 转换世界坐标到屏幕坐标 (Screen Space)
            const screenPos = {
                x: e.transform.x - camera.x,
                y: e.transform.y - camera.y
            };

            // 1. Suspicion (?)
            if (suspicion > 0) {
                // aiConfig is optional for drawSuspicion but usually needed for positioning
                drawSuspicion(ctx, screenPos, e.aiState, e.aiConfig || {});
            }

            // 2. Alert (!)
            if (state === 'chase') {
                drawAlert(ctx, screenPos, e.aiState);
            }

            // 3. Stunned (Stars + Bar)
            if (state === 'stunned') {
                drawStunned(ctx, screenPos, e.aiState);
            }
        }
    }
};
