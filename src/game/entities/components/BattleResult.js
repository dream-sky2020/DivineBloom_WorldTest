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
