import { z } from 'zod';

export const DetectableSchema = z.object({
  // 引用 Shape 组件中的哪个形状 (作为被击判定)
  shapeId: z.string().default('body'),
  
  labels: z.array(z.string()).default([])
});

export const Detectable = (labels = []) => {
  const config = Array.isArray(labels) ? { labels } : { labels: [labels] };
  const result = DetectableSchema.safeParse(config);
  if (!result.success) {
    console.warn('[Detectable] Validation failed', result.error);
    return DetectableSchema.parse({});
  }
  return result.data;
}

export const DETECTABLE_INSPECTOR_FIELDS = [
  { path: 'detectable.shapeId', label: '引用形状ID', type: 'string', tip: '引用 Shape 组件中定义的形状 Key (默认: body)', group: '被探测属性 (Detectable)' },
  { path: 'detectable.labels', label: '被探测标签', type: 'json', tip: '定义我是什么 (例如: ["player", "enemy"])', group: '被探测属性 (Detectable)' }
];
