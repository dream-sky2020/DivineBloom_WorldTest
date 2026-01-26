import { z } from 'zod';
import { world } from '@world2d/world';
import { BattleResultSchema } from '@world2d/entities/components/BattleResult';
import { Camera } from '@world2d/entities/components/Camera';
import { Timer, TimerSchema } from '@world2d/entities/components/Timer';
import { Inspector, EDITOR_INSPECTOR_FIELDS } from '@world2d/entities/components/Inspector';
import { Commands } from '@world2d/entities/components/Commands';
import { MousePosition } from '@world2d/entities/components/MousePosition';
import { Party, PartySchema } from '@world2d/entities/components/Party';
import { Inventory, InventorySchema } from '@world2d/entities/components/Inventory';

// --- Schema Definition ---
export const GlobalEntitySchema = z.object({
    pendingBattleResult: BattleResultSchema.optional(),
    camera: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        lerp: z.number().optional(),
        useBounds: z.boolean().optional()
    }).optional(),
    inputState: z.object({
        lastPressed: z.record(z.string(), z.boolean()).default({})
    }).optional().default({ lastPressed: {} }),
    timer: TimerSchema.optional().default({ totalTime: 0, running: true }),
    party: PartySchema.optional(),
    inventory: InventorySchema.optional()
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
    { path: 'timer.totalTime', label: '运行总时长', type: 'number', tip: '场景运行的累计秒数', props: { readonly: true, step: 0.001 }, group: '时间控制' },
    { path: 'timer.running', label: '启用计时器', type: 'checkbox', tip: '控制场景时间的流动', group: '时间控制' },
    { path: 'camera.x', label: '相机位置 X', type: 'number', props: { step: 1 }, group: '相机设置' },
    { path: 'camera.y', label: '相机位置 Y', type: 'number', props: { step: 1 }, group: '相机设置' },
    { path: 'camera.lerp', label: '相机平滑系数', type: 'number', tip: '0-1 之间，1 为即时跟随', props: { step: 0.01, min: 0, max: 1 }, group: '相机设置' },
    { path: 'mousePosition.worldX', label: '鼠标 X (世界)', type: 'number', tip: '鼠标在游戏世界中的 X 坐标', props: { readonly: true }, group: '调试信息' },
    { path: 'mousePosition.worldY', label: '鼠标 Y (世界)', type: 'number', tip: '鼠标在游戏世界中的 Y 坐标', props: { readonly: true }, group: '调试信息' },
    ...EDITOR_INSPECTOR_FIELDS
];

export const GlobalEntity = {
    create(data = {}) {
        const result = GlobalEntitySchema.safeParse(data);
        if (!result.success) {
            console.error('[GlobalEntity] Validation failed', result.error);
            return null;
        }

        const { pendingBattleResult, camera: cameraData, inputState, timer: timerData, party: partyData, inventory: invData } = result.data;

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
            inputState: inputState,
            timer: Timer.create(timerData),
            party: Party.create(partyData),
            inventory: Inventory.create(invData),
            mousePosition: MousePosition.create(),
            commands: Commands.create()
        };

        entity.inspector = Inspector.create({
            tagName: 'Global',
            tagColor: '#7c3aed',
            fields: INSPECTOR_FIELDS,
            allowDelete: false,
            priority: 1000,
            hitPriority: 1000
        });

        if (pendingBattleResult) {
            entity.battleResult = pendingBattleResult;
        }

        return world.add(entity);
    },

    serialize(entity) {
        const data = {};
        if (entity.battleResult) data.pendingBattleResult = entity.battleResult;
        if (entity.camera) data.camera = { ...entity.camera };
        if (entity.inputState) data.inputState = entity.inputState;
        if (entity.timer) data.timer = { ...entity.timer };
        if (entity.party) data.party = entity.party;
        if (entity.inventory) data.inventory = entity.inventory;
        return data;
    }
}
