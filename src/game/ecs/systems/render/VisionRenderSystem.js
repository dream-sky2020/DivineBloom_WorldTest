import { world } from '@/game/ecs/world'
import { drawVision } from '@/game/utils/renderUtils'

/**
 * Vision Render System
 * 负责渲染：AI 视野区域、地面指示器
 * 层级：位于角色 Sprite 之下 (Layer 1)
 * 
 * Required Components:
 * @property {object} position
 * @property {object} aiConfig
 * @property {object} aiState
 * @property {boolean} enemy
 */

const visionEntities = world.with('position', 'aiConfig', 'aiState', 'enemy')

export const VisionRenderSystem = {
  /**
   * @param {import('@/game/GameEngine').Renderer2D} renderer 
   */
  draw(renderer) {
    const ctx = renderer.ctx
    const camera = renderer.camera
    const viewW = renderer.width
    const viewH = renderer.height
    const cullMargin = 200

    const isVisible = (pos) => {
      return !(pos.x < camera.x - cullMargin ||
        pos.x > camera.x + viewW + cullMargin ||
        pos.y < camera.y - cullMargin ||
        pos.y > camera.y + viewH + cullMargin)
    }

    for (const entity of visionEntities) {
      if (!isVisible(entity.position)) continue

      // 只有非晕眩、非 idle (wander/chase) 才画视野
      // 如果 aiState.state 是 'stunned'，通常不画视野
      if (entity.aiState.state !== 'stunned') {
        drawVision(ctx, entity.position, entity.aiConfig, entity.aiState)
      }
    }
  }
}

