import { z } from 'zod';

export const DetectAreaSchema = z.object({
  // 引用 Shape 组件中的哪个形状
  shapeId: z.string().default('sensor'),

  // 逻辑属性
  target: z.union([z.string(), z.array(z.string())]).default('detectable'), // 指向 entity.tags 中的标签
  includeTags: z.array(z.string()).default([]),
  excludeTags: z.array(z.string()).default(['ghost']),

  // Runtime state
  results: z.array(z.any()).default([])
});

export const DetectArea = (config = {}) => {
  // 兼容旧逻辑：如果传入了 shape 相关参数，在此处忽略，或打印警告
  // 实际上由于是重构，我们直接返回符合新 Schema 的对象
  const result = DetectAreaSchema.safeParse(config);

  if (result.success) {
    return result.data;
  } else {
    console.error('[DetectArea] Schema validation failed', result.error);
    return DetectAreaSchema.parse({});
  }
}

/**
 * DetectArea 通用属性字段，用于编辑器 Inspector 面板
 */
export const DETECT_AREA_INSPECTOR_FIELDS = [
  { path: 'detectArea.shapeId', label: '引用形状ID', type: 'string', tip: '引用 Shape 组件中定义的形状 Key (默认: sensor)', group: '探测逻辑 (DetectArea)' },
  { path: 'detectArea.target', label: '主要目标', type: 'string', tip: '主要探测的目标标签 (如 "player")', group: '探测逻辑 (DetectArea)' },
  { path: 'detectArea.includeTags', label: '包含标签', type: 'json', tip: '额外包含的标签列表', group: '探测逻辑 (DetectArea)' },
  { path: 'detectArea.excludeTags', label: '排除标签', type: 'json', tip: '排除的标签列表', group: '探测逻辑 (DetectArea)' }
];
