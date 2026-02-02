import { z } from 'zod';
import { ShapeType } from '../enums/Shape';

// 统一使用 PhysicsCollider 的扁平结构
export const DetectAreaSchema = z.object({
  type: z.nativeEnum(ShapeType).default(ShapeType.CIRCLE), // 统一为 type
  radius: z.number().default(0),
  width: z.number().default(0),
  height: z.number().default(0),
  rotation: z.number().default(0),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  // 胶囊体特有属性：相对于位置的偏移线段
  p1: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: -10 }),
  p2: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 10 }),

  target: z.union([z.string(), z.array(z.string())]).default('detectable'), // 指向 entity.tags 中的标签
  includeTags: z.array(z.string()).default([]),
  excludeTags: z.array(z.string()).default(['ghost']),

  // [NEW] 自定义调试颜色
  debugColor: z.string().optional(),

  // Runtime state
  results: z.array(z.any()).default([])
});

export const DetectArea = (config = {}) => {
  // 兼容旧的 shape/size/offset 结构，转换为新的扁平结构
  const flatConfig = { ...config };

  if (config.shape) {
    flatConfig.type = config.shape === 'rect' ? ShapeType.AABB : config.shape;
    delete flatConfig.shape;
  }

  if (config.size) {
    flatConfig.width = config.size.w;
    flatConfig.height = config.size.h;
    delete flatConfig.size;
  }

  if (config.offset) {
    flatConfig.offsetX = config.offset.x;
    flatConfig.offsetY = config.offset.y;
    delete flatConfig.offset;
  }

  const result = DetectAreaSchema.safeParse(flatConfig);

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
  { path: 'detectArea.type', label: '探测形状', type: 'enum', options: ShapeType, tip: '探测区域的几何形状 (Circle:圆形, AABB:矩形, OBB:旋转矩形, Capsule:胶囊体)', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.radius', label: '探测半径', type: 'number', props: { min: 0 }, tip: '[Circle, Capsule] 专用，圆形或胶囊体半径', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.width', label: '探测宽度', type: 'number', props: { min: 0 }, tip: '[AABB, OBB] 专用，矩形宽度', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.height', label: '探测高度', type: 'number', props: { min: 0 }, tip: '[AABB, OBB] 专用，矩形高度', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.offsetX', label: '中心偏移 X', type: 'number', tip: '相对于实体中心的水平偏移', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.offsetY', label: '中心偏移 Y', type: 'number', tip: '相对于实体中心的垂直偏移', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.rotation', label: '旋转角度', type: 'number', tip: '[OBB, Capsule] 专用，旋转弧度 (Circle/AABB 无效)', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.p1.x', label: '胶囊端点1 X', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段起点 X (局部坐标)', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.p1.y', label: '胶囊端点1 Y', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段起点 Y (局部坐标)', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.p2.x', label: '胶囊端点2 X', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段终点 X (局部坐标)', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.p2.y', label: '胶囊端点2 Y', type: 'number', props: { step: 1 }, tip: '[Capsule] 胶囊体线段终点 Y (局部坐标)', group: '探测区域 (DetectArea)' },
  { path: 'detectArea.debugColor', label: '调试颜色', type: 'color', tip: '编辑器中显示的区域边框颜色', group: '探测区域 (DetectArea)' }
];
