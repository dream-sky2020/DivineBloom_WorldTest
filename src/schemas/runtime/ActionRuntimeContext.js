import { z } from 'zod';
import { ID } from '../common.js';

/**
 * ActionRuntimeContext (动作瞬时上下文)
 * 
 * 职责：保存单次动作（技能、攻击、道具使用）执行期间的瞬时状态。
 * 注意：为了保持响应性，单位对象（actor, targets）必须保持引用，不可通过 Zod 深度克隆。
 */

export const ActionRuntimeContextSchema = z.object({
    // --- 核心执行者 ---
    actor: z.any().nullable().default(null),        // 当前行动单位 (保持引用)
    action: z.object({
        type: z.enum(['skill', 'item', 'attack', 'defend', 'escape', 'switch', 'wait']),
        skillId: ID.optional(),
        itemId: ID.optional(),
        targetId: ID.optional(),
        targetType: z.string().optional(),
    }).nullable().default(null),
    
    skillData: z.any().nullable().default(null),     // 静态数据引用

    // --- 修正参数 ---
    energyMult: z.number().default(1.0),
    hitIndex: z.number().int().min(0).default(0),
    
    // --- 动作定义补全 ---
    targetType: z.string().default('single'),
    effects: z.array(z.any()).default([]),
    logKey: z.string().nullable().default(null),
    logParams: z.record(z.any()).default({}),
    
    // --- 溯源追踪 ---
    modifiers: z.array(z.object({
        source: z.string(),
        value: z.any(),
        type: z.string()
    })).default([]),
    
    // --- 目标信息 ---
    targets: z.array(z.any()).default([]),         // 保持单位引用数组
    initialTargetId: ID.nullable().default(null),
    
    // --- 计算中间值 ---
    lastDamageDealt: z.number().default(0),
    results: z.array(z.any()).default([]),
    
    // --- 状态标志 ---
    isCritical: z.boolean().default(false),
    isMissed: z.boolean().default(false),
    consumeTurn: z.boolean().default(true)
});

/**
 * 创建并初始化动作上下文
 */
export const createActionRuntimeContext = (actor = null, action = null, battleContext = null) => {
    const data = {
        actor,
        action,
        initialTargetId: action?.targetId || null
    };

    if (actor && battleContext) {
        if ((actor.energy || 0) > 0) {
            data.energyMult = 1.0 + (actor.energy * 0.5);
            if (battleContext.log) {
                battleContext.log('battle.energyConsume', { name: actor.name, energy: actor.energy });
            }
            actor.energy = 0;
        }
    }

    // 这里使用 parse 会检查结构，但由于 actor/targets 是 z.any()，它们的引用会被保留
    return ActionRuntimeContextSchema.parse(data);
};

export default createActionRuntimeContext;
