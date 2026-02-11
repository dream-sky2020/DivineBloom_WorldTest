import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { DetectionLayer } from './Detectable';

const portalDetectableSchema = z.object({
  labels: z.array(z.string()).default([]),
  ccdEnabled: z.boolean().default(false),
  layer: z.number().default(DetectionLayer.PLAYER)
});

export type PortalDetectableData = z.infer<typeof portalDetectableSchema>;
export type PortalDetectableRuntimeData = PortalDetectableData & {
  // 双缓冲命中集合：仅运行时使用，不参与序列化
  lastHits: Set<string>;
  activeHits: Set<string>;
};

export const PortalDetectable: IComponentDefinition<typeof portalDetectableSchema, PortalDetectableRuntimeData> = {
  name: 'PortalDetectable',
  schema: portalDetectableSchema,
  create(labelsOrConfig: string[] | string | Partial<PortalDetectableData> = []) {
    let config: any = {};
    if (Array.isArray(labelsOrConfig)) {
      config = { labels: labelsOrConfig };
    } else if (typeof labelsOrConfig === 'string') {
      config = { labels: [labelsOrConfig] };
    } else {
      config = labelsOrConfig;
    }
    const parsed = portalDetectableSchema.parse(config);
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
    { path: 'portalDetectable.labels', label: '被传送门探测标签', type: 'json', tip: '定义我在传送门探测中的身份', group: '被探测属性 (PortalDetectable)' },
    { path: 'portalDetectable.layer', label: '层级位掩码', type: 'number', props: { step: 1 }, tip: '位掩码 (Bitmask): 我属于哪一层', group: '被探测属性 (PortalDetectable)' },
    { path: 'portalDetectable.ccdEnabled', label: '高速检测', type: 'checkbox', tip: '允许被传送门 CCD 探测', group: '被探测属性 (PortalDetectable)' }
  ]
};

export const PortalDetectableSchema = portalDetectableSchema;
export const PORTAL_DETECTABLE_INSPECTOR_FIELDS = PortalDetectable.inspectorFields;
