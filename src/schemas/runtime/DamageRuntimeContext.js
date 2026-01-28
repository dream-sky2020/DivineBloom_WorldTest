import { z } from 'zod';

/**
 * DamageRuntimeContext (伤害运行时上下文)
 * 
 * 职责：保存单次伤害计算从开始到结束的所有中间状态和结果。
 * 注意：attacker 和 defender 必须保持引用以维持 Vue 响应性。
 */

export const DamageRuntimeContextSchema = z.object({
    // --- 核心参与者 ---
    attacker: z.any(),
    defender: z.any(),

    // --- 来源数据 ---
    skill: z.any().nullable().default(null),
    item: z.any().nullable().default(null),
    effect: z.any().nullable().default(null), // 具体的伤害效果配置片段

    // --- 属性中间值 ---
    atk: z.number().default(0),              // 使用的攻击力值 (已计入状态修正)
    def: z.number().default(0),              // 使用的防御力值 (已计入状态修正)
    
    // --- 倍率与修正 ---
    baseMultiplier: z.number().default(1.0), // 基础倍率 (来自 Skill/Effect 配置)
    actionMultiplier: z.number().default(1.0), // 动作倍率 (来自 Boost/能量/ActionContext)
    elementMultiplier: z.number().default(1.0), // 属性克制倍率
    
    // --- 状态标志 ---
    isCritical: z.boolean().default(false),
    isBlocked: z.boolean().default(false),   // 目标是否处于防御状态
    isMissed: z.boolean().default(false),
    element: z.string().nullable().default(null),

    // --- 随机波动 ---
    variance: z.number().default(1.0),       // 最终随机生成的波动系数

    // --- 结果 ---
    finalDamage: z.number().default(0),      // 最终计算出的伤害数值
    
    // --- 扩展记录 (用于日志或被动触发) ---
    modifiers: z.array(z.object({
        source: z.string(),
        value: z.number(),
        type: z.enum(['add', 'mult'])
    })).default([]),
});

/**
 * 创建伤害运行时上下文
 */
export const createDamageRuntimeContext = (data) => {
    return DamageRuntimeContextSchema.parse(data);
};

export default createDamageRuntimeContext;
