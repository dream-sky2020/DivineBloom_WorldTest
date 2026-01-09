import { world, actionQueue } from '@/game/ecs/world'
import { TriggerCheckers } from './TriggerCheckers'

/**
 * Trigger System (Controller)
 * 职责：
 * 1. 遍历所有触发器实体
 * 2. 委托 TriggerCheckers 进行条件判断
 * 3. 收集触发结果并推送到 ActionQueue
 */

const triggers = world.with('position', 'trigger')
const playerQuery = world.with('player', 'position')

export const TriggerSystem = {
    /**
     * @param {number} dt
     */
    update(dt) {
        // 1. 获取玩家 (Context)
        let player = null
        for (const p of playerQuery) {
            player = p
            break
        }
        if (!player) return

        // 2. 遍历触发器
        for (const entity of triggers) {
            // 前置检查：如果实体被禁用 (例如昏迷的敌人)
            if (entity.aiState && entity.aiState.state === 'stunned') continue
            if (entity.trigger.active === false) continue

            const t = entity.trigger
            const checker = TriggerCheckers[t.type]
            
            // 3. 执行检测策略
            if (checker) {
                const isTriggered = checker(entity, player, dt)

                // 4. 触发成功 -> 发送事件
                if (isTriggered) {
                    // console.log(`[TriggerSystem] Triggered: ${t.type}`, entity)
                    
                    actionQueue.push({
                        source: entity,
                        target: player,
                        type: t.type
                    })

                    // Handle One-shot triggers (Optional logic)
                    if (t.oneshot) {
                        t.active = false
                    }
                }
            } else {
                console.warn(`[TriggerSystem] Unknown trigger type: ${t.type}`)
            }
        }
    }
}
