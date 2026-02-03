import { z } from 'zod';

/**
 * WorldTransform 组件，代表实体在世界空间中的最终变换结果。
 * 在本项目中，它通常与 Transform 组件等价。
 * 引入此组件是为了明确“经过同步计算后的世界坐标”这一概念。
 */
export const WorldTransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  rotation: z.number().default(0)
});

export function WorldTransform(x = 0, y = 0, rotation = 0) {
  return WorldTransformSchema.parse({ x, y, rotation });
}
