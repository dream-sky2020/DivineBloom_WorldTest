import { z } from 'zod';
import { ID, LocalizedStringSchema } from './common.js';

// --- 角色 (Character) Schema ---
export const CharacterSchema = z.object({
    id: ID, // 支持数字ID
    name: LocalizedStringSchema,
    role: z.string(), // e.g. "roles.monster"
    element: z.string(), // e.g. "elements.water"
    weaponType: z.string(), // e.g. "weapons.none"
    // 角色必须拥有所有属性，不能省略
    initialStats: z.object({
        hp: z.number(),
        mp: z.number(),
        str: z.number(),
        def: z.number(),
        mag: z.number(),
        spd: z.number()
    }),
    skills: z.array(z.number()).optional().default([]),
    description: LocalizedStringSchema.optional(),

    // 敌人特有
    spriteId: z.string().optional().default('default'),

    // Boss 特有
    isBoss: z.boolean().optional(),
    color: z.string().optional(), // UI显示颜色
});

