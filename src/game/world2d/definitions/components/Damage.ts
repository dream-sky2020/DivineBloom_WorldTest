import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const damageSchema = z.object({
  sourceId: z.string().nullable().default(null),       // 伤害来源实体 ID（用于识别归属）
  amount: z.number().default(10),                      // 基础伤害
  maxHitCount: z.number().int().min(0).default(1),     // 最大可命中次数（0=不造成伤害）
  remainingHitCount: z.number().int().min(0).default(1), // 剩余可命中次数
  knockback: z.number().default(0),                    // 击退强度
  criticalChance: z.number().default(0),               // 暴击概率（0~1）
  criticalMultiplier: z.number().default(1.5),         // 暴击倍率
  armorPenetration: z.number().default(0),             // 护甲穿透值
  damageFalloffPerHit: z.number().default(0),          // 每次命中后伤害衰减
  minDamage: z.number().default(0)                    // 伤害下限
});

export type DamageData = z.infer<typeof damageSchema>;

export const Damage: IComponentDefinition<typeof damageSchema, DamageData> = {
  name: 'Damage',
  schema: damageSchema,
  create(data: Partial<DamageData> = {}) {
    return damageSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'damage.sourceId', label: '来源 ID', type: 'text', group: '伤害输出 (Damage)' },
    { path: 'damage.amount', label: '基础伤害', type: 'number', props: { step: 1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.maxHitCount', label: '最大命中次数', type: 'number', props: { min: 0, step: 1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.remainingHitCount', label: '剩余命中次数', type: 'number', props: { min: 0, step: 1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.knockback', label: '击退', type: 'number', props: { step: 1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.criticalChance', label: '暴击率', type: 'number', props: { step: 0.01, min: 0, max: 1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.criticalMultiplier', label: '暴击倍率', type: 'number', props: { step: 0.1, min: 1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.armorPenetration', label: '护甲穿透', type: 'number', props: { step: 1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.damageFalloffPerHit', label: '每次命中衰减', type: 'number', props: { step: 0.1 }, group: '伤害输出 (Damage)' },
    { path: 'damage.minDamage', label: '最小伤害', type: 'number', props: { step: 1, min: 0 }, group: '伤害输出 (Damage)' }
  ]
};

export const DamageSchema = damageSchema;
export const DAMAGE_INSPECTOR_FIELDS = Damage.inspectorFields;
