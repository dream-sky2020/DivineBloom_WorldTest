import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { DetectionLayer } from './Detectable';

const damageDetectableSchema = z.object({
  labels: z.array(z.string()).default([]),
  ccdEnabled: z.boolean().default(false),
  layer: z.number().default(DetectionLayer.PLAYER)
});

export type DamageDetectableData = z.infer<typeof damageDetectableSchema>;
export type DamageDetectableRuntimeData = DamageDetectableData & {
  // 双缓冲命中集合：仅运行时使用，不参与序列化
  lastHits: Set<string>;
  activeHits: Set<string>;
};

export const DamageDetectable: IComponentDefinition<typeof damageDetectableSchema, DamageDetectableRuntimeData> = {
  name: 'DamageDetectable',
  schema: damageDetectableSchema,
  create(labelsOrConfig: string[] | string | Partial<DamageDetectableData> = []) {
    let config: any = {};
    if (Array.isArray(labelsOrConfig)) {
      config = { labels: labelsOrConfig };
    } else if (typeof labelsOrConfig === 'string') {
      config = { labels: [labelsOrConfig] };
    } else {
      config = labelsOrConfig;
    }
    const parsed = damageDetectableSchema.parse(config);
    return {
      ...parsed,
      lastHits: new Set<string>(),
      activeHits: new Set<string>()
    };
  },
  serialize(component) {
    return {
      labels: component.labels,
      ccdEnabled: component.ccdEnabled,
      layer: component.layer
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'damageDetectable.labels', label: '被子弹探测标签', type: 'json', tip: '定义我在子弹探测中的身份', group: '被探测属性 (DamageDetectable)' },
    { path: 'damageDetectable.layer', label: '层级位掩码', type: 'number', props: { step: 1 }, tip: '位掩码 (Bitmask): 我属于哪一层', group: '被探测属性 (DamageDetectable)' },
    { path: 'damageDetectable.ccdEnabled', label: '高速检测', type: 'checkbox', tip: '允许被子弹 CCD 探测', group: '被探测属性 (DamageDetectable)' }
  ]
};

export const DamageDetectableSchema = damageDetectableSchema;
export const DAMAGE_DETECTABLE_INSPECTOR_FIELDS = DamageDetectable.inspectorFields;
