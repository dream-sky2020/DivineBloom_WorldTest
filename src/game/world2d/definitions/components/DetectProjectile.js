import { z } from 'zod';

// --- DetectProjectile Schema Definitions ---

export const DetectProjectileSchema = z.object({
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

// --- Factory ---

export const DetectProjectile = (config = {}) => {
  const result = DetectProjectileSchema.safeParse(config);
  if (!result.success) {
    console.warn('[DetectProjectile] validation failed', result.error);
    return DetectProjectileSchema.parse({});
  }
  return result.data;
}
