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
