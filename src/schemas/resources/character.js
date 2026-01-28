import { z } from 'zod';
import {
    ID,
    createTagReference,
    createTagsReference,
    createSkillsReference,
    createStatusListReference,
} from '../common.js';
import { LocalizedStringSchema } from './localization.js';
import { DropSchema } from './drop.js';

// --- 角色 (Character) Schema ---
export const CharacterSchema = z.object({
    id: ID, // 支持数字ID
    name: LocalizedStringSchema,
    role: createTagReference("引用了不存在的 Role 标签"), // e.g. "roles.monster"
    element: createTagReference("引用了不存在的 Element 标签"), // e.g. "elements.water"
    weaponType: createTagReference("引用了不存在的 Weapon 标签"), // e.g. "weapons.none"

    // --- 基础战斗属性 (Base Stats) ---
    hp: z.number(),
    mp: z.number(),
    atk: z.number(),
    def: z.number(),
    mag: z.number(),
    spd: z.number(),

    // --- 运行时属性 (Runtime) ---
    uuid: z.string().optional(),
    currentHp: z.number().optional(),
    maxHp: z.number().optional(),
    currentMp: z.number().optional(),
    maxMp: z.number().optional(),

    statusEffects: z.array(z.object({
        id: ID, // 这里的 ID 可能也需要校验，但 statusEffects 通常是运行时数据
        duration: z.number().int().optional().default(3),
        value: z.any().optional()
    })).optional().default([]),

    isDefending: z.boolean().optional().default(false),
    atb: z.number().optional().default(0),
    energy: z.number().optional().default(0), // BP 点数
    isPlayer: z.boolean().optional().default(false),
    actionCount: z.number().int().optional().default(0),

    // Skill System
    skills: createSkillsReference("拥有的技能列表包含不存在的 ID").optional().default([]),
    equippedActiveSkills: createSkillsReference("装备的主动技能包含不存在的 ID").default(Array(6).fill(null)),
    equippedPassiveSkills: createSkillsReference("装备的被动技能包含不存在的 ID").default(Array(4).fill(null)),
    fixedPassiveSkills: createSkillsReference("固定被动技能包含不存在的 ID").optional().default(['skill_passive_call_of_death']),
    activeSkillLimit: z.number().int().min(1).default(6), // Max active slots
    passiveSkillLimit: z.number().int().min(1).default(4), // Max passive slots

    description: LocalizedStringSchema.optional(),

    // 掉落物配置
    drops: z.array(DropSchema).optional().default([]),

    // 标签
    tags: createTagsReference(),

    // 敌人特有
    spriteId: z.string().optional().default('default'),

    // Boss 特有
    isBoss: z.boolean().optional(),
    color: z.string().optional(), // UI显示颜色
});
