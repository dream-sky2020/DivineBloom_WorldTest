import { z } from 'zod';

// --- Schema Definition ---
export const BoundsSchema = z.object({
  minX: z.number().default(0),
  maxX: z.number().default(9999),
  minY: z.number().default(0),
  maxY: z.number().default(9999)
});

// --- Component Factory ---
/**
 * 创建边界组件（通常用于限制实体移动范围）
 * @param {number} minX - 最小 X 坐标（默认 0）
 * @param {number} maxX - 最大 X 坐标（默认 9999）
 * @param {number} minY - 最小 Y 坐标（默认 0）
 * @param {number} maxY - 最大 Y 坐标（默认 9999）
 * @returns {Object} 边界组件
 * 
 * @example
 * bounds: Bounds()                    // 默认边界
 * bounds: Bounds(0, 1920, 0, 1080)    // 自定义边界
 */
export function Bounds(minX = 0, maxX = 9999, minY = 0, maxY = 9999) {
  const result = BoundsSchema.safeParse({ minX, maxX, minY, maxY });
  if (!result.success) {
    console.warn('[Bounds] Validation failed, using defaults', result.error);
    return BoundsSchema.parse({});
  }
  return result.data;
}
