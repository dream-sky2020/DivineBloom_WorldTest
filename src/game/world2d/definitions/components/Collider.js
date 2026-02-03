import { z } from 'zod';

// --- Schema Definition ---
export const ColliderSchema = z.object({
  // 引用 Shape 组件中的哪个形状
  shapeId: z.string().default('body'),

  // 物理属性
  isStatic: z.boolean().default(false),
  isTrigger: z.boolean().default(false),
  layer: z.number().default(1),
  mask: z.number().default(0xFFFFFFFF)
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
   * 快捷创建静态碰撞体 (Helper)
   * @param {boolean} isStatic 
   * @returns 
   */
  static(isStatic = true) {
    return this.create({ isStatic });
  },

  /**
   * 快捷创建触发器 (Helper)
   * @param {boolean} isTrigger 
   * @returns 
   */
  trigger(isTrigger = true) {
    return this.create({ isTrigger });
  }
};

/**
 * Collider 通用属性字段，用于编辑器 Inspector 面板
 */
export const COLLIDER_INSPECTOR_FIELDS = [
  { path: 'collider.shapeId', label: '引用形状ID', type: 'string', tip: '引用 Shape 组件中定义的形状 Key (默认: body)', group: '碰撞体 (Collider)' },
  { path: 'collider.isStatic', label: '是否静态', type: 'boolean', tip: '静态物体(如墙壁)质量无穷大，不会被推走；动态物体(如角色)会被碰撞推开', group: '碰撞体 (Collider)' },
  { path: 'collider.isTrigger', label: '是否触发器', type: 'boolean', tip: '勾选后只产生重叠事件(OnTrigger)，不产生物理阻挡(推挤)效果', group: '碰撞体 (Collider)' },
  { path: 'collider.layer', label: '碰撞层级', type: 'number', props: { step: 1 }, tip: '位掩码: 所在的层', group: '碰撞体 (Collider)' },
  { path: 'collider.mask', label: '碰撞掩码', type: 'number', props: { step: 1 }, tip: '位掩码: 与哪些层碰撞', group: '碰撞体 (Collider)' }
];
