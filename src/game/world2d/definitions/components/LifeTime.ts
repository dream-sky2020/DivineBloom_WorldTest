import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const lifeTimeSchema = z.object({
  maxTime: z.number().min(0).default(3),      // 最大生命时间（秒）
  currentTime: z.number().min(0).default(3),  // 当前剩余时间（秒）
  autoRemove: z.boolean().default(true)       // 时间耗尽时是否自动删除
});

export type LifeTimeData = z.infer<typeof lifeTimeSchema>;

export const LifeTime: IComponentDefinition<typeof lifeTimeSchema, LifeTimeData> = {
  name: 'LifeTime',
  schema: lifeTimeSchema,
  create(maxTime: number | Partial<LifeTimeData> = 3, autoRemove: boolean = true) {
    if (typeof maxTime === 'object') {
        return lifeTimeSchema.parse(maxTime);
    }
    return lifeTimeSchema.parse({
      maxTime,
      currentTime: maxTime,
      autoRemove
    });
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'lifeTime.maxTime', label: '生命周期', type: 'number', tip: '秒', props: { min: 0, step: 0.1 }, group: '生命周期 (LifeTime)' },
    { path: 'lifeTime.autoRemove', label: '自动删除', type: 'boolean', group: '生命周期 (LifeTime)' }
  ]
};

export const LifeTimeSchema = lifeTimeSchema;
export const LIFETIME_INSPECTOR_FIELDS = LifeTime.inspectorFields;
