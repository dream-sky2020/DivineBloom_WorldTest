import { z } from 'zod';
import { world } from '@/game/ecs/world';
import { BattleResultSchema } from '@/game/ecs/entities/components/BattleResult';
import { Camera } from '@/game/ecs/entities/components/Camera';
import { Timer, TimerSchema } from '@/game/ecs/entities/components/Timer';
import { Inspector } from '@/game/ecs/entities/components/Inspector';
import { Commands } from '@/game/ecs/entities/components/Commands';
import { MousePosition } from '@/game/ecs/entities/components/MousePosition';

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
    }).optional().default({ lastPressed: {} }),
    // [NEW] 场景时间计时器
    timer: TimerSchema.optional().default({ totalTime: 0, running: true })
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
    { path: 'timer.totalTime', label: '运行总时长', type: 'number', tip: '场景运行的累计秒数', props: { readonly: true } },
    { path: 'timer.running', label: '计时器状态', type: 'checkbox', tip: '是否继续计时' },
    { path: 'camera.x', label: '相机 X', type: 'number' },
    { path: 'camera.y', label: '相机 Y', type: 'number' },
    { path: 'camera.lerp', label: '相机平滑系数', type: 'number', tip: '0-1 之间，1 为即时跟随', props: { step: 0.01, min: 0, max: 1 } },
    { path: 'mousePosition.worldX', label: '鼠标世界坐标 X', type: 'number', tip: '鼠标在游戏世界中的 X 坐标', props: { readonly: true } },
    { path: 'mousePosition.worldY', label: '鼠标世界坐标 Y', type: 'number', tip: '鼠标在游戏世界中的 Y 坐标', props: { readonly: true } }
];

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

        const { pendingBattleResult, camera: cameraData, inputState, timer: timerData } = result.data;

        // Check uniqueness
        const existing = world.with('globalManager').first;
        if (existing) {
            world.remove(existing);
        }

        const entity = {
            type: 'global_manager',
            name: 'Global Manager',
            globalManager: true, // Tag

            persist: true,

            // 初始化相机
            camera: Camera.create(cameraData || {}),

            // [NEW] 记录按键状态 (用于跨地图正确计算 justPressed)
            inputState: inputState,

            // [NEW] 初始化计时器
            timer: Timer.create(timerData),

            // [NEW] 鼠标位置追踪
            mousePosition: MousePosition.create(),

            // [NEW] 添加 Inspector
            inspector: Inspector.create({
                tagName: 'Global',
                tagColor: '#7c3aed', // 紫色
                fields: INSPECTOR_FIELDS,
                allowDelete: false, // 全局管理器禁止删除
                priority: 1000 // 最高优先级，始终显示在场景浏览器顶部
            }),

            // [NEW] 命令队列
            commands: Commands.create()
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

        // 保存计时器状态
        if (entity.timer) {
            data.timer = {
                totalTime: entity.timer.totalTime,
                running: entity.timer.running
            };
        }

        return data;
    }
}
