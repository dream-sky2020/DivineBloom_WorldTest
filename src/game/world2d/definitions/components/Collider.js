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

/**
 * Collider 通用属性字段，用于编辑器 Inspector 面板
 */
export const COLLIDER_INSPECTOR_FIELDS = [
  { path: 'collider.type', label: '碰撞形状', type: 'enum', options: ShapeType, tip: '决定物理判定的几何形状 (Circle:圆形, AABB:轴对齐矩形, OBB:旋转矩形, Capsule:胶囊体)', group: '碰撞体 (Collider)' },
  { path: 'collider.isStatic', label: '是否静态', type: 'boolean', tip: '静态物体(如墙壁)质量无穷大，不会被推走；动态物体(如角色)会被碰撞推开', group: '碰撞体 (Collider)' },
  { path: 'collider.isTrigger', label: '是否触发器', type: 'boolean', tip: '勾选后只产生重叠事件(OnTrigger)，不产生物理阻挡(推挤)效果', group: '碰撞体 (Collider)' },
  { path: 'collider.radius', label: '半径 (Radius)', type: 'number', props: { min: 0, step: 1 }, tip: '[Circle, Capsule] 专用属性，圆形或胶囊体的半径', group: '碰撞体 (Collider)' },
  { path: 'collider.width', label: '宽度 (Width)', type: 'number', props: { min: 0, step: 1 }, tip: '[AABB, OBB] 专用属性，矩形的宽度', group: '碰撞体 (Collider)' },
  { path: 'collider.height', label: '高度 (Height)', type: 'number', props: { min: 0, step: 1 }, tip: '[AABB, OBB] 专用属性，矩形的高度', group: '碰撞体 (Collider)' },
  { path: 'collider.offsetX', label: '中心偏移 X', type: 'number', props: { step: 1 }, tip: '相对于实体坐标(Position)的水平偏移量', group: '碰撞体 (Collider)' },
  { path: 'collider.offsetY', label: '中心偏移 Y', type: 'number', props: { step: 1 }, tip: '相对于实体坐标(Position)的垂直偏移量', group: '碰撞体 (Collider)' },
  { path: 'collider.rotation', label: '旋转角度', type: 'number', props: { step: 0.1 }, tip: '[OBB, Capsule] 有效，旋转弧度 (Circle 无效)', group: '碰撞体 (Collider)' },
  // 补充胶囊体特有属性
  { path: 'collider.p1.x', label: '胶囊端点1 X', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段起点 X (局部坐标)', group: '碰撞体 (Collider)' },
  { path: 'collider.p1.y', label: '胶囊端点1 Y', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段起点 Y (局部坐标)', group: '碰撞体 (Collider)' },
  { path: 'collider.p2.x', label: '胶囊端点2 X', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段终点 X (局部坐标)', group: '碰撞体 (Collider)' },
  { path: 'collider.p2.y', label: '胶囊端点2 Y', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段终点 Y (局部坐标)', group: '碰撞体 (Collider)' }
];
