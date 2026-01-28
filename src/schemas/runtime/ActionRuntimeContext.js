import { z } from 'zod';
import { ID } from '../common.js';
import { CharacterSchema } from '../resources/character.js';
import { SkillSchema } from '../resources/skill.js';
import { ItemSchema } from '../resources/item.js';

/**
 * ActionRuntimeContext (动作瞬时上下文)
 * 
 * 职责：保存单次动作（技能、攻击、道具使用）执行期间的瞬时状态。
 */

export const ActionRuntimeContextSchema = z.object({
    // --- 核心执行者 ---
    actor: CharacterSchema.nullable().default(null),        // 当前行动单位
    action: z.object({
        type: z.enum(['skill', 'item', 'attack', 'defend', 'escape', 'switch', 'wait']),
        skillId: ID.optional(),
        itemId: ID.optional(),
        targetId: ID.optional(),
        targetType: z.string().optional(), // "enemy", "allEnemies", "self", "ally", "allAllies"
    }).nullable().default(null),      // 原始动作指令
    
    skillData: z.union([SkillSchema, ItemSchema]).nullable().default(null),     // 解析后的技能/物品数据库对象

    // --- 修正参数 ---
    energyMult: z.number().default(1.0),     // 能量/加气系统产生的最终倍率
    hitIndex: z.number().int().min(0).default(0),         // 多段/连锁攻击中的当前段数
    
    // --- 目标信息 ---
    targets: z.array(CharacterSchema).default([]),         // 最终解析出的目标单位列表
    initialTargetId: ID.nullable().default(null), // 最初指定的选择目标
    
    // --- 计算中间值 ---
    lastDamageDealt: z.number().default(0),  // 上一段效果造成的伤害（用于连携逻辑）
    results: z.array(z.any()).default([]),         // 每一段效果执行后的结果摘要
    
    // --- 状态标志 ---
    isCritical: z.boolean().default(false),   // 是否暴击
    isMissed: z.boolean().default(false),     // 是否未命中
    consumeTurn: z.boolean().default(true)    // 动作执行后是否消耗该单位的回合
});

/**
 * 创建动作运行时上下文的默认对象
 */
export const createActionRuntimeContext = (actor = null, action = null) => {
    return ActionRuntimeContextSchema.parse({
        actor,
        action
    });
};

export default createActionRuntimeContext;
