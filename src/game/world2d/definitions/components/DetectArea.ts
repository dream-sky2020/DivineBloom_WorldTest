import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
const detectAreaSchema = z.object({
  target: z.union([z.string(), z.array(z.string())]).default('detectable'),
  includeTags: z.array(z.string()).default([]),
  excludeTags: z.array(z.string()).default(['ghost']),
  ccdEnabled: z.boolean().default(false),
  ccdMinDistance: z.number().default(0),
  ccdBuffer: z.number().default(0),
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
          target: component.target,
          includeTags: component.includeTags,
          excludeTags: component.excludeTags,
          ccdEnabled: component.ccdEnabled,
          ccdMinDistance: component.ccdMinDistance,
          ccdBuffer: component.ccdBuffer,
          results: []
      };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'detectArea.target', label: '主要目标', type: 'string', tip: '主要探测的目标标签 (如 "player")', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.includeTags', label: '包含标签', type: 'json', tip: '额外包含的标签列表', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.excludeTags', label: '排除标签', type: 'json', tip: '排除的标签列表', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.ccdEnabled', label: '高速检测', type: 'checkbox', tip: '启用连续碰撞检测 (CCD)', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.ccdMinDistance', label: 'CCD 最小距离', type: 'number', props: { min: 0, step: 1 }, tip: '本帧位移小于该值时使用普通检测', group: '探测逻辑 (DetectArea)' },
    { path: 'detectArea.ccdBuffer', label: 'CCD 缓冲', type: 'number', props: { step: 0.5 }, tip: '扩大检测半径，避免高速穿透', group: '探测逻辑 (DetectArea)' }
  ]
};

export const DetectAreaSchema = detectAreaSchema;
export const DETECT_AREA_INSPECTOR_FIELDS = DetectArea.inspectorFields;
