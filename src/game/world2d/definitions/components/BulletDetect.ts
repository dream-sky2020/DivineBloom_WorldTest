import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { DetectionLayer } from './Detectable';

const bulletDetectLiteResultSchema = z.object({
  id: z.string(),
  uuid: z.string().optional(),
  type: z.string().optional(),
  labels: z.array(z.string()).optional()
});

const bulletDetectSchema = z.object({
  layerMask: z.number().default(DetectionLayer.ALL),
  ccdEnabled: z.boolean().default(false),
  ccdMinDistance: z.number().default(0),
  ccdBuffer: z.number().default(0),
  resultMode: z.enum(['id', 'lite']).default('id'),
  results: z.array(z.union([z.string(), bulletDetectLiteResultSchema])).default([]),
  fullResults: z.array(z.any()).default([])
});

export type BulletDetectLiteResult = z.infer<typeof bulletDetectLiteResultSchema>;
export type BulletDetectData = z.infer<typeof bulletDetectSchema>;

export const BulletDetect: IComponentDefinition<typeof bulletDetectSchema, BulletDetectData> = {
  name: 'BulletDetect',
  schema: bulletDetectSchema,
  create(config: Partial<BulletDetectData> = {}) {
    return bulletDetectSchema.parse(config);
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
    { path: 'bulletDetect.layerMask', label: '层级位掩码', type: 'number', props: { step: 1 }, tip: '按 Detectable.layer 进行位掩码过滤', group: '探测逻辑 (BulletDetect)' },
    { path: 'bulletDetect.ccdEnabled', label: '高速检测', type: 'checkbox', tip: '启用连续碰撞检测 (CCD)', group: '探测逻辑 (BulletDetect)' },
    { path: 'bulletDetect.ccdMinDistance', label: 'CCD 最小距离', type: 'number', props: { min: 0, step: 1 }, tip: '本帧位移小于该值时使用普通检测', group: '探测逻辑 (BulletDetect)' },
    { path: 'bulletDetect.ccdBuffer', label: 'CCD 缓冲', type: 'number', props: { step: 0.5 }, tip: '扩大检测半径，避免高速穿透', group: '探测逻辑 (BulletDetect)' },
    { path: 'bulletDetect.resultMode', label: '结果模式', type: 'select', props: { options: ['id', 'lite'] }, tip: 'id=仅存 UUID，lite=存最小结果对象', group: '探测逻辑 (BulletDetect)' }
  ]
};

export const BulletDetectSchema = bulletDetectSchema;
export const BULLET_DETECT_INSPECTOR_FIELDS = BulletDetect.inspectorFields;
