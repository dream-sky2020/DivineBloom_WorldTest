import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { Physics, ShapeType } from '@/game/ecs/entities/components/Physics'
import { Inspector } from '@/game/ecs/entities/components/Inspector'

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

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text' },
  { path: 'position.x', label: '坐标 X', type: 'number' },
  { path: 'position.y', label: '坐标 Y', type: 'number' },
  { path: 'collider.type', label: '形状类型', type: 'text', tip: 'AABB, CIRCLE, POLYGON, SEGMENT' },
  { path: 'collider.width', label: '宽度', type: 'number', props: { min: 0 } },
  { path: 'collider.height', label: '高度', type: 'number', props: { min: 0 } },
  { path: 'collider.radius', label: '半径', type: 'number', props: { min: 0 } },
  { path: 'collider.rotation', label: '旋转', type: 'number', tip: '弧度值' }
];

export const ObstacleEntity = {
  create(data) {
    const result = ObstacleEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[ObstacleEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, width, height, radius, p1, p2, rotation, shape } = result.data;

    return world.add({
      type: 'obstacle',
      name: name,
      position: { x, y },
      collider: Physics.Collider({
        type: shape,
        width: width || (radius ? radius * 2 : 30),
        height: height || (radius ? radius * 2 : 30),
        radius: radius || 15,
        p1,
        p2,
        rotation,
        isStatic: true // 障碍物通常是静态的
      }),
      // [NEW] 添加 Inspector
      inspector: Inspector.create({ fields: INSPECTOR_FIELDS })
    });
  },

  serialize(entity) {
    return {
      type: 'obstacle',
      name: entity.name,
      x: entity.position.x,
      y: entity.position.y,
      width: entity.collider.width,
      height: entity.collider.height,
      radius: entity.collider.radius,
      p1: entity.collider.p1,
      p2: entity.collider.p2,
      rotation: entity.collider.rotation,
      shape: entity.collider.type
    };
  }
};
