import { world } from '@/game/ecs/world'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 */

export class MapEnemy {
  /**
   * @param {GameEngine} engine 
   * @param {number} x 
   * @param {number} y 
   * @param {Array<object>} battleGroup 
   * @param {object} [options]
   */
  constructor(engine, x, y, battleGroup, options = {}) {
    this.engine = engine

    this.uuid = options.uuid || Math.random().toString(36).substr(2, 9)
    const isStunned = options.isStunned || false
    const visualId = options.spriteId || 'enemy_slime'

    // Create ECS Entity
    this.entity = world.add({
      position: { x, y },
      velocity: { x: 0, y: 0 },
      enemy: true,

      interaction: {
        battleGroup: battleGroup || [],
        uuid: this.uuid
      },

      bounds: {
        minX: 0, maxX: engine.width || 9999,
        minY: 0, maxY: engine.height || 9999
      },

      // AI Components
      aiConfig: {
        type: options.aiType || 'wander',
        visionRadius: options.visionRadius || 120,
        visionType: options.visionType || 'circle',
        visionAngle: (options.visionAngle || 90) * (Math.PI / 180),
        visionProximity: options.visionProximity || 40,
        speed: options.speed || 80,
        suspicionTime: options.suspicionTime || 0,
        minYRatio: options.minYRatio || 0.35
      },

      aiState: {
        state: isStunned ? 'stunned' : 'wander',
        timer: isStunned ? (options.stunnedTimer || 3.0) : 0,
        suspicion: 0,
        moveDir: { x: 0, y: 0 },
        facing: { x: 1, y: 0 },
        colorHex: '#eab308', // 黄色
        alertAnim: 0,
        starAngle: 0,
        justEntered: true
      },

      // Visual System
      visual: {
        id: visualId,
        state: isStunned ? 'stunned' : 'idle',
        frameIndex: 0,
        timer: 0,
        scale: options.scale || 1
      }

      // 注意：这里不再需要 render 组件的 onDraw 回调
      // UI 绘制已移交 RenderSystem Layer 3
    })

    this.pos = this.entity.position
  }

  destroy() {
    if (this.entity) {
      world.remove(this.entity)
      this.entity = null
    }
  }

  toData() {
    const { aiState, aiConfig, interaction, visual } = this.entity
    return {
      x: this.pos.x,
      y: this.pos.y,
      battleGroup: interaction.battleGroup,
      options: {
        uuid: interaction.uuid,
        isStunned: aiState.state === 'stunned',
        stunnedTimer: aiState.state === 'stunned' ? aiState.timer : 0,
        aiType: aiConfig.type,
        visionRadius: aiConfig.visionRadius,
        visionType: aiConfig.visionType,
        visionAngle: Math.round(aiConfig.visionAngle * (180 / Math.PI)),
        visionProximity: aiConfig.visionProximity,
        speed: aiConfig.speed,
        minYRatio: aiConfig.minYRatio,
        suspicionTime: aiConfig.suspicionTime,
        spriteId: visual.id
      }
    }
  }

  static fromData(engine, data, context = {}) {
    return new MapEnemy(engine, data.x, data.y, data.battleGroup, {
      ...data.options,
      ...context
    })
  }
}
