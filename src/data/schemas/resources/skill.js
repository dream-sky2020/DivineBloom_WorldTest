import { z } from 'zod';
import { ID, LocalizedStringSchema } from '../common.js';
import { SkillEffectSchema } from '../effects.js';

// --- 技能 (Skill) Schema ---
// SkillEffectSchema 现在从 effects.js 导入，提供完整的类型检查

const SkillCostSchema = z.object({
    type: z.enum(['mp', 'hp', 'status_duration', 'item']),
    id: ID.optional(), // Item ID or Status ID
    amount: z.number(),
    group: z.number().optional() // Cost priority group (0 checked first, then 1...)
});

export const SkillSchema = z.object({
    id: ID,
    name: LocalizedStringSchema,
    type: z.string(), // "skillTypes.active"
    category: z.string(), // "skillCategories.magic"

    // 可选
    element: z.string().optional(),
    targetType: z.string().optional(), // "enemy", "allEnemies"

    // 显示用的消耗文本 (如 "10 MP")
    cost: z.union([z.string(), z.number()]).optional(),

    // 实际逻辑消耗
    costs: z.array(SkillCostSchema).optional(),

    icon: z.string().optional(),

    effects: z.array(SkillEffectSchema).optional().default([]),

    subText: LocalizedStringSchema.optional(),
    description: LocalizedStringSchema.optional(),

    // 某些特殊技能参数
    chain: z.number().optional(),
    decay: z.number().optional(),
    randomHits: z.number().optional(),
    exclusiveGroup: z.string().optional(),
    exclusiveGroupPriority: z.number().optional(),
    consumeTurn: z.boolean().optional() // 是否消耗回合，默认为 true
});
