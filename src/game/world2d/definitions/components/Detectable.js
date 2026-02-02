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

export const DETECTABLE_INSPECTOR_FIELDS = [
  { path: 'detectable.labels', label: '被探测标签', type: 'json', tip: '定义我是什么 (例如: ["player", "enemy"])', group: '被探测属性 (Detectable)' },
  { path: 'detectable.type', label: '身体形状', type: 'enum', options: { ...ShapeType, POINT: 'point' }, tip: 'point:点(极小圆), 其他为物理形状', group: '被探测属性 (Detectable)' },
  { path: 'detectable.radius', label: '身体半径', type: 'number', props: { min: 0 }, tip: '[Circle] 有效，定义身体占据空间的大小', group: '被探测属性 (Detectable)' },
  { path: 'detectable.width', label: '身体宽度', type: 'number', props: { min: 0 }, tip: '[AABB] 有效', group: '被探测属性 (Detectable)' },
  { path: 'detectable.height', label: '身体高度', type: 'number', props: { min: 0 }, tip: '[AABB] 有效', group: '被探测属性 (Detectable)' },
  { path: 'detectable.offsetX', label: '身体偏移 X', type: 'number', group: '被探测属性 (Detectable)' },
  { path: 'detectable.offsetY', label: '身体偏移 Y', type: 'number', group: '被探测属性 (Detectable)' }
];
