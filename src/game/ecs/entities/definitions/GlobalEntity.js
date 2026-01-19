import { z } from 'zod';
import { world } from '@/game/ecs/world';
import { BattleResultSchema } from '@/game/ecs/entities/components/BattleResult';
import { Camera } from '@/game/ecs/entities/components/Camera';

// --- Schema Definition ---
export const GlobalEntitySchema = z.object({
    // 可选的战斗结果
    pendingBattleResult: BattleResultSchema.optional(),
    camera: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        lerp: z.number().optional(),
        useBounds: z.boolean().optional()
    }).optional(),
    // [NEW] 记录全局输入状态，跨地图保持一致
    inputState: z.object({
        lastPressed: z.record(z.string(), z.boolean()).default({})
    }).optional().default({ lastPressed: {} })
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

        const { pendingBattleResult, camera: cameraData, inputState } = result.data;

        // Check uniqueness
        const existing = world.with('globalManager').first;
        if (existing) {
            world.remove(existing);
        }

        const entity = {
            type: 'global_manager',
            globalManager: true, // Tag

            persist: true,

            // 初始化相机
            camera: Camera.create(cameraData || {}),

            // [NEW] 记录按键状态 (用于跨地图正确计算 justPressed)
            inputState: inputState
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

        // 保存相机状态
        if (entity.camera) {
            data.camera = {
                x: entity.camera.x,
                y: entity.camera.y,
                lerp: entity.camera.lerp,
                useBounds: entity.camera.useBounds
            };
        }

        // 保存输入状态 (确保恢复存档后，如果玩家正按着键，不会立即触发)
        if (entity.inputState) {
            data.inputState = entity.inputState;
        }

        return data;
    }
}
