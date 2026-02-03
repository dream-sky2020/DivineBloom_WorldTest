import { z } from 'zod';
import { ShapeType } from '../enums/Shape';

/**
 * Shape 基础数据结构
 * 仅包含几何信息，不包含逻辑（如 Trigger）或物理材质（如 Friction）
 */
export const ShapeSchema = z.object({
  type: z.nativeEnum(ShapeType).default(ShapeType.CIRCLE),
  
  // 尺寸参数
  radius: z.number().default(0),      // Circle, Capsule
  width: z.number().default(0),       // AABB, OBB
  height: z.number().default(0),      // AABB, OBB
  
  // 变换参数 (相对于 Entity Transform，或者相对于 Parent Transform)
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  rotation: z.number().default(0),    // OBB, Capsule
  
  // 胶囊体特有 (局部坐标线段)
  p1: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: -10 }),
  p2: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 10 }),
  
  // 调试辅助
  debugColor: z.string().optional()
});

export const Shape = (config = {}) => {
  const result = ShapeSchema.safeParse(config);
  if (result.success) {
    return result.data;
  } else {
    console.error('[Shape] Validation failed', result.error);
    return ShapeSchema.parse({});
  }
};

export const SHAPE_INSPECTOR_FIELDS = [
  { path: 'shape.type', label: '形状类型', type: 'enum', options: ShapeType, group: '几何形状 (Shape)' },
  { path: 'shape.radius', label: '半径', type: 'number', props: { min: 0 }, tip: '[Circle, Capsule]', group: '几何形状 (Shape)' },
  { path: 'shape.width', label: '宽度', type: 'number', props: { min: 0 }, tip: '[AABB, OBB]', group: '几何形状 (Shape)' },
  { path: 'shape.height', label: '高度', type: 'number', props: { min: 0 }, tip: '[AABB, OBB]', group: '几何形状 (Shape)' },
  { path: 'shape.offsetX', label: '偏移 X', type: 'number', group: '几何形状 (Shape)' },
  { path: 'shape.offsetY', label: '偏移 Y', type: 'number', group: '几何形状 (Shape)' },
  { path: 'shape.rotation', label: '旋转', type: 'number', props: { step: 0.1 }, tip: '[OBB, Capsule] 弧度', group: '几何形状 (Shape)' },
  { path: 'shape.debugColor', label: '调试颜色', type: 'color', group: '几何形状 (Shape)' }
];
