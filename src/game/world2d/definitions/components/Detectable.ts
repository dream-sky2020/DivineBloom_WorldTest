import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

/**
 * 探测层级位掩码 (Bitmask)
 * 用于表示实体属于哪些探测分类
 */
export enum DetectionLayer {
  NONE = 0,
  PLAYER = 1 << 0,   // 1
  ENEMY = 1 << 1,    // 2
  ALL = 0xFFFFFFFF
}

const detectableSchema = z.object({
  labels: z.array(z.string()).default([]),
  ccdEnabled: z.boolean().default(false),
  layer: z.number().default(DetectionLayer.PLAYER)
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
    { path: 'detectable.layer', label: '层级位掩码', type: 'number', props: { step: 1 }, tip: '位掩码 (Bitmask): 我属于哪一层 (Player=1, Enemy=2, NPC=4)', group: '被探测属性 (Detectable)' },
    { path: 'detectable.ccdEnabled', label: '高速检测', type: 'checkbox', tip: '允许被 CCD 探测', group: '被探测属性 (Detectable)' }
  ]
};

export const DetectableSchema = detectableSchema;
export const DETECTABLE_INSPECTOR_FIELDS = Detectable.inspectorFields;
