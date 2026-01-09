import { world } from '@/game/ecs/world'
import { Visuals } from '@/data/visuals'

/**
 * Animation System Components Schema
 * 
 * Required Components:
 * @property {object} visual
 * @property {string} visual.id - 视觉资源 ID (对应 Visuals 数据表)
 * @property {string} [visual.state='idle'] - 当前动画状态名 (对应 Visuals[id].animations key)
 * @property {number} visual.frameIndex - 当前帧索引
 * @property {number} visual.timer - 帧计时器
 * @property {number} [visual.speedMultiplier=1] - 播放速度倍率
 * 
 * Dependencies:
 * - src/data/visuals.js: 定义动画帧数据
 */

// 筛选出所有拥有 visual 组件的实体
const visualEntities = world.with('visual')

export const AnimationSystem = {
  /**
   * 更新实体的动画状态
   * @param {number} dt 
   */
  update(dt) {
    for (const entity of visualEntities) {
      this.updateAnimation(entity, dt)
    }
  },

  updateAnimation(entity, dt) {
    const { visual } = entity
    const def = Visuals[visual.id]
    if (!def) return

    const animName = visual.state || 'default'
    const anim = def.animations[animName] || def.animations['default'] || def.animations['idle']
    if (!anim) return

    if (anim.frames.length <= 1) {
      visual.frameIndex = 0
      return
    }

    visual.timer += dt * (visual.speedMultiplier || 1)

    // 如果是 loop=false 且播放完了，保持最后一帧
    const frameDuration = 1 / (anim.speed || 10)
    if (visual.timer >= frameDuration) {
      visual.timer -= frameDuration
      visual.frameIndex++

      if (visual.frameIndex >= anim.frames.length) {
        if (anim.loop !== false) { // 默认 loop true
          visual.frameIndex = 0
        } else {
          visual.frameIndex = anim.frames.length - 1
        }
      }
    }
  }
}

