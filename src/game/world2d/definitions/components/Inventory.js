import { z } from 'zod';

/**
 * 物品条目 Schema
 */
export const InventoryItemSchema = z.object({
    id: z.string(),
    count: z.number().int().min(1).default(1)
});

/**
 * 背包组件 Schema (物品数组)
 */
export const InventorySchema = z.array(InventoryItemSchema).default([]);

export const Inventory = {
    /**
     * 创建背包组件
     * @param {z.infer<typeof InventorySchema>} data 
     */
    create(data = []) {
        const result = InventorySchema.safeParse(data);
        if (!result.success) {
            console.warn('[Inventory Component] Validation failed, using defaults', result.error);
            return [];
        }
        return result.data;
    }
};
