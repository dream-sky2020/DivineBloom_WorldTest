import { ISystem } from '@definitions/interface/ISystem';
import { floatingTextQueue } from '@world2d/runtime/WorldEcsRuntime';
import { worldToScreenXY } from '../../../render/core/CameraTransform';
import { isPointVisible } from '../../../render/core/Culling';
import type { RenderContext } from '../../../render/core/RenderTypes';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

/**
 * FloatingTextRenderSystem
 * 负责渲染 world 中的飘字缓冲数据。
 */
export const FloatingTextRenderSystem: ISystem & { LAYER: number } = {
  name: 'floating-text-render',
  executionPolicy: ExecutionPolicy.Always,
  LAYER: 40,

  draw(renderer: RenderContext) {
    if (!renderer || !renderer.ctx || !renderer.camera) return;
    const ctx = renderer.ctx as CanvasRenderingContext2D;
    const camera = renderer.camera;
    const viewW = renderer.width || 0;
    const viewH = renderer.height || 0;
    const cullMargin = 80;
    const viewport = { width: viewW, height: viewH };

    const items = floatingTextQueue.getActive();
    if (!Array.isArray(items) || items.length === 0) return;

    for (const item of items) {
      if (!item || !item.active) continue;

      if (!isPointVisible(item.x, item.y, camera, viewport, cullMargin)) {
        continue;
      }

      const screenPos = worldToScreenXY(item.x, item.y, camera);
      const screenX = screenPos.x;
      const screenY = screenPos.y;
      const fontSize = Math.max(10, Math.round(16 * (item.scale || 1)));

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, item.alpha ?? 1));
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.strokeText(item.text, screenX, screenY);
      ctx.fillStyle = item.color || '#ffffff';
      ctx.fillText(item.text, screenX, screenY);
      ctx.restore();
    }
  }
};
