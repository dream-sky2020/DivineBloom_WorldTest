import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const detectableSchema = z.object({
  shapeId: z.string().default('body'),
  labels: z.array(z.string()).default([])
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
    { path: 'detectable.shapeId', label: '引用形状ID', type: 'string', tip: '引用 Shape 组件中定义的形状 Key (默认: body)', group: '被探测属性 (Detectable)' },
    { path: 'detectable.labels', label: '被探测标签', type: 'json', tip: '定义我是什么 (例如: ["player", "enemy"])', group: '被探测属性 (Detectable)' }
  ]
};

export const DetectableSchema = detectableSchema;
export const DETECTABLE_INSPECTOR_FIELDS = Detectable.inspectorFields;
