import { world } from '@/game/ecs/world'
import { Triggers } from '@/game/entities/components/Triggers'
import { Visuals } from '@/game/entities/components/Visuals'
import { Physics } from '@/game/entities/components/Physics'
import { AI } from '@/game/entities/components/AI'
import { Actions } from '@/game/entities/components/Actions'

export const EnemyEntity = {
  create(data) {
    const { x, y, battleGroup, options = {} } = data

    // 默认值处理
    const isStunned = options.isStunned || false
    const visualId = options.spriteId || 'enemy_slime'
    const uuid = options.uuid || Math.random().toString(36).substr(2, 9)

    const entity = world.add({
      type: 'enemy', 
      position: { x, y },
      velocity: Physics.Velocity(),
      enemy: true,

      // [NEW ARCHITECTURE]
      trigger: Triggers.PlayerProximity(40),
      
      actionBattle: Actions.Battle(battleGroup, uuid),

      // [LEGACY COMPATIBILITY]
      interaction: {
        battleGroup: battleGroup || [],
        uuid: uuid
      },

      bounds: Physics.Bounds(),

      aiConfig: AI.Config(
        options.aiType, 
        options.visionRadius, 
        options.speed,
        { // Extra options
          visionType: options.visionType,
          visionAngle: options.visionAngle,
          visionProximity: options.visionProximity,
          suspicionTime: options.suspicionTime,
          minYRatio: options.minYRatio
        }
      ),

      aiState: AI.State(isStunned, options.stunnedTimer),

      visual: Visuals.Sprite(
        visualId, 
        options.scale,
        isStunned ? 'stunned' : 'idle'
      )
    })

    return entity
  },

  serialize(entity) {
    const { position, aiState, aiConfig, interaction, visual } = entity
    return {
      x: position.x,
      y: position.y,
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
        spriteId: visual.id,
        scale: visual.scale
      }
    }
  }
}
