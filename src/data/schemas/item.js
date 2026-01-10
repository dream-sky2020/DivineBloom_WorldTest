import { z } from 'zod';
import { ID, LocalizedStringSchema, StatsSchema } from './common.js';

// --- 物品 (Item) Schema ---

const ItemEffectSchema = z.object({
    type: z.string(),
    value: z.number().optional(),
    status: z.union([z.string(), z.number()]).optional(),
    duration: z.number().optional(),
    chance: z.number().optional(),
    element: z.string().optional(),
});

export const ItemSchema = z.object({
    id: ID,
    name: LocalizedStringSchema,
    type: z.string(), // e.g. "itemTypes.consumable"
    icon: z.string(),
    subText: LocalizedStringSchema,
    footerLeft: z.string(),
    description: LocalizedStringSchema,

    // 可选字段
    targetType: z.string().optional(), // 消耗品特有
    effects: z.array(ItemEffectSchema).optional(), // 消耗品特有
    price: z.number().optional(),

    // 装备特有 (StatsSchema 是所有属性可选，符合装备加成)
    stats: StatsSchema.optional(),
});

