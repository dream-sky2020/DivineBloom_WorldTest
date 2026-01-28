import { z } from 'zod';
import { ID, createItemReference } from '../common.js';
import { CharacterSchema } from '../resources/character.js';
import { LootSchema } from '../resources/drop.js';

/**
 * BattleRuntimeContext (战斗全局上下文)
 * 
 * 职责：保存整场战斗期间的持久状态数据。
 */

export const BattleRuntimeContextSchema = z.object({
    // --- 参与者 ---
    partySlots: z.array(z.object({
        front: CharacterSchema.nullable(),
        back: CharacterSchema.nullable()
    })).default([]),   // 玩家队伍槽位 { front, back }
    
    enemies: z.array(CharacterSchema).default([]),      // 存活的敌人列表
    allUnits: z.array(CharacterSchema).default([]),     // 所有战斗单位的扁平化列表（只读缓存）

    // --- 状态追踪 ---
    turnCount: z.number().int().min(1).default(1),     // 当前回合数 (从1开始)
    round: z.number().int().min(1).default(1),         // 当前轮次
    battlePhase: z.enum(['idle', 'active', 'victory', 'defeat', 'flee']).default('idle'), // 战斗阶段
    
    // --- 运行时控制 ---
    atbPaused: z.boolean().default(false),
    activeUnit: CharacterSchema.nullable().default(null),
    boostLevel: z.number().int().min(0).max(4).default(0),
    waitingForInput: z.boolean().default(false),
    
    // --- 目标与指令 ---
    pendingAction: z.any().nullable().default(null),
    validTargetIds: z.array(ID).default([]),
    
    // --- 累计数据 ---
    lootPool: z.array(LootSchema).default([]),     // 累计获得的掉落物
    totalDamageDealt: z.number().default(0),
    totalDamageTaken: z.number().default(0),
    
    // --- 战斗变量 (用于特殊战斗逻辑) ---
    variables: z.record(z.any()).default({}),          // 键值对，用于处理 BOSS 阶段切换等特殊逻辑
    
    // --- 标识符 ---
    triggeredEnemyUuid: z.string().nullable().default(null),
    lastBattleResult: z.any().nullable().default(null),
    
    // --- 时间系统 ---
    lastTickTime: z.number().default(0)                // ATB 系统最后一次更新的时间戳
});

/**
 * 创建战斗运行时上下文的默认对象
 */
export const createBattleRuntimeContext = (data = {}) => {
    return BattleRuntimeContextSchema.parse(data);
};

export default createBattleRuntimeContext;
