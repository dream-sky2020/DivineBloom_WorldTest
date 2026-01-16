import { z } from 'zod'
import { ID } from '@/data/schemas/common'
import { world } from '@/game/ecs/world'
import { DetectArea, Trigger, DetectInput } from '@/game/entities/components/Triggers'
import { Visuals } from '@/game/entities/components/Visuals'
import { Physics } from '@/game/entities/components/Physics'
import { AI } from '@/game/entities/components/AI'
import { Actions } from '@/game/entities/components/Actions'

// --- Schema Definition ---

export const EnemyEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  battleGroup: z.array(z.object({ id: ID })).default([]),
  options: z.object({
    uuid: z.string().optional(),
    isStunned: z.boolean().default(false),
    stunnedTimer: z.number().default(0),
    spriteId: z.string().default('enemy_slime'),
    scale: z.number().optional(),

    // AI Config
    aiType: z.string().optional(),
    visionRadius: z.number().optional(),
    speed: z.number().optional(),

    // AI Extra Options
    visionType: z.string().optional(),
    visionAngle: z.number().optional(),
    visionProximity: z.number().optional(),
    suspicionTime: z.number().optional(),
    minYRatio: z.number().optional()
  }).default({})
});

// --- Entity Definition ---

export const EnemyEntity = {
  create(data) {
    const result = EnemyEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[EnemyEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, battleGroup, options } = result.data;

    // Generate UUID if not present
    const uuid = options.uuid || Math.random().toString(36).substr(2, 9);
    const isStunned = options.isStunned;
    const visualId = options.spriteId;

    const entity = world.add({
      type: 'enemy',
      name: name || `Enemy_${visualId}`,
      position: { x, y },
      velocity: Physics.Velocity(),
      enemy: true,

      // [NEW ARCHITECTURE]
      detectArea: DetectArea({ shape: 'circle', radius: 40, target: 'player' }),
      trigger: Trigger({
        rules: [{
          type: 'onEnter',
          // [NEW] Added Condition
          condition: 'notStunned'
        }],
        actions: ['BATTLE']
      }),

      actionBattle: Actions.Battle(battleGroup, uuid),

      // [LEGACY COMPATIBILITY] - Keeping for safety if other systems access it directly
      interaction: {
        battleGroup: battleGroup,
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

    // [REMOVED] Vision Indicator Entity
    // Vision rendering is now handled by AIVisionRenderSystem which queries the enemy entity directly.
    // No need for a separate attached entity.

    return entity
  },

  serialize(entity) {
    const { position, aiState, aiConfig, interaction, visual, name } = entity
    return {
      type: 'enemy',
      x: position.x,
      y: position.y,
      name: name,
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
