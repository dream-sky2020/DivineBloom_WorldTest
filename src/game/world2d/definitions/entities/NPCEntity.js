import { z } from 'zod'
import { world } from '@world2d/world'
import {
  DetectArea, DetectInput, Trigger,
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Bounds, BOUNDS_INSPECTOR_FIELDS,
  Actions,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  DETECT_AREA_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Parent, Children, LocalTransform, Shape, ShapeType
} from '@components'

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
  ...TRANSFORM_INSPECTOR_FIELDS,
  ...COLLIDER_INSPECTOR_FIELDS,
  ...BOUNDS_INSPECTOR_FIELDS,
  { path: 'actionDialogue.dialogueId', label: '对话 ID', type: 'text', tip: '对应 dialogues 文件夹中的配置', group: '交互配置' },
  ...DETECT_AREA_INSPECTOR_FIELDS,
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

    const root = world.add({
      type: 'npc',
      name: name || `NPC_${dialogueId}`,
      transform: Transform(x, y),
      npc: true,

      actionDialogue: Actions.Dialogue(dialogueId),
      interaction: { type: 'dialogue', id: dialogueId, range: range },
      bounds: Bounds(),
      sprite: Sprite.create(spriteId, { scale }),
      animation: Animation.create('default'),
      
      // Trigger 放在根节点，逻辑更清晰
      detectInput: DetectInput({ keys: ['Interact'] }),
      trigger: Trigger({
        rules: [{ type: 'onPress', requireArea: true }],
        actions: ['DIALOGUE']
      })
    });

    // 2. Body Child (Collision)
    const body = world.add({
        parent: Parent(root),
        transform: Transform(),
        localTransform: LocalTransform(0, 0),
        name: `${root.name}_Body`,
        shape: Shape({ type: ShapeType.CIRCLE, radius: 15 }),
        collider: Collider.create({ shapeId: 'body', isStatic: true })
    });

    // 3. Sensor Child (Detection)
    const sensor = world.add({
        parent: Parent(root),
        transform: Transform(),
        localTransform: LocalTransform(0, 0),
        name: `${root.name}_Sensor`,
        shape: Shape({ type: ShapeType.CIRCLE, radius: range }),
        detectArea: DetectArea({ shapeId: 'sensor', target: 'player' })
    });

    root.children = Children([body, sensor]);

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 80,
      editorBox: { w: 32, h: 48, scale: 1 }
    });

    return root;
  },

  serialize(entity) {
    return {
      type: 'npc',
      x: entity.transform.x,
      y: entity.transform.y,
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
