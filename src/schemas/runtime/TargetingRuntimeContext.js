import { z } from 'zod';
import { ID } from '../common.js';

/**
 * TargetingRuntimeContext (目标选择上下文)
 * 
 * 职责：封装目标筛选和解析的逻辑状态。
 * 注意：actor, partySlots, enemies, targets 必须保持引用以维持 Vue 响应性。
 */

export const TargetingRuntimeContextSchema = z.object({
    // --- 输入参数 ---
    actor: z.any().nullable().default(null),          // 发起选择的单位
    targetType: z.string().default('single'),          // 目标类型 (如: enemy, ally, allEnemies)
    targetId: ID.nullable().default(null),             // 初始选择的目标 ID (可选)
    
    // --- 环境引用 ---
    partySlots: z.array(z.any()).default([]),          // 玩家队伍引用
    enemies: z.array(z.any()).default([]),             // 敌人列表引用
    
    // --- 解析结果 ---
    targets: z.array(z.any()).default([]),             // 最终解析出的目标单位对象数组
    validTargetIds: z.array(ID).default([]),           // 所有合法可点击目标的 ID 数组
    
    // --- 阵营信息缓存 (可选) ---
    myTeam: z.array(z.any()).default([]),
    oppTeam: z.array(z.any()).default([]),
    
    // --- 标志位 ---
    isResolved: z.boolean().default(false),

    // --- 延迟日志 ---
    logKey: z.string().nullable().default(null),
    logParams: z.record(z.any()).default({}),

    // --- 溯源追踪 ---
    modifiers: z.array(z.object({
        source: z.string(),
        value: z.any(),
        type: z.string() // 如 "redirect", "filter"
    })).default([]),
});

/**
 * 创建目标选择上下文
 */
export const createTargetingRuntimeContext = (data) => {
    return TargetingRuntimeContextSchema.parse(data);
};

export default createTargetingRuntimeContext;
