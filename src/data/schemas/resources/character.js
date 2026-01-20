import { z } from 'zod';
import { ID, LocalizedStringSchema } from '../common.js';

// --- 掉落物 (Drop) Schema ---
export const DropSchema = z.object({
    itemId: ID,         // 物品ID
    chance: z.number().min(0).max(1), // 掉落概率 0-1
    minQty: z.number().int().min(1).default(1), // 最小数量
    maxQty: z.number().int().min(1).default(1), // 最大数量
});

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
        atk: z.number(), // 攻击力 (对应原 str)
        def: z.number(),
        mag: z.number(),
        spd: z.number()
    }),

    // --- 战斗运行时属性 (Battle Runtime) ---
    // 这些属性在静态数据中可选，用于定义初始状态（如半血开场、自带状态等）
    uuid: z.string().optional(),
    currentHp: z.number().optional(),
    maxHp: z.number().optional(),
    currentMp: z.number().optional(),
    maxMp: z.number().optional(),

    // 基础战斗属性镜像（可选，默认从 initialStats 获取）
    atk: z.number().optional(),
    def: z.number().optional(),
    mag: z.number().optional(),
    spd: z.number().optional(),

    statusEffects: z.array(z.object({
        id: ID,
        duration: z.number().int().optional().default(3),
        value: z.any().optional()
    })).optional().default([]),

    isDefending: z.boolean().optional().default(false),
    atb: z.number().optional().default(0),
    energy: z.number().optional().default(0), // BP 点数
    isPlayer: z.boolean().optional().default(false),
    actionCount: z.number().int().optional().default(0),
    
    // Skill System
    skills: z.array(ID).optional().default([]), // All skills learned/owned
    equippedActiveSkills: z.array(ID).optional().default([]), // Currently equipped active skills
    equippedPassiveSkills: z.array(ID).optional().default([]), // Currently equipped passive skills
    fixedPassiveSkills: z.array(ID).optional().default(['skill_passive_call_of_death']), // Fixed passive skills (cannot be unequipped)
    activeSkillLimit: z.number().int().min(1).default(6), // Max active slots
    passiveSkillLimit: z.number().int().min(1).default(4), // Max passive slots
    
    description: LocalizedStringSchema.optional(),

    // 掉落物配置
    drops: z.array(DropSchema).optional().default([]),

    // 敌人特有
    spriteId: z.string().optional().default('default'),

    // Boss 特有
    isBoss: z.boolean().optional(),
    color: z.string().optional(), // UI显示颜色
});
