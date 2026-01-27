import { z } from 'zod';

// --- Schema Definition ---
export const BattleResultSchema = z.object({
    uuid: z.string(), // 触发战斗的实体 UUID
    result: z.object({
        win: z.boolean().default(false),
        fled: z.boolean().default(false),
        drops: z.array(z.string()).optional(),
        exp: z.number().optional()
    })
});

// --- Component Factory ---
export const BattleResult = {
    /**
     * 战斗结果组件
     * 临时挂载在 GlobalEntity 上，用于传递战斗结束信息
     * @param {string} uuid 
     * @param {object} result 
     */
    Data(uuid, result) {
        return {
            battleResult: {
                uuid,
                result
            }
        };
    }
}

/**
 * 编辑器属性字段
 */
export const BATTLE_RESULT_INSPECTOR_FIELDS = [
    { path: 'battleResult.uuid', label: '来源实体 UUID', type: 'text', group: '战斗结果' },
    { path: 'battleResult.result.win', label: '胜利', type: 'checkbox', group: '战斗结果' },
    { path: 'battleResult.result.fled', label: '逃跑', type: 'checkbox', group: '战斗结果' },
    { path: 'battleResult.result.exp', label: '获得经验', type: 'number', group: '战斗结果' }
];
