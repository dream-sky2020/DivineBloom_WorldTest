import { z } from 'zod';
import { ShapeType } from '../enums/Shape';

// Re-export for convenience
export { ShapeType } from '../enums/Shape';

// --- Schema Definition ---
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

// --- Component Factory ---
export const Collider = {
  /**
   * 创建碰撞体组件
   * @param {Object} config 
   * @returns 
   */
  create(config = {}) {
    const result = ColliderSchema.safeParse(config);
    if (!result.success) {
      console.error('[Collider] Validation failed', result.error);
      return ColliderSchema.parse({});
    }
    return result.data;
  },

  /**
   * 快捷创建矩形碰撞体 (AABB)
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {boolean} isStatic - 是否静态
   * @returns 
   */
  box(width, height, isStatic = false) {
    return this.create({ type: ShapeType.AABB, width, height, isStatic });
  },

  /**
   * 快捷创建圆形碰撞体
   * @param {number} radius - 半径
   * @param {boolean} isStatic - 是否静态
   * @returns 
   */
  circle(radius, isStatic = false) {
    return this.create({ type: ShapeType.CIRCLE, radius, isStatic });
  },

  /**
   * 快捷创建胶囊体碰撞体
   * @param {Object} p1 - 起点 {x, y}
   * @param {Object} p2 - 终点 {x, y}
   * @param {number} radius - 半径
   * @param {boolean} isStatic - 是否静态
   * @returns 
   */
  capsule(p1, p2, radius, isStatic = false) {
    return this.create({ type: ShapeType.CAPSULE, p1, p2, radius, isStatic });
  }
};
