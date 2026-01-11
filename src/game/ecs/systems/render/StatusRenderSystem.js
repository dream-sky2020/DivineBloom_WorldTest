import { world } from '@/game/ecs/world'
import { drawSuspicion, drawAlert, drawStunned } from '@/game/utils/renderUtils'

/**
 * Status Render System
 * 负责渲染：头顶状态图标 (惊叹号, 问号, 晕眩条)
 * 层级：位于角色 Sprite 之上 (Layer 3)
 * 
 * Required Components:
 * @property {object} position
 * @property {object} aiState
 */

const statusEntities = world.with('position', 'aiState')

export const StatusRenderSystem = {
  // 定义渲染层级 (Z-Index)
  LAYER: 30,

  /**
   * @param {import('@/game/GameEngine').Renderer2D} renderer 
   */
  draw(renderer) {
    // Defensive Check: Renderer
    if (!renderer || !renderer.ctx || !renderer.camera) {
      console.error('[StatusRenderSystem] Invalid renderer instance!');
      return;
    }

    const ctx = renderer.ctx
    const camera = renderer.camera
    const viewW = renderer.width || 0
    const viewH = renderer.height || 0
    const cullMargin = 100

    const isVisible = (pos) => {
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
      return !(pos.x < camera.x - cullMargin ||
        pos.x > camera.x + viewW + cullMargin ||
        pos.y < camera.y - cullMargin ||
        pos.y > camera.y + viewH + cullMargin)
    }

    for (const entity of statusEntities) {
      // Defensive checks for components
      if (!entity.position) {
        console.warn(`[StatusRenderSystem] Entity ${entity.id || 'N/A'} missing position!`);
        continue;
      }
      if (!entity.aiState) {
        console.warn(`[StatusRenderSystem] Entity ${entity.id || 'N/A'} missing aiState!`);
        continue;
      }

      if (!isVisible(entity.position)) continue

      const { state, suspicion } = entity.aiState

      // 转换世界坐标到屏幕坐标 (Screen Space)
      const screenPos = {
        x: entity.position.x - camera.x,
        y: entity.position.y - camera.y
      }

      // 1. Suspicion (?)
      if (suspicion > 0) {
        // aiConfig is optional for drawSuspicion but usually needed for positioning
        drawSuspicion(ctx, screenPos, entity.aiState, entity.aiConfig || {})
      }

      // 2. Alert (!)
      if (state === 'chase') {
        drawAlert(ctx, screenPos, entity.aiState)
      }

      // 3. Stunned (Stars + Bar)
      if (state === 'stunned') {
        drawStunned(ctx, screenPos, entity.aiState)
      }
    }
  }
}
