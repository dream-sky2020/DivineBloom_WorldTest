import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { RawInput } from '@components';
import { createLogger } from '@/utils/logger';
import type { SystemContextBase } from '@definitions/interface/SystemContext';
import { getFrameContext } from '../../bridge/ExternalBridge';

const logger = createLogger('InputSenseSystem');

/**
 * Input Sense System
 * 负责读取硬件输入 (Keyboard/Gamepad) 并记录为原始输入组件 (RawInput)
 * 不涉及游戏逻辑判断，只忠实记录当前帧的输入状态
 */
export const InputSenseSystem: ISystem<SystemContextBase> = {
    name: 'input-sense',

    update(dt: number, _ctx?: SystemContextBase) {
        const frameContext = getFrameContext();
        const input = frameContext.input || frameContext.engine?.input;
        if (!input) {
            throw new Error('[InputSenseSystem] Missing required input in runtime frameContext');
        }

        const inputEntities = world.with('input');

        for (const entity of inputEntities) {
            const e = entity as IEntity;
            // Ensure rawInput component exists
            if (!e.rawInput) {
                world.addComponent(e, 'rawInput', RawInput.create());
            }

            const raw = e.rawInput;

            // Defensive check for raw structure
            if (!raw.axes || !raw.buttons) {
                logger.error(`[InputSenseSystem] Invalid rawInput structure on Entity ${e.id || 'N/A'}`);
                Object.assign(raw, RawInput.create());
            }

            const keys = input; // 假设 input 提供了类似 phaser/custom 的接口

            // 1. Reset
            raw.axes.x = 0;
            raw.axes.y = 0;
            raw.buttons.attackJustPressed = false;
            raw.buttons.attackJustReleased = false;
            raw.buttons.autoAttackEnable = false;
            raw.buttons.autoAttackDisable = false;

            try {
                // 2. Keyboard Mapping (Hardware Layer)
                // Defensive: Check if keys.isDown is a function
                if (typeof keys.isDown === 'function') {
                    if (keys.isDown('KeyW') || keys.isDown('ArrowUp')) raw.axes.y -= 1;
                    if (keys.isDown('KeyS') || keys.isDown('ArrowDown')) raw.axes.y += 1;
                    if (keys.isDown('KeyA') || keys.isDown('ArrowLeft')) raw.axes.x -= 1;
                    if (keys.isDown('KeyD') || keys.isDown('ArrowRight')) raw.axes.x += 1;

                    // Buttons
                    raw.buttons.run = keys.isDown('ShiftLeft') || keys.isDown('ShiftRight');
                    raw.buttons.interact = keys.isDown('Space') || keys.isDown('KeyE') || keys.isDown('Enter');
                    raw.buttons.menu = keys.isDown('KeyM');
                    raw.buttons.cancel = keys.isDown('Escape') || keys.isDown('Backspace');
                    raw.buttons.shop = keys.isDown('KeyP'); // Let's use P for Shop
                    const attackDown = keys.isDown('KeyJ') || keys.isDown('KeyK'); // J/K 键攻击
                    const autoAttackEnableDown = keys.isDown('KeyI'); // I 键开启自动攻击
                    const autoAttackDisableDown = keys.isDown('KeyO'); // O 键关闭自动攻击

                    if (!raw.__prevButtons) {
                        raw.__prevButtons = {
                            attack: false,
                            autoAttackEnable: false,
                            autoAttackDisable: false
                        };
                    }

                    raw.buttons.attack = attackDown;
                    raw.buttons.attackJustPressed = attackDown && !raw.__prevButtons.attack;
                    raw.buttons.attackJustReleased = !attackDown && raw.__prevButtons.attack;

                    // 自动攻击开/关 Sense: 只在按下沿生效，避免长按重复触发
                    raw.buttons.autoAttackEnable = autoAttackEnableDown && !raw.__prevButtons.autoAttackEnable;
                    raw.buttons.autoAttackDisable = autoAttackDisableDown && !raw.__prevButtons.autoAttackDisable;

                    raw.__prevButtons.attack = attackDown;
                    raw.__prevButtons.autoAttackEnable = autoAttackEnableDown;
                    raw.__prevButtons.autoAttackDisable = autoAttackDisableDown;
                }
            } catch (error) {
                logger.error('[InputSenseSystem] Error reading input:', error);
            }
        }
    }
};
