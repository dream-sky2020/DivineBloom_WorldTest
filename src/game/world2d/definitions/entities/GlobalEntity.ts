import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
    // BattleResultSchema, BATTLE_RESULT_INSPECTOR_FIELDS, // 暂时禁用，等待战斗系统实现
    Camera,
    Timer, TimerSchema,
    Inspector, EDITOR_INSPECTOR_FIELDS,
    Commands,
    MousePosition,
    CombatProgress, CombatProgressSchema, COMBAT_PROGRESS_INSPECTOR_FIELDS
} from '@components';

// --- Schema Definition ---
export const GlobalEntitySchema = z.object({
    // pendingBattleResult: BattleResultSchema.optional(), // 暂时禁用，等待战斗系统实现
    combatProgress: CombatProgressSchema.optional(),
    camera: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        targetX: z.number().optional(),
        targetY: z.number().optional(),
        lerp: z.number().optional(),
        useBounds: z.boolean().optional(),
        deadZone: z.object({
            width: z.number().optional(),
            height: z.number().optional()
        }).optional()
    }).optional(),
    inputState: z.object({
        lastPressed: z.record(z.string(), z.boolean()).default({})
    }).optional().default({ lastPressed: {} }),
    timer: TimerSchema.optional().default({ totalTime: 0, running: true })
});

export type GlobalEntityData = z.infer<typeof GlobalEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
    { path: 'timer.totalTime', label: '运行总时长', type: 'number', tip: '场景运行的累计秒数', props: { readonly: true, step: 0.001 }, group: '时间控制' },
    { path: 'timer.running', label: '启用计时器', type: 'checkbox', tip: '控制场景时间的流动', group: '时间控制' },
    { path: 'camera.x', label: '相机位置 X', type: 'number', props: { step: 1 }, group: '相机设置' },
    { path: 'camera.y', label: '相机位置 Y', type: 'number', props: { step: 1 }, group: '相机设置' },
    { path: 'camera.lerp', label: '相机平滑系数', type: 'number', tip: '0-1 之间，1 为即时跟随', props: { step: 0.01, min: 0, max: 1 }, group: '相机设置' },
    ...(COMBAT_PROGRESS_INSPECTOR_FIELDS || []),
    { path: 'mousePosition.worldX', label: '鼠标 X (世界)', type: 'number', tip: '鼠标在游戏世界中的 X 坐标', props: { readonly: true }, group: '调试信息' },
    { path: 'mousePosition.worldY', label: '鼠标 Y (世界)', type: 'number', tip: '鼠标在游戏世界中的 Y 坐标', props: { readonly: true }, group: '调试信息' },
    // ...BATTLE_RESULT_INSPECTOR_FIELDS, // 暂时禁用，等待战斗系统实现
    ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const GlobalEntity: IEntityDefinition<typeof GlobalEntitySchema> = {
    type: 'global_manager',
    name: '全局管理器',
    order: 1,
    creationIndex: 0,
    schema: GlobalEntitySchema,
    create(data: Partial<GlobalEntityData> = {}) {
        const result = GlobalEntitySchema.safeParse(data);
        if (!result.success) {
            console.error('[GlobalEntity] Validation failed', result.error);
            return null;
        }

        const { /* pendingBattleResult, */ camera: cameraData, inputState, timer: timerData, combatProgress: combatProgressData } = result.data;

        const existing = world.with('globalManager').first;
        if (existing) {
            world.remove(existing);
        }

        const entity = {
            type: 'global_manager',
            name: 'Global Manager',
            globalManager: true,
            persist: true,
            camera: Camera.create(cameraData || {}),
            combatProgress: CombatProgress.create(combatProgressData || {}),
            inputState: inputState,
            timer: Timer.create(timerData),
            mousePosition: MousePosition.create(),
            commands: Commands.create(),
            inspector: null as any
        };

        entity.inspector = Inspector.create({
            tagName: 'Global',
            tagColor: '#7c3aed',
            fields: INSPECTOR_FIELDS,
            allowDelete: false,
            priority: 1000,
            hitPriority: 1000
        });

        // 暂时禁用，等待战斗系统实现
        // if (pendingBattleResult) {
        //     entity.battleResult = pendingBattleResult;
        // }

        return world.add(entity);
    },

    serialize(entity: any) {
        const data: any = { type: 'global_manager' };
        // if (entity.battleResult) data.pendingBattleResult = entity.battleResult; // 暂时禁用，等待战斗系统实现
        if (entity.combatProgress) data.combatProgress = CombatProgress.serialize(entity.combatProgress);
        if (entity.camera) data.camera = { ...entity.camera };
        if (entity.inputState) data.inputState = entity.inputState;
        if (entity.timer) data.timer = { ...entity.timer };
        return data;
    },

    deserialize(data: any) {
        return this.create(data);
    }
}
