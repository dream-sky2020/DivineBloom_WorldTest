import { z } from 'zod';

/**
 * Projectile Component
 * 弹道组件 - 存储弹道特有的战斗属性
 * 
 * 职责分离：
 * - ✅ 伤害、穿透等战斗属性 → Projectile 组件（本组件）
 * - ✅ 速度、方向 → Velocity 组件
 * - ✅ 生命周期 → LifeTime 组件
 * - ✅ 碰撞检测 → DetectProjectile 组件
 */

export const ProjectileSchema = z.object({
  damage: z.number().default(10),              // 伤害值
  isPenetrating: z.boolean().default(false),   // 是否穿透（穿透不消失）
  penetrationCount: z.number().default(0),     // 剩余穿透次数（0 = 无穿透）
  knockback: z.number().default(0),            // 击退力度
  criticalChance: z.number().default(0),       // 暴击率（0-1）
  criticalMultiplier: z.number().default(1.5)  // 暴击倍率
});

/**
 * Projectile Component Factory
 * @param {Object} config - 配置对象
 * @returns {Object} Projectile 组件
 * 
 * @example
 * projectile: Projectile({ damage: 15 })
 * projectile: Projectile({ damage: 10, isPenetrating: true, penetrationCount: 2 })
 */
export const Projectile = (config = {}) => {
  const result = ProjectileSchema.safeParse(config);
  if (!result.success) {
    console.warn('[Projectile] validation failed', result.error);
    return ProjectileSchema.parse({});
  }
  return result.data;
}
