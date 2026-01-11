import { z } from 'zod';
import { world } from '@/game/ecs/world';
import { BattleResultSchema } from '@/game/entities/components/BattleResult';

// --- Schema Definition ---
export const GlobalEntitySchema = z.object({
    // 可选的战斗结果 (存档时可能不需要保存这个瞬时状态，但Schema里定义它是个好习惯)
    pendingBattleResult: BattleResultSchema.optional()
});

// --- Entity Definition ---
export const GlobalEntity = {
    /**
     * 创建全局管理实体
     * @param {z.infer<typeof GlobalEntitySchema>} data
     */
    create(data = {}) {
        // Validation
        const result = GlobalEntitySchema.safeParse(data);
        if (!result.success) {
            console.error('[GlobalEntity] Validation failed', result.error);
            return null;
        }

        const { pendingBattleResult } = result.data;

        // Check uniqueness
        const existing = world.with('globalManager').first;
        if (existing) {
            world.remove(existing);
        }

        const entity = {
            type: 'global_manager',
            globalManager: true, // Tag

            persist: true
        };

        // 如果初始数据里有战斗结果（例如刚从战斗场景存档恢复？）
        if (pendingBattleResult) {
            entity.battleResult = pendingBattleResult;
        }

        return world.add(entity);
    },

    /**
     * 序列化逻辑
     * @param {object} entity 
     */
    serialize(entity) {
        const data = {};

        // 如果存档时刚好有未处理的战斗结果，也可以保存下来
        if (entity.battleResult) {
            data.pendingBattleResult = entity.battleResult;
        }

        return data;
    }
}
