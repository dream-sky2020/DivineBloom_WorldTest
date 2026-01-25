import { z } from 'zod';
import {
    ID,
    StatsSchema,
    createTagReference,
    createTagsReference,
    createStatusReference
} from '../common.js';
import { LocalizedStringSchema } from './localization.js';

// --- 物品 (Item) Schema ---

const ItemEffectSchema = z.object({
    type: z.string(),
    value: z.number().optional(),
    percent: z.number().optional(), // 百分比效果 (0-1)
    status: createStatusReference().optional(), // 升级校验
    duration: z.number().optional(),
    chance: z.number().optional(),
    element: createTagReference("引用了不存在的 Element 标签").optional(),
});

export const ItemSchema = z.object({
    id: ID,
    name: LocalizedStringSchema,
    type: createTagReference("引用了不存在的 Item Category 标签"), // e.g. "cat_item_weapon"
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

    // 标签
    tags: createTagsReference(),
});
