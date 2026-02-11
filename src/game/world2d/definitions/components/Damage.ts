import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const damageSchema = z.object({
  // 本循环累计受到的伤害（由伤害系统写入，结算后应清零）
  pendingDamage: z.number().min(0).default(0),
  // 本循环命中次数（可用于调试或触发特效）
  hitCount: z.number().int().min(0).default(0),
  // 是否在本循环发生过受击
  hasDamageThisTick: z.boolean().default(false)
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
    { path: 'damage.pendingDamage', label: '待结算伤害', type: 'number', props: { min: 0, step: 1 }, group: '伤害 (Damage)' },
    { path: 'damage.hitCount', label: '命中次数', type: 'number', props: { min: 0, step: 1 }, group: '伤害 (Damage)' },
    { path: 'damage.hasDamageThisTick', label: '本循环受击', type: 'checkbox', group: '伤害 (Damage)' }
  ]
};

export const DamageSchema = damageSchema;
export const DAMAGE_INSPECTOR_FIELDS = Damage.inspectorFields;
