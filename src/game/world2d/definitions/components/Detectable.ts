import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const detectableSchema = z.object({
  labels: z.array(z.string()).default([]),
  ccdEnabled: z.boolean().default(false)
});

export type DetectableData = z.infer<typeof detectableSchema>;

export const Detectable: IComponentDefinition<typeof detectableSchema, DetectableData> = {
  name: 'Detectable',
  schema: detectableSchema,
  create(labelsOrConfig: string[] | string | Partial<DetectableData> = []) {
    let config: any = {};
    if (Array.isArray(labelsOrConfig)) {
        config = { labels: labelsOrConfig };
    } else if (typeof labelsOrConfig === 'string') {
        config = { labels: [labelsOrConfig] };
    } else {
        config = labelsOrConfig;
    }
    return detectableSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'detectable.labels', label: '被探测标签', type: 'json', tip: '定义我是什么 (例如: ["player", "enemy"])', group: '被探测属性 (Detectable)' },
    { path: 'detectable.ccdEnabled', label: '高速检测', type: 'checkbox', tip: '允许被 CCD 探测', group: '被探测属性 (Detectable)' }
  ]
};

export const DetectableSchema = detectableSchema;
export const DETECTABLE_INSPECTOR_FIELDS = Detectable.inspectorFields;
