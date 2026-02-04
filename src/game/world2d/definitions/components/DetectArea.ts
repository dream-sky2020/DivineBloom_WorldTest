import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const detectAreaSchema = z.object({
  shapeId: z.string().default('sensor'),
  target: z.union([z.string(), z.array(z.string())]).default('detectable'),
  includeTags: z.array(z.string()).default([]),
  excludeTags: z.array(z.string()).default(['ghost']),
  results: z.array(z.any()).default([])
});

export type DetectAreaData = z.infer<typeof detectAreaSchema>;

export const DetectArea: IComponentDefinition<typeof detectAreaSchema, DetectAreaData> = {
  name: 'DetectArea',
  schema: detectAreaSchema,
  create(config: Partial<DetectAreaData> = {}) {
    return detectAreaSchema.parse(config);
  },
  serialize(component) {
      // results 是运行时数据，不需要保存
      return {
          shapeId: component.shapeId,
          target: component.target,
          includeTags: component.includeTags,
          excludeTags: component.excludeTags,
          results: []
      };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'detectArea.shapeId', label: '引用形状ID', type: 'string', tip: '引用 Shape 组件中定义的形状 Key (默认: sensor)', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.target', label: '主要目标', type: 'string', tip: '主要探测的目标标签 (如 "player")', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.includeTags', label: '包含标签', type: 'json', tip: '额外包含的标签列表', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.excludeTags', label: '排除标签', type: 'json', tip: '排除的标签列表', group: '探测逻辑 (DetectArea)' }
  ]
};

export const DetectAreaSchema = detectAreaSchema;
export const DETECT_AREA_INSPECTOR_FIELDS = DetectArea.inspectorFields;
