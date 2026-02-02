import { z } from 'zod';

// --- Schema Definition ---
export const WeaponSchema = z.object({
  weaponType: z.string().default('pistol'),
  fireRate: z.number().min(0.01).default(0.5),      // 射速（秒/发）
  damage: z.number().min(0).default(10),
  bulletSpeed: z.number().min(0).default(500),
  bulletColor: z.string().default('#FFFF00'),
  bulletRadius: z.number().min(1).default(2),
  
  // 子弹属性
  bulletLifeTime: z.number().default(3),            // 子弹生命周期（秒）

  // 运行时状态
  cooldown: z.number().min(0).default(0),           // 当前冷却时间
  isFiring: z.boolean().default(false),             // 是否正在射击
  fireDirection: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 1, y: 0 })                        // 射击方向
});

// --- Component Factory ---
/**
 * 创建武器组件
 * @param {Object} config - 武器配置
 * @returns {Object} 武器组件
 * 
 * @example
 * weapon: Weapon({ damage: 20, fireRate: 0.3 })
 */
export function Weapon(config = {}) {
  const result = WeaponSchema.safeParse(config);
  if (!result.success) {
    console.warn('[Weapon] Validation failed, using defaults', result.error);
    return WeaponSchema.parse({});
  }
  return result.data;
}

/**
 * 武器通用属性字段，用于编辑器 Inspector 面板
 */
export const WEAPON_INSPECTOR_FIELDS = [
  { path: 'weapon.weaponType', label: '武器类型', type: 'text', group: '武器 (Weapon)' },
  { path: 'weapon.damage', label: '伤害', type: 'number', props: { min: 0, step: 1 }, group: '武器 (Weapon)' },
  { path: 'weapon.fireRate', label: '射速', type: 'number', tip: '每秒发射次数', props: { min: 0.01, step: 0.1 }, group: '武器 (Weapon)' },
  { path: 'weapon.bulletSpeed', label: '子弹速度', type: 'number', props: { min: 0, step: 50 }, group: '武器 (Weapon)' },
  { path: 'weapon.bulletLifeTime', label: '子弹寿命', type: 'number', props: { min: 0.1, step: 0.1 }, group: '武器 (Weapon)' },
  { path: 'weapon.bulletColor', label: '子弹颜色', type: 'color', group: '武器 (Weapon)' }
];