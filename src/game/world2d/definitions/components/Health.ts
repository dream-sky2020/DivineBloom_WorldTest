import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const healthSchema = z.object({
  // 基础状态
  maxHealth: z.number().min(1).default(100), // 最大血量
  currentHealth: z.number().default(100), // 当前血量
  autoDestroyOnDepleted: z.boolean().default(true), // 血量归零后是否自动销毁

  // 受击配置 (原 HitVolume)
  hitVolume: z.number().int().min(1).default(1), // 单次接触可吃的最大段数

  // 统计信息 (原 Damaged)
  totalDamageTaken: z.number().min(0).default(0), // 累计受伤
  totalHitCount: z.number().int().min(0).default(0), // 累计受击次数
  lastDamageAmount: z.number().min(0).default(0), // 最近一次伤害
  lastHitCount: z.number().int().min(0).default(0), // 最近一次受击数
  lastDamageTick: z.number().int().min(0).default(0) // 最近结算 Tick
});

export type HealthData = z.infer<typeof healthSchema>;

export const Health: IComponentDefinition<typeof healthSchema, HealthData> = {
  name: 'Health',
  schema: healthSchema,
  create(data: Partial<HealthData> = {}) {
    return healthSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'health.maxHealth', label: '最大血量', type: 'number', props: { min: 1, step: 10 }, group: '角色状态 (Health)' },
    { path: 'health.currentHealth', label: '当前血量', type: 'number', props: { step: 10 }, group: '角色状态 (Health)' },
    { path: 'health.autoDestroyOnDepleted', label: '归零自动销毁', type: 'checkbox', group: '角色状态 (Health)' },
    
    { path: 'health.hitVolume', label: '受击容量', type: 'number', props: { min: 1, step: 1 }, tip: '单次接触可受伤害的最大段数', group: '受击配置 (Health)' },

    { path: 'health.totalDamageTaken', label: '累计受伤', type: 'number', props: { readonly: true, min: 0, step: 1 }, group: '伤害统计 (Health)' },
    { path: 'health.totalHitCount', label: '累计受击次数', type: 'number', props: { readonly: true, min: 0, step: 1 }, group: '伤害统计 (Health)' },
    { path: 'health.lastDamageAmount', label: '最近一次伤害', type: 'number', props: { readonly: true, min: 0, step: 1 }, group: '伤害统计 (Health)' },
    { path: 'health.lastHitCount', label: '最近一次受击数', type: 'number', props: { readonly: true, min: 0, step: 1 }, group: '伤害统计 (Health)' },
    { path: 'health.lastDamageTick', label: '最近结算 Tick', type: 'number', props: { readonly: true, min: 0, step: 1 }, group: '伤害统计 (Health)' }
  ]
};

export const HealthSchema = healthSchema;
export const HEALTH_INSPECTOR_FIELDS = Health.inspectorFields;
