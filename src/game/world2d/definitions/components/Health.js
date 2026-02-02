import { z } from 'zod';

// --- Schema Definition ---
export const HealthSchema = z.object({
  maxHealth: z.number().min(1).default(100), // 最大血量
  currentHealth: z.number().min(0).default(100) // 当前血量
});

// --- Component Factory ---
export const Health = {
  /**
   * 创建血量组件
   * @param {Partial<z.infer<typeof HealthSchema>>} data 
   * @returns 
   */
  create(data = {}) {
    const result = HealthSchema.safeParse(data);
    if (!result.success) {
      console.warn('[Health] Validation failed, using defaults', result.error);
      return HealthSchema.parse({});
    }
    return result.data;
  }
};

/**
 * 血量通用属性字段，用于编辑器 Inspector 面板
 */
export const HEALTH_INSPECTOR_FIELDS = [
  { path: 'health.maxHealth', label: '最大血量', type: 'number', props: { min: 1, step: 10 }, group: '血量 (Health)' },
  { path: 'health.currentHealth', label: '当前血量', type: 'number', props: { min: 0, step: 10 }, group: '血量 (Health)' }
];
