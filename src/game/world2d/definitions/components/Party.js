import { z } from 'zod';

/**
 * 队伍阵型插槽 Schema
 */
export const FormationSlotSchema = z.object({
    front: z.string().nullable().default(null),
    back: z.string().nullable().default(null)
});

/**
 * 队伍组件 Schema
 */
export const PartySchema = z.object({
    // 存储角色运行时数据 (Hp, Mp, 等级等)
    members: z.record(z.string(), z.any()).default({}),
    // 存储阵型排列
    formation: z.array(FormationSlotSchema).default([
        { front: null, back: null },
        { front: null, back: null },
        { front: null, back: null },
        { front: null, back: null }
    ])
});

export const Party = {
    /**
     * 创建队伍组件
     * @param {z.infer<typeof PartySchema>} data 
     */
    create(data = {}) {
        const result = PartySchema.safeParse(data);
        if (!result.success) {
            console.warn('[Party Component] Validation failed, using defaults', result.error);
            return PartySchema.parse({});
        }
        return result.data;
    }
};
