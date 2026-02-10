import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const healthSchema = z.object({
  maxHealth: z.number().min(1).default(100), // 最大血量
  currentHealth: z.number().default(100), // 当前血量
  autoDestroyOnDepleted: z.boolean().default(true) // 血量归零后是否自动销毁
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
    { path: 'health.maxHealth', label: '最大血量', type: 'number', props: { min: 1, step: 10 }, group: '血量 (Health)' },
    { path: 'health.currentHealth', label: '当前血量', type: 'number', props: { step: 10 }, group: '血量 (Health)' },
    { path: 'health.autoDestroyOnDepleted', label: '归零自动销毁', type: 'checkbox', group: '血量 (Health)' }
  ]
};

export const HealthSchema = healthSchema;
export const HEALTH_INSPECTOR_FIELDS = Health.inspectorFields;
