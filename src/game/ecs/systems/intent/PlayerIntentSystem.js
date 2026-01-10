import { world } from '@/game/ecs/world'

/**
 * Player Intent System
 * 负责解析原始输入 (RawInput) 并转化为玩家意图 (PlayerIntent)
 * 处理死区、归一化、输入缓冲、连击判断等逻辑
 * 
 * Target Entities:
 * @property {object} rawInput
 * 
 * Output Component:
 * @property {object} playerIntent
 * @property {object} playerIntent.move { x, y } (Normalized)
 * @property {boolean} playerIntent.wantsToRun
 * @property {boolean} playerIntent.wantsToInteract
 */

const intentEntities = world.with('rawInput')

export const PlayerIntentSystem = {
    update(dt) {
        for (const entity of intentEntities) {
            // Ensure intent component exists
            if (!entity.playerIntent) {
                world.addComponent(entity, 'playerIntent', {
                    move: { x: 0, y: 0 },
                    wantsToRun: false,
                    wantsToInteract: false
                })
            }

            const raw = entity.rawInput
            const intent = entity.playerIntent

            // 1. Process Movement Intent
            let dx = raw.axes.x
            let dy = raw.axes.y

            // Normalize diagonal movement
            if (dx !== 0 && dy !== 0) {
                const inv = 1 / Math.sqrt(2)
                dx *= inv
                dy *= inv
            }

            intent.move.x = dx
            intent.move.y = dy

            // 2. Process Action Intents
            intent.wantsToRun = raw.buttons.run
            intent.wantsToInteract = raw.buttons.interact
            
            // 这里可以添加状态机逻辑，例如：
            // 如果处于 "对话中" 状态，忽略移动意图
            // 如果处于 "攻击后摇" 状态，缓存输入等
        }
    }
}

