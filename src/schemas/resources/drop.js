import { z } from 'zod';
import { createItemReference } from '../common.js';

/**
 * 战利品 (Loot) Schema
 * 用于记录实际获得的物品数量
 */
export const LootSchema = z.object({
    itemId: createItemReference("引用了不存在的物品 ID"),
    qty: z.number().int().min(1)
});

// --- 掉落物 (Drop) Schema ---
export const DropSchema = z.object({
    itemId: createItemReference("掉落物引用了不存在的物品 ID"), // 物品ID，增加校验
    chance: z.number().min(0).max(1), // 掉落概率 0-1
    minQty: z.number().int().min(1).default(1), // 最小数量
    maxQty: z.number().int().min(1).default(1), // 最大数量
});

export default DropSchema;
