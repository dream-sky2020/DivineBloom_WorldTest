import { z } from 'zod';
import { ID, createTagReference, createTagsReference } from '../common.js';
import { LocalizedStringSchema } from './localization.js';
import { StatusEffectSchema } from '../effects.js';

// --- 状态 (Status) Schema ---
// StatusEffectSchema 现在 from effects.js 导入，提供完整的类型检查

export const StatusSchema = z.object({
    id: ID,
    name: LocalizedStringSchema,
    type: createTagReference("引用了不存在的 Status Type 标签"), // "statusTypes.buff"
    icon: z.string().optional(),
    subText: LocalizedStringSchema.optional(),
    description: LocalizedStringSchema.optional(),

    // 生命周期控制
    // 'turn': 标准回合制，每回合-1 (默认)
    // 'action': 行动消耗制
    // 'none': 不自动减少（用于弹药、光环、永久被动）
    decayMode: z.enum(['turn', 'action', 'none']).optional().default('turn'),

    // 战斗属性
    deathChance: z.number().min(0).max(1).optional(), // 濒死状态下的死亡概率

    // 标签 (用于分类、驱散逻辑等)
    tags: createTagsReference(),

    effects: z.array(StatusEffectSchema).optional().default([])
});
