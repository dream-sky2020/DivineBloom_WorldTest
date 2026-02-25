import { z } from 'zod';
import { world } from '@world2d/runtime/WorldEcsRuntime';
import { IEntityDefinition } from '../interface/IEntity';
import { Collider, COLLIDER_INSPECTOR_FIELDS, Shape, SHAPE_INSPECTOR_FIELDS, ShapeType, Inspector, EDITOR_INSPECTOR_FIELDS, Transform, TRANSFORM_INSPECTOR_FIELDS, Detectable, DamageDetectable, PortalDetectable } from '@components';

export const ObstacleEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Obstacle'),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  p1: z.object({ x: z.number(), y: z.number() }).optional(),
  p2: z.object({ x: z.number(), y: z.number() }).optional(),
  rotation: z.number().optional().default(0),
  shape: z.nativeEnum(ShapeType).optional().default(ShapeType.AABB)
});

export type ObstacleEntityData = z.infer<typeof ObstacleEntitySchema>;

// Inspector 配置仍然针对主实体
const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  ...(SHAPE_INSPECTOR_FIELDS || []),
  ...(COLLIDER_INSPECTOR_FIELDS || []),
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const ObstacleEntity: IEntityDefinition<typeof ObstacleEntitySchema> = {
  type: 'obstacle',
  name: '障碍物',
  order: 30,
  creationIndex: 0,
  schema: ObstacleEntitySchema,
  create(data: ObstacleEntityData) {
    const result = ObstacleEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[ObstacleEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, width, height, radius, p1, p2, rotation, shape } = result.data;

    // 1. 创建主实体 (Root)
    const rootEntity = world.add({
      type: 'obstacle',
      name: name,
      transform: Transform.create(x, y),
      shape: Shape.create({
        type: shape,
        width: width || (radius ? radius * 2 : 30),
        height: height || (radius ? radius * 2 : 30),
        radius: radius || 15,
        p1,
        p2,
        rotation: rotation || 0,
        offsetX: 0,
        offsetY: 0
      }),
      collider: Collider.create({
        isStatic: true
      }),
      detectable: Detectable.create(['obstacle']),
      damageDetectable: DamageDetectable.create(['obstacle']),
      portalDetectable: PortalDetectable.create(['obstacle'])
    });

    // 添加 Inspector 到主实体，以便编辑器操作
    rootEntity.inspector = Inspector.create({ 
      fields: INSPECTOR_FIELDS,
      hitPriority: 50,
      editorBox: {
          w: 40,
          h: 40,
          anchorX: 0.5,
          anchorY: 0.5
      }
    });

    return rootEntity;
    },

  serialize(entity: any) {
    const { transform, name, shape } = entity
    
    return {
      type: 'obstacle',
      name: name,
      x: transform.x,
      y: transform.y,
      width: shape?.width,
      height: shape?.height,
      radius: shape?.radius,
      p1: shape?.p1,
      p2: shape?.p2,
      rotation: shape?.rotation || 0,
      shape: shape?.type
    };
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
