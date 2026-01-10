import { world } from '@/game/ecs/world'
import { DetectArea, DetectInput, Trigger } from '@/game/entities/components/Triggers'
import { Visuals } from '@/game/entities/components/Visuals'
import { Physics } from '@/game/entities/components/Physics'
import { Actions } from '@/game/entities/components/Actions'

export const NPCEntity = {
  create(data) {
    const { x, y, config = {} } = data

    // 简单的校验，防止配置错误导致默认值覆盖
    if (!config.dialogueId) {
      console.warn('[NPCFactory] NPC missing dialogueId, falling back to "welcome". Check map data structure.', data)
    }

    // 默认值逻辑来自原 NPC.js
    const dialogueId = config.dialogueId || 'welcome'
    const visualId = config.spriteId || 'npc_guide'

    const entity = world.add({
      type: 'npc',
      position: { x, y },
      npc: true,
      
      // [NEW ARCHITECTURE]
      detectArea: DetectArea({ shape: 'circle', radius: config.range || 60, target: 'player' }),
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
        range: config.range || 60
      },

      // Body component
      body: Physics.StaticBody(30, 30, 15),
      
      bounds: Physics.Bounds(),

      visual: Visuals.Sprite(
        visualId, 
        config.scale || 0.8,
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
