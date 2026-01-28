import { z } from 'zod';

/**
 * EffectRuntimeContext (效果运行时上下文)
 * 
 * 注意：actor 和 target 必须保持引用以维持 Vue 响应性。
 */

export const EffectRuntimeContextSchema = z.object({
    // --- 参与者 ---
    actor: z.any().nullable().default(null),
    target: z.any().nullable().default(null),

    // --- 来源数据 ---
    effect: z.any(),
    skill: z.any().nullable().default(null),
    item: z.any().nullable().default(null),
    sourceStatusId: z.string().nullable().default(null),

    // --- 修正参数 ---
    multiplier: z.number().default(1.0),
    
    // --- 迭代状态 ---
    totalTimes: z.number().int().min(1).default(1),
    currentIteration: z.number().int().min(0).default(0),
    
    // --- 结果追踪 ---
    previousResult: z.number().default(0),
    totalResult: z.number().default(0),
    
    // --- 标志位 ---
    silent: z.boolean().default(false),
    isRedirection: z.boolean().default(false),
});

export const createEffectRuntimeContext = (data) => {
    return EffectRuntimeContextSchema.parse(data);
};

export default createEffectRuntimeContext;
