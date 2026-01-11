import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { DetectArea, DetectInput, Trigger } from '@/game/entities/components/Triggers'
import { Visuals } from '@/game/entities/components/Visuals'
import { Physics } from '@/game/entities/components/Physics'
import { Actions } from '@/game/entities/components/Actions'

// --- Schema Definition ---

export const NPCEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
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
    
    const { x, y, config } = result.data;
    
    // Check for explicit missing dialogueId if user passed config but empty object
    // Schema default handles 'undefined' config, but inside config, defaults handle missing properties.
    // But original code had a warning.
    if (data.config && !data.config.dialogueId) {
       // Original warning logic preserved effectively via defaults?
       // If data.config.dialogueId is missing, Zod uses default 'welcome'.
       // We can keep the warning if we want, but Zod takes care of values.
    }

    const { dialogueId, spriteId, range, scale } = config;

    const entity = world.add({
      type: 'npc',
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

      // Body component
      body: Physics.StaticBody(30, 30, 15),
      
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
      x: entity.position.x,
      y: entity.position.y,
      config: {
        dialogueId: entity.interaction.id,
        range: entity.interaction.range,
        spriteId: entity.visual.id,
        scale: entity.visual.scale
      }
    }
  }
}
