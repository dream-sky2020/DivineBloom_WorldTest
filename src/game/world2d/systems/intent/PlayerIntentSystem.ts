import { world } from '@world2d/world';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('PlayerIntentSystem');

/**
 * Player Intent System
 * 负责解析原始输入 (RawInput) 并转化为玩家意图 (PlayerIntent)
 */
export const PlayerIntentSystem: ISystem = {
    name: 'player-intent',

    update(dt: number) {
        const intentEntities = world.with('rawInput');
        for (const entity of intentEntities) {
            const e = entity as IEntity;
            // Defensive Check
            if (!e.rawInput) {
                logger.error(`Entity ${e.id || 'N/A'} has rawInput tag but no component!`);
                continue;
            }

            // Ensure intent component exists
            if (!e.playerIntent) {
                world.addComponent(e, 'playerIntent', {
                    move: { x: 0, y: 0 },
                    wantsToRun: false,
                    wantsToInteract: false,
                    wantsToOpenMenu: false,
                    wantsToOpenShop: false
                });
            }

            // Ensure weapon intent component exists (if entity has weapon)
            if (e.weapon && !e.weaponIntent) {
                world.addComponent(e, 'weaponIntent', {
                    wantsToFire: false,
                    aimDirection: { x: 1, y: 0 }
                });
            }

            const raw = e.rawInput;
            const intent = e.playerIntent;

            // Validate Raw Input Structure
            if (!raw.axes || !raw.buttons) {
                logger.warn(`Invalid rawInput structure for Entity ${e.id || 'N/A'}`);
                // Reset intent
                intent.move.x = 0; intent.move.y = 0;
                intent.wantsToRun = false;
                continue;
            }

            // 1. Process Movement Intent
            let dx = raw.axes.x || 0;
            let dy = raw.axes.y || 0;

            // Normalize diagonal movement
            if (dx !== 0 && dy !== 0) {
                const inv = 1 / Math.sqrt(2);
                dx *= inv;
                dy *= inv;
            }

            // Defensive: Ensure intent.move exists
            if (!intent.move) intent.move = { x: 0, y: 0 };

            intent.move.x = dx;
            intent.move.y = dy;

            // 2. Process Action Intents
            intent.wantsToRun = !!raw.buttons.run;
            intent.wantsToInteract = !!raw.buttons.interact;
            intent.wantsToOpenMenu = !!raw.buttons.menu;
            intent.wantsToOpenShop = !!raw.buttons.shop;

            // 3. Process Weapon Intent (if entity has weapon)
            if (e.weaponIntent) {
                e.weaponIntent.wantsToFire = !!raw.buttons.attack;

                // 计算瞄准方向（基于移动方向或鼠标位置）
                if (raw.buttons.attack) {
                    // 如果有移动输入，朝移动方向射击
                    if (dx !== 0 || dy !== 0) {
                        e.weaponIntent.aimDirection.x = dx;
                        e.weaponIntent.aimDirection.y = dy;
                    }
                    // 否则保持上次的射击方向
                }
            }

            // Debug Log (Optional)
            if (intent.wantsToInteract) {
                logger.debug(`Interaction Intent Registered! Entity: ${e.name || e.type || 'N/A'}`);
            }
            if (e.weaponIntent?.wantsToFire) {
                logger.debug(`Fire Intent Registered! Entity: ${e.name || e.type || 'N/A'}, Direction: (${e.weaponIntent.aimDirection.x.toFixed(2)}, ${e.weaponIntent.aimDirection.y.toFixed(2)})`);
            }
        }
    }
};
