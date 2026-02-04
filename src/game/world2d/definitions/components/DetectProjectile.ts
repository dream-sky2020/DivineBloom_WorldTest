import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const detectProjectileSchema = z.object({
  // CCD 状态: 记录上一帧位置，用于构建射线段
  prevPosition: z.object({ 
    x: z.number(), 
    y: z.number() 
  }).optional(),

  // 检测配置 (模仿 DetectArea)
  target: z.union([z.string(), z.array(z.string())]).default('detectable'),
  includeTags: z.array(z.string()).default([]),
  excludeTags: z.array(z.string()).default(['ghost']),
  
  // 调试配置
  debugColor: z.string().optional(),

  // 结果列表
  results: z.array(z.any()).default([])
});

export type DetectProjectileData = z.infer<typeof detectProjectileSchema>;

export const DetectProjectile: IComponentDefinition<typeof detectProjectileSchema, DetectProjectileData> = {
  name: 'DetectProjectile',
  schema: detectProjectileSchema,
  create(config: Partial<DetectProjectileData> = {}) {
    return detectProjectileSchema.parse(config);
  },
  serialize(component) {
      // results 和 prevPosition 是运行时状态，不需要保存
    return {
        target: component.target,
        includeTags: component.includeTags,
        excludeTags: component.excludeTags,
        debugColor: component.debugColor,
        results: []
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const DetectProjectileSchema = detectProjectileSchema;
