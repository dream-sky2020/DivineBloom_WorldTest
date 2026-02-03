import { z } from 'zod';

export const LocalTransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  rotation: z.number().default(0)
});

export function LocalTransform(x = 0, y = 0, rotation = 0) {
  return LocalTransformSchema.parse({ x, y, rotation });
}

export const LOCAL_TRANSFORM_INSPECTOR_FIELDS = [
  { path: 'localTransform.x', label: '相对坐标 X', type: 'number', group: '本地变换 (LocalTransform)' },
  { path: 'localTransform.y', label: '相对坐标 Y', type: 'number', group: '本地变换 (LocalTransform)' },
  { path: 'localTransform.rotation', label: '相对旋转', type: 'number', props: { step: 0.1 }, group: '本地变换 (LocalTransform)' }
];
