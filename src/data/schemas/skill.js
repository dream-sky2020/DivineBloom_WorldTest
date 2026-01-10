import { z } from 'zod';
import { ID, LocalizedStringSchema } from './common.js';

// --- 技能 (Skill) Schema ---

const SkillEffectSchema = z.object({
    type: z.string(),
    value: z.number().optional(),
    scaling: z.string().optional(), // e.g. "atk", "mag"
    element: z.string().optional(),
    status: z.union([z.number(), z.string()]).optional(), // ID of status to apply
    chance: z.number().optional(), // 0.0 - 1.0
    duration: z.number().optional(),
    minOffset: z.number().optional(),
    maxOffset: z.number().optional(),
    times: z.number().optional(),
    minTimes: z.number().optional(),
    maxTimes: z.number().optional(),
    target: z.string().optional(), // Self heal etc
});

export const SkillSchema = z.object({
    id: ID,
    name: LocalizedStringSchema,
    type: z.string(), // "skillTypes.active"
    category: z.string(), // "skillCategories.magic"

    // 可选
    element: z.string().optional(),
    targetType: z.string().optional(), // "enemy", "allEnemies"
    cost: z.union([z.string(), z.number()]).optional(), // "10 MP" or number
    icon: z.string().optional(),

    effects: z.array(SkillEffectSchema).optional().default([]),

    subText: LocalizedStringSchema.optional(),
    description: LocalizedStringSchema.optional(),

    // 某些特殊技能参数
    chain: z.number().optional(),
    decay: z.number().optional(),
    randomHits: z.number().optional()
});

