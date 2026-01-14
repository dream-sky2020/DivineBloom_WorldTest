import { z } from 'zod';
import { ID, LocalizedStringSchema, StatsSchema } from '../common.js';

// --- 物品 (Item) Schema ---

const ItemEffectSchema = z.object({
    type: z.string(),
    value: z.number().optional(),
    percent: z.number().optional(), // 百分比效果 (0-1)
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
    consumeTurn: z.boolean().optional(), // 是否消耗回合，默认为 true (仅消耗品有效)
    effects: z.array(ItemEffectSchema).optional(), // 消耗品特有
    price: z.number().optional(),

    // 装备特有 (StatsSchema 是所有属性可选，符合装备加成)
    stats: StatsSchema.optional(),
});
