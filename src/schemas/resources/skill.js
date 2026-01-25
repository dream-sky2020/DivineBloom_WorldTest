import { z } from 'zod';
import {
    ID,
    createTagReference,
    createTagsReference,
    EntityRegistry
} from '../common.js';
import { LocalizedStringSchema } from './localization.js';
import { SkillEffectSchema } from '../effects.js';

// --- 技能 (Skill) Schema ---

const SkillCostSchema = z.object({
    type: z.enum(['mp', 'hp', 'status_duration', 'item']),
    id: ID.optional(),
    amount: z.number(),
    group: z.number().optional()
}).superRefine((data, ctx) => {
    if (data.type === 'item' && data.id) {
        if (!EntityRegistry.has('items', data.id)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `消耗项引用了不存在的物品 ID: "${data.id}"`,
                path: ['id']
            });
        }
    } else if (data.type === 'status_duration' && data.id) {
        if (!EntityRegistry.has('status', data.id)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `消耗项引用了不存在的状态 ID: "${data.id}"`,
                path: ['id']
            });
        }
    }
});

export const SkillSchema = z.object({
    id: ID,
    name: LocalizedStringSchema,
    type: createTagReference("引用了不存在的 Skill Type 标签"), // "skillTypes.active"
    category: createTagReference("引用了不存在的 Skill Category 标签"), // "cat_skill_magic"

    // 可选
    element: createTagReference("引用了不存在的 Element 标签").optional(),
    targetType: z.string().optional(), // "enemy", "allEnemies"

    // 显示用的消耗文本 (如 "10 MP")
    cost: z.union([z.string(), z.number()]).optional(),

    // 实际逻辑消耗
    costs: z.array(SkillCostSchema).optional(),

    icon: z.string().optional(),

    effects: z.array(SkillEffectSchema).optional().default([]),

    subText: LocalizedStringSchema.optional(),
    description: LocalizedStringSchema.optional(),

    // 标签
    tags: createTagsReference(),

    // 某些特殊技能参数
    chain: z.number().optional(),
    decay: z.number().optional(),
    randomHits: z.number().optional(),

    // 互斥组与优先级 (用于同类被动替换，如死亡处理器)
    exclusiveGroup: ID.optional(),
    exclusiveGroupPriority: z.number().int().optional(),
    consumeTurn: z.boolean().optional() // 是否消耗回合，默认为 true
});
