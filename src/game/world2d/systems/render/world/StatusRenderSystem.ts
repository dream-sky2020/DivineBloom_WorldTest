import { world } from '@world2d/runtime/WorldEcsRuntime';
// @ts-ignore
import { drawSuspicion, drawAlert, drawStunned } from '@world2d/ECSCalculateTool/ECSSceneGizmosRendererCalculateTool';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { createLogger } from '@/utils/logger';
import { worldToScreen } from '../../../render/core/CameraTransform';
import { isPointVisible } from '../../../render/core/Culling';
import type { RenderContext } from '../../../render/core/RenderTypes';

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

    draw(renderer: RenderContext) {
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
        const viewport = { width: viewW, height: viewH };

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

            if (!isPointVisible(e.transform.x, e.transform.y, camera, viewport, cullMargin)) continue;

            const { state, suspicion } = e.aiState;

            // 转换世界坐标到屏幕坐标 (Screen Space)
            const screenPos = worldToScreen(e.transform, camera);

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
