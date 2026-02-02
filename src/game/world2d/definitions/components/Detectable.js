import { z } from 'zod';
import { ShapeType } from '../enums/Shape';

export const DetectableSchema = z.object({
  labels: z.array(z.string()).default([]),
  // 扩展支持所有物理形状，保留 point 作为默认
  type: z.union([z.literal('point'), z.nativeEnum(ShapeType)]).default('point'),
  radius: z.number().default(0),
  width: z.number().default(0),
  height: z.number().default(0),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0)
});

export const Detectable = (labels = [], type = 'point') => {
  const config = Array.isArray(labels) ? { labels, type } : { labels: [labels], type };
  const result = DetectableSchema.safeParse(config);
  if (!result.success) {
    console.warn('[Detectable] Validation failed', result.error);
    return DetectableSchema.parse({});
  }
  return result.data;
}
