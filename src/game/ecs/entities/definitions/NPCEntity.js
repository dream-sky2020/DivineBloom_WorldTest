import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { DetectArea, DetectInput, Trigger } from '@/game/ecs/entities/components/Triggers'
import { Visuals } from '@/game/ecs/entities/components/Visuals'
import { Physics } from '@/game/ecs/entities/components/Physics'
import { Actions } from '@/game/ecs/entities/components/Actions'
import { Inspector } from '@/game/ecs/entities/components/Inspector'

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

const INSPECTOR_FIELDS = [
  { path: 'name', label: '显示名称', type: 'text' },
  { path: 'position.x', label: '坐标 X', type: 'number', props: { step: 1 } },
  { path: 'position.y', label: '坐标 Y', type: 'number', props: { step: 1 } },
  { path: 'actionDialogue.dialogueId', label: '对话 ID', type: 'text', tip: '对应 dialogues 文件夹中的配置' },
  { path: 'detectArea.radius', label: '交互半径', type: 'number', tip: '玩家靠近多少距离可以触发对话', props: { min: 10 } },
  { path: 'visual.id', label: '立绘 ID', type: 'text' },
  { path: 'visual.scale', label: '缩放比例', type: 'number', props: { step: 0.1, min: 0.1 } }
];

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
      ),

      // [NEW] 添加 Inspector
      inspector: Inspector.create({ 
        fields: INSPECTOR_FIELDS,
        hitPriority: 80
      })
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
