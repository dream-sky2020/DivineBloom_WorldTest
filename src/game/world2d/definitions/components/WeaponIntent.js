import { z } from 'zod';

// --- Schema Definition ---
export const WeaponIntentSchema = z.object({
  wantsToFire: z.boolean().default(false),          // 是否想要开火
  aimDirection: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 1, y: 0 }),                       // 瞄准方向（归一化）
  aimAngle: z.number().optional()                   // 瞄准角度（弧度）
});

// --- Component Factory ---
/**
 * 创建武器意图组件
 * 用于存储玩家/AI 的射击意图
 * 
 * @returns {Object} 武器意图组件
 * 
 * @example
 * weaponIntent: WeaponIntent()
 */
export function WeaponIntent() {
  return WeaponIntentSchema.parse({});
}
