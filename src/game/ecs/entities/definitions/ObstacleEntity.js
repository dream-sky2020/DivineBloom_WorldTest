import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { Physics, ShapeType } from '@/game/ecs/entities/components/Physics'

export const ObstacleEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  p1: z.object({ x: z.number(), y: z.number() }).optional(),
  p2: z.object({ x: z.number(), y: z.number() }).optional(),
  rotation: z.number().optional().default(0),
  shape: z.nativeEnum(ShapeType).optional().default(ShapeType.AABB)
});

export const ObstacleEntity = {
  create(data) {
    const result = ObstacleEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[ObstacleEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, width, height, radius, p1, p2, rotation, shape } = result.data;

    return world.add({
      type: 'obstacle',
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
      })
    });
  },

  serialize(entity) {
    return {
      type: 'obstacle',
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
