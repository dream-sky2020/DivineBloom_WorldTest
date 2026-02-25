import { z } from 'zod';
import { world } from '@world2d/runtime/WorldEcsRuntime';
import { IEntityDefinition } from '../interface/IEntity';
import {
  DetectArea, DetectInput,
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Bounds, BOUNDS_INSPECTOR_FIELDS,
  Actions,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  DETECT_AREA_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Parent, Children, LocalTransform, Shape, ShapeType,
  SHAPE_INSPECTOR_FIELDS, LOCAL_TRANSFORM_INSPECTOR_FIELDS
} from '@components';

// --- Schema Definition ---

export const NPCEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  assetId: z.string().optional(), // 顶层 assetId 优先
  config: z.object({
    dialogueId: z.string().optional().default('welcome'),
    spriteId: z.string().optional().default('npc_guide'),
    range: z.number().optional().default(60),
    scale: z.number().optional().default(0.8)
  }).optional().default({} as any)
});

export type NPCEntityData = z.infer<typeof NPCEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '显示名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  ...(SHAPE_INSPECTOR_FIELDS || []),
  ...(COLLIDER_INSPECTOR_FIELDS || []),
  ...(BOUNDS_INSPECTOR_FIELDS || []),
  { path: 'actionDialogue.dialogueId', label: '对话 ID', type: 'text', tip: '对应 dialogues 文件夹中的配置', group: '交互配置' },
  ...(DETECT_AREA_INSPECTOR_FIELDS || []),
  { path: 'sprite.id', label: '立绘 ID', type: 'text', group: '精灵 (Sprite)' },
  ...(SPRITE_INSPECTOR_FIELDS || []),
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const NPCEntity: IEntityDefinition<typeof NPCEntitySchema> = {
  type: 'npc',
  name: 'NPC',
  order: 20,
  creationIndex: 0,
  schema: NPCEntitySchema,
  create(data: NPCEntityData) {
    const result = NPCEntitySchema.safeParse(data);

    if (!result.success) {
      console.error('[NPCEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, assetId, config } = result.data;
    const { dialogueId, spriteId, range, scale } = config;
    const visualId = assetId || spriteId;

    const root = world.add({
      type: 'npc',
      name: name || `NPC_${dialogueId}`,
      transform: Transform.create(x, y),
      npc: true,

      actionDialogue: Actions.Dialogue(dialogueId),
      interaction: { type: 'dialogue', id: dialogueId, range: range },
      bounds: Bounds.create(),
      sprite: Sprite.create(visualId, { scale }),
      animation: Animation.create('default'),
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: 15 }),
      collider: Collider.create({ isStatic: true }),

      detectInput: DetectInput.create({ keys: ['Interact'] })
    });

    // 2. Sensor Child (Detection)
    const sensor = world.add({
      parent: Parent.create(root),
      transform: Transform.create(),
      localTransform: LocalTransform.create(0, 0),
      name: `${root.name}_Sensor`,
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: range }),
      detectArea: DetectArea.create({ target: 'player' })
    });

    root.children = Children.create([sensor]);
    sensor.inspector = Inspector.create({
      fields: [
        ...(LOCAL_TRANSFORM_INSPECTOR_FIELDS || []),
        ...(SHAPE_INSPECTOR_FIELDS || []),
        ...(DETECT_AREA_INSPECTOR_FIELDS || [])
      ],
      hitPriority: 60,
      editorBox: { w: 30, h: 30, scale: 1 }
    });

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 80,
      editorBox: { w: 40, h: 40, scale: 1 }
    });

    return root;
  },

  serialize(entity: any) {
    const visualId = entity.sprite?.id || entity.visual?.id;
    return {
      type: 'npc',
      x: entity.transform.x,
      y: entity.transform.y,
      name: entity.name,
      assetId: visualId,
      config: {
        dialogueId: entity.interaction.id,
        range: entity.interaction.range,
        spriteId: visualId,
        scale: entity.sprite?.scale || entity.visual?.scale
      }
    }
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
