import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const bounceSchema = z.object({
  enabled: z.boolean().default(false),               // 是否启用反弹逻辑
  remainingBounces: z.number().default(0),           // 剩余可反弹次数
  maxBounces: z.number().default(0),                 // 初始/最大反弹次数
  damping: z.number().default(1),                    // 反弹后速度保留系数（1=不衰减）
  friction: z.number().default(0),                   // 反弹时切向摩擦
  minSpeed: z.number().default(0),                   // 低于该速度时不再反弹
  angleRandomness: z.number().default(0),            // 反弹角随机扰动强度
  onWorldBounds: z.boolean().default(true),          // 是否可在世界边界反弹
  onStatic: z.boolean().default(true),               // 是否可在静态碰撞体上反弹
  onDynamic: z.boolean().default(false)              // 是否可在动态碰撞体上反弹
});

export type BounceData = z.infer<typeof bounceSchema>;

export const Bounce: IComponentDefinition<typeof bounceSchema, BounceData> = {
  name: 'Bounce',
  schema: bounceSchema,
  create(data: Partial<BounceData> = {}) {
    return bounceSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'bounce.enabled', label: '启用反弹', type: 'checkbox', group: '反弹 (Bounce)' },
    { path: 'bounce.remainingBounces', label: '剩余反弹次数', type: 'number', group: '反弹 (Bounce)' },
    { path: 'bounce.maxBounces', label: '最大反弹次数', type: 'number', group: '反弹 (Bounce)' },
    { path: 'bounce.damping', label: '反弹衰减', type: 'number', group: '反弹 (Bounce)' },
    { path: 'bounce.friction', label: '反弹摩擦', type: 'number', group: '反弹 (Bounce)' },
    { path: 'bounce.onWorldBounds', label: '边界反弹', type: 'checkbox', group: '反弹 (Bounce)' }
  ]
};

export const BounceSchema = bounceSchema;
export const BOUNCE_INSPECTOR_FIELDS = Bounce.inspectorFields;
