import { z } from 'zod';

/**
 * LifeTime Component Schema
 * 用于管理实体的生命周期，时间耗尽后自动删除实体
 */
export const LifeTimeSchema = z.object({
  maxTime: z.number().min(0).default(3),      // 最大生命时间（秒）
  currentTime: z.number().min(0).default(3),  // 当前剩余时间（秒）
  autoRemove: z.boolean().default(true)       // 时间耗尽时是否自动删除
});

/**
 * LifeTime Component Factory
 * @param {number} maxTime - 生命时间（秒）
 * @param {boolean} autoRemove - 是否自动删除（默认 true）
 * @returns {Object} LifeTime 组件
 * 
 * @example
 * lifeTime: LifeTime(3)              // 3秒后自动删除
 * lifeTime: LifeTime(5, false)       // 5秒倒计时，但不自动删除
 */
export function LifeTime(maxTime = 3, autoRemove = true) {
  const result = LifeTimeSchema.safeParse({
    maxTime,
    currentTime: maxTime,
    autoRemove
  });
  
  if (!result.success) {
    console.warn('[LifeTime] Validation failed, using defaults', result.error);
    return LifeTimeSchema.parse({});
  }
  
  return result.data;
}
