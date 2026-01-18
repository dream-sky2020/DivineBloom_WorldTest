import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { DetectArea, DetectInput, Trigger } from '@/game/ecs/entities/components/Triggers'
import { Visuals } from '@/game/ecs/entities/components/Visuals'
import { Physics } from '@/game/ecs/entities/components/Physics'
import { Actions } from '@/game/ecs/entities/components/Actions'

// --- Schema Definition ---

export const NPCEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  config: z.object({
    dialogueId: z.string().optional().default('welcome'),
    spriteId: z.string().optional().default('npc_guide'),
    range: z.number().optional().default(60),
    scale: z.number().optional().default(0.8)
  }).optional().default({})
});

// --- Entity Definition ---

export const NPCEntity = {
  create(data) {
    const result = NPCEntitySchema.safeParse(data);
    
    if (!result.success) {
      console.error('[NPCEntity] Validation failed', result.error);
      return null;
    }
    
    const { x, y, name, config } = result.data;
    
    // ... (logic)

    const { dialogueId, spriteId, range, scale } = config;

    const entity = world.add({
      type: 'npc',
      name: name || `NPC_${dialogueId}`, // 如果没传名字，用对话ID兜底
      position: { x, y },
      npc: true,
      
      // [NEW ARCHITECTURE]
      detectArea: DetectArea({ shape: 'circle', radius: range, target: 'player' }),
      detectInput: DetectInput({ keys: ['Interact'] }),
      trigger: Trigger({ 
        rules: [{ type: 'onPress', requireArea: true }], 
        actions: ['DIALOGUE'] 
      }),
      
      actionDialogue: Actions.Dialogue(dialogueId),

      // [LEGACY COMPATIBILITY]
      interaction: {
        type: 'dialogue',
        id: dialogueId,
        range: range
      },

      // 🎯 自定义碰撞体 (静态圆形)
      collider: Physics.Circle(15, true),
      
      bounds: Physics.Bounds(),

      visual: Visuals.Sprite(
        spriteId, 
        scale,
        'default'
      )
    })

    return entity
  },

  serialize(entity) {
    return {
      type: 'npc',
      x: entity.position.x,
      y: entity.position.y,
      name: entity.name,
      config: {
        dialogueId: entity.interaction.id,
        range: entity.interaction.range,
        spriteId: entity.visual.id,
        scale: entity.visual.scale
      }
    }
  }
}
