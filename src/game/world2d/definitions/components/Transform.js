import { z } from 'zod';

export const TransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0)
});

export function Transform(x = 0, y = 0) {
  return TransformSchema.parse({ x, y });
}

export const TRANSFORM_INSPECTOR_FIELDS = [
  { path: 'transform.x', label: '坐标 X', type: 'number', group: '变换 (Transform)' },
  { path: 'transform.y', label: '坐标 Y', type: 'number', group: '变换 (Transform)' }
];