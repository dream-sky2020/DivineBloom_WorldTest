import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { DetectionLayer } from './Detectable';

const damageDetectLiteResultSchema = z.object({
  id: z.string(),
  uuid: z.string().optional(),
  type: z.string().optional(),
  labels: z.array(z.string()).optional()
});

const damageDetectSchema = z.object({
  layerMask: z.number().default(DetectionLayer.ALL),
  ccdEnabled: z.boolean().default(false),
  ccdMinDistance: z.number().default(0),
  ccdBuffer: z.number().default(0),
  resultMode: z.enum(['id', 'lite']).default('id'),
  results: z.array(z.union([z.string(), damageDetectLiteResultSchema])).default([]),
  fullResults: z.array(z.any()).default([])
});

export type DamageDetectLiteResult = z.infer<typeof damageDetectLiteResultSchema>;
export type DamageDetectData = z.infer<typeof damageDetectSchema>;
export type DamageDetectRuntimeData = DamageDetectData & {
  // 双缓冲命中集合：仅运行时使用，不参与序列化
  lastHits: Set<string>;
  activeHits: Set<string>;
};

export const DamageDetect: IComponentDefinition<typeof damageDetectSchema, DamageDetectRuntimeData> = {
  name: 'DamageDetect',
  schema: damageDetectSchema,
  create(config: Partial<DamageDetectData> = {}) {
    const parsed = damageDetectSchema.parse(config);
    return {
      ...parsed,
      lastHits: new Set<string>(),
      activeHits: new Set<string>()
    };
  },
  serialize(component) {
    // results 是运行时数据，不需要保存
    return {
      layerMask: component.layerMask,
      ccdEnabled: component.ccdEnabled,
      ccdMinDistance: component.ccdMinDistance,
      ccdBuffer: component.ccdBuffer,
      resultMode: component.resultMode,
      results: [],
      fullResults: []
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'damageDetect.layerMask', label: '层级位掩码', type: 'number', props: { step: 1 }, tip: '按 Detectable.layer 进行位掩码过滤', group: '探测逻辑 (DamageDetect)' },
    { path: 'damageDetect.ccdEnabled', label: '高速检测', type: 'checkbox', tip: '启用连续碰撞检测 (CCD)', group: '探测逻辑 (DamageDetect)' },
    { path: 'damageDetect.ccdMinDistance', label: 'CCD 最小距离', type: 'number', props: { min: 0, step: 1 }, tip: '本帧位移小于该值时使用普通检测', group: '探测逻辑 (DamageDetect)' },
    { path: 'damageDetect.ccdBuffer', label: 'CCD 缓冲', type: 'number', props: { step: 0.5 }, tip: '扩大检测半径，避免高速穿透', group: '探测逻辑 (DamageDetect)' },
    { path: 'damageDetect.resultMode', label: '结果模式', type: 'select', props: { options: ['id', 'lite'] }, tip: 'id=仅存 UUID，lite=存最小结果对象', group: '探测逻辑 (DamageDetect)' }
  ]
};

export const DamageDetectSchema = damageDetectSchema;
export const DAMAGE_DETECT_INSPECTOR_FIELDS = DamageDetect.inspectorFields;
