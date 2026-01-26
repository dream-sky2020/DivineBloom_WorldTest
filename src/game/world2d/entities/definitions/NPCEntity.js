import { z } from 'zod'
import { world } from '@world2d/world'
import { DetectArea, DetectInput, Trigger } from '@world2d/entities/components/Triggers'
import { Sprite } from '@world2d/entities/components/Sprite'
import { Animation } from '@world2d/entities/components/Animation'
import { Physics } from '@world2d/entities/components/Physics'
import { Actions } from '@world2d/entities/components/Actions'
import { Inspector, EDITOR_INSPECTOR_FIELDS, SPRITE_INSPECTOR_FIELDS } from '@world2d/entities/components/Inspector'

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
  { path: 'name', label: '显示名称', type: 'text', group: '基本属性' },
  { path: 'position.x', label: '坐标 X', type: 'number', props: { step: 1 }, group: '基本属性' },
  { path: 'position.y', label: '坐标 Y', type: 'number', props: { step: 1 }, group: '基本属性' },
  { path: 'actionDialogue.dialogueId', label: '对话 ID', type: 'text', tip: '对应 dialogues 文件夹中的配置', group: '交互配置' },
  { path: 'detectArea.radius', label: '交互半径', type: 'number', tip: '玩家靠近多少距离可以触发对话', props: { min: 10 }, group: '交互配置' },
  { path: 'sprite.id', label: '立绘 ID', type: 'text', group: '精灵 (Sprite)' },
  ...SPRITE_INSPECTOR_FIELDS,
  ...EDITOR_INSPECTOR_FIELDS
];

export const NPCEntity = {
  create(data) {
    const result = NPCEntitySchema.safeParse(data);

    if (!result.success) {
      console.error('[NPCEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, config } = result.data;
    const { dialogueId, spriteId, range, scale } = config;

    const entity = {
      type: 'npc',
      name: name || `NPC_${dialogueId}`,
      position: { x, y },
      npc: true,

      detectArea: DetectArea({ shape: 'circle', radius: range, target: 'player' }),
      detectInput: DetectInput({ keys: ['Interact'] }),
      trigger: Trigger({
        rules: [{ type: 'onPress', requireArea: true }],
        actions: ['DIALOGUE']
      }),

      actionDialogue: Actions.Dialogue(dialogueId),
      interaction: { type: 'dialogue', id: dialogueId, range: range },
      collider: Physics.Circle(15, true),
      bounds: Physics.Bounds(),
      sprite: Sprite.create(spriteId, { scale }),
      animation: Animation.create('default'),
    };

    entity.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 80,
      editorBox: { w: 32, h: 48, scale: 1 }
    });

    return world.add(entity);
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
        spriteId: entity.sprite?.id || entity.visual?.id,
        scale: entity.sprite?.scale || entity.visual?.scale
      }
    }
  }
}
