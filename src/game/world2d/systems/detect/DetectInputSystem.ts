import { world } from '@world2d/world';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('DetectInputSystem');

/**
 * DetectInputSystem
 * 负责处理输入感知逻辑
 */
export const DetectInputSystem: ISystem = {
    name: 'detect-input',

    update(dt: number) {
        // 获取玩家实体来读取输入意图 (PlayerIntentSystem 已经处理了原始输入)
        let player: IEntity | null = null;
        const players = world.with('player', 'playerIntent');
        for (const p of players) {
            player = p as IEntity;
            break;
        }

        if (!player) return;

        // 获取全局管理实体
        const globalEntity = world.with('globalManager').first as IEntity;
        if (!globalEntity || !globalEntity.inputState) return;

        const detectors = world.with('detectInput');

        for (const entity of detectors) {
            const e = entity as IEntity;
            const input = e.detectInput;

            if (!input || !input.keys) continue;

            // 检查 'Interact' 键
            if (input.keys.includes('Interact')) {
                const wantsToInteract = player.playerIntent.wantsToInteract;
                const wasPressed = !!globalEntity.inputState.lastPressed['Interact'];

                // [FIXED] 使用全局状态来计算 justPressed，避免切换地图导致的重复触发
                input.justPressed = wantsToInteract && !wasPressed;
                input.isPressed = wantsToInteract;
            }

            // 检查 'Attack' 键
            if (input.keys.includes('Attack')) {
                const wantsToFire = !!player.weaponIntent?.wantsToFire;
                const wasPressed = !!globalEntity.inputState.lastPressed['Attack'];
                input.justPressed = wantsToFire && !wasPressed;
                input.isPressed = wantsToFire;
            }
        }

        // 循环结束后同步一次全局输入状态
        globalEntity.inputState.lastPressed['Interact'] = player.playerIntent.wantsToInteract;
        globalEntity.inputState.lastPressed['Attack'] = !!player.weaponIntent?.wantsToFire;
    }
};
