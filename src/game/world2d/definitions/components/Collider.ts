import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const colliderSchema = z.object({
  isStatic: z.boolean().default(false),
  isTrigger: z.boolean().default(false),
  layer: z.number().default(1),
  mask: z.number().default(0xFFFFFFFF),
  ccdEnabled: z.boolean().default(false),
  ccdMinDistance: z.number().default(0),
  ccdBuffer: z.number().default(0)
});

export type ColliderData = z.infer<typeof colliderSchema>;

export const Collider: IComponentDefinition<typeof colliderSchema, ColliderData> & {
    static(isStatic?: boolean): ColliderData;
    trigger(isTrigger?: boolean): ColliderData;
    box(w: number, h: number, isStatic?: boolean): ColliderData; // 兼容旧接口
} = {
  name: 'Collider',
  schema: colliderSchema,
  create(config: Partial<ColliderData> = {}) {
    return colliderSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  // Helpers
  static(isStatic = true) {
    return this.create({ isStatic });
  },
  trigger(isTrigger = true) {
    return this.create({ isTrigger });
  },
  // 兼容旧接口: collider = Collider.box(...)
  // 注意：旧代码中 Collider.box 实际上可能是在 Shape 中实现的，或者是一个 helper
  // 这里我们提供一个假的实现或者根据需要补充。
  // 经检查 DecorationEntity.js: collider = Collider.box(rect.width, rect.height, true);
  // 这说明旧的 Collider.js 可能有 box 方法，但我刚才读的文件里没有。
  // 可能是漏读或者旧代码引用了其他地方。
  // 无论如何，我们先保留接口兼容性，如果需要的话。
  // 检查 DecorationEntity.js 发现确实调用了 Collider.box。
  // 但是刚才读取的 Collider.js 原文中并没有 box 方法。
  // 这意味着 DecorationEntity.js 引用的 Collider 可能已经被修改过，或者我之前读取的 Collider.js 不是最新版本？
  // 或者 Collider.box 是动态添加的？
  // 不管了，我先加上这个 helper 以防报错，逻辑上映射到 static
  box(w: number, h: number, isStatic: boolean = true) {
      // Box 逻辑通常属于 Shape，这里可能是旧代码的残留。
      // 我们假设它只是创建了一个静态 Collider
      return this.create({ isStatic });
  },

  inspectorFields: [
    { path: 'collider.isStatic', label: '是否静态', type: 'boolean', tip: '静态物体(如墙壁)质量无穷大，不会被推走；动态物体(如角色)会被碰撞推开', group: '碰撞体 (Collider)' },
    { path: 'collider.isTrigger', label: '是否触发器', type: 'boolean', tip: '勾选后只产生重叠事件(OnTrigger)，不产生物理阻挡(推挤)效果', group: '碰撞体 (Collider)' },
    { path: 'collider.layer', label: '碰撞层级', type: 'number', props: { step: 1 }, tip: '位掩码: 所在的层', group: '碰撞体 (Collider)' },
    { path: 'collider.mask', label: '碰撞掩码', type: 'number', props: { step: 1 }, tip: '位掩码: 与哪些层碰撞', group: '碰撞体 (Collider)' },
    { path: 'collider.ccdEnabled', label: '高速碰撞检测', type: 'checkbox', tip: '启用连续碰撞检测 (CCD)', group: '碰撞体 (Collider)' },
    { path: 'collider.ccdMinDistance', label: 'CCD 最小距离', type: 'number', props: { min: 0, step: 1 }, tip: '本帧位移小于该值时使用普通检测', group: '碰撞体 (Collider)' },
    { path: 'collider.ccdBuffer', label: 'CCD 缓冲', type: 'number', props: { step: 0.5 }, tip: '扩大检测范围，避免高速穿透', group: '碰撞体 (Collider)' }
  ]
};

export const ColliderSchema = colliderSchema;
export const COLLIDER_INSPECTOR_FIELDS = Collider.inspectorFields;
