import { z } from 'zod';

// --- Physics Schema Definitions ---

export const PhysicsVelocitySchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0)
});

export const PhysicsBoundsSchema = z.object({
  minX: z.number().default(0),
  maxX: z.number().default(9999),
  minY: z.number().default(0),
  maxY: z.number().default(9999)
});

/**
 * 碰撞体形状枚举
 */
export const ShapeType = {
  CIRCLE: 'circle',
  AABB: 'aabb',
  OBB: 'obb',         // 旋转矩形
  CAPSULE: 'capsule'
};

/**
 * 碰撞体组件 Schema
 */
export const ColliderSchema = z.object({
  type: z.nativeEnum(ShapeType).default(ShapeType.CIRCLE),
  radius: z.number().default(15),
  width: z.number().default(30),
  height: z.number().default(30),
  rotation: z.number().default(0),
  // 胶囊体特有属性：相对于位置的偏移线段
  p1: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: -10 }),
  p2: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 10 }),
  // 物理属性
  isStatic: z.boolean().default(false),
  isTrigger: z.boolean().default(false),
  layer: z.number().default(1),
  mask: z.number().default(0xFFFFFFFF),
  // 偏移量
  offsetX: z.number().default(0),
  offsetY: z.number().default(0)
});

// --- Physics Factory ---

export const Physics = {
  /**
   * 速度组件
   */
  Velocity(x, y) {
    const result = PhysicsVelocitySchema.safeParse({ x, y });
    return result.success ? result.data : { x: 0, y: 0 };
  },

  /**
   * 碰撞体组件
   * @param {Object} config 
   */
  Collider(config = {}) {
    const result = ColliderSchema.safeParse(config);
    if (!result.success) {
      console.error('[Physics] Collider validation failed', result.error);
      // 返回默认值
      return {
        type: ShapeType.CIRCLE,
        radius: 15,
        width: 30,
        height: 30,
        rotation: 0,
        p1: { x: 0, y: -10 },
        p2: { x: 0, y: 10 },
        isStatic: false,
        isTrigger: false,
        layer: 1,
        mask: 0xFFFFFFFF,
        offsetX: 0,
        offsetY: 0
      };
    }
    return result.data;
  },

  /**
   * 快捷创建 AABB
   */
  Box(width, height, isStatic = false) {
    return this.Collider({ type: ShapeType.AABB, width, height, isStatic });
  },

  /**
   * 快捷创建圆形
   */
  Circle(radius, isStatic = false) {
    return this.Collider({ type: ShapeType.CIRCLE, radius, isStatic });
  },

  /**
   * 边界组件 (通常用于地图边界限制)
   */
  Bounds(minX, maxX, minY, maxY) {
    const result = PhysicsBoundsSchema.safeParse({ minX, maxX, minY, maxY });
    return result.success ? result.data : { minX: 0, maxX: 9999, minY: 0, maxY: 9999 };
  }
}
