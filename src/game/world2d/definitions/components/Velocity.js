import { z } from 'zod';

// --- Schema Definition ---
export const VelocitySchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0)
});

// --- Component Factory ---
/**
 * 创建速度组件
 * @param {number} x - X 轴速度（默认 0）
 * @param {number} y - Y 轴速度（默认 0）
 * @returns {Object} 速度组件 {x, y}
 * 
 * @example
 * velocity: Velocity()           // {x: 0, y: 0}
 * velocity: Velocity(100, 50)    // {x: 100, y: 50}
 */
export function Velocity(x = 0, y = 0) {
  const result = VelocitySchema.safeParse({ x, y });
  if (!result.success) {
    console.warn('[Velocity] Validation failed, using defaults', result.error);
    return VelocitySchema.parse({});
  }
  return result.data;
}
