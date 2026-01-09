import { eventQueue, actionQueue } from '@/game/ecs/world'
import { BattleSystem } from '@/game/ecs/systems/battle/BattleSystem'
import { TeleportSystem } from '@/game/ecs/systems/teleport/TeleportSystem'
import { DialogueSystem } from '@/game/ecs/systems/dialogue/DialogueSystem'

/**
 * 遗留事件处理器
 */
const EventHandlers = {
    TRIGGER_BATTLE: (payload, callbacks) => {
        if (callbacks.onEncounter) callbacks.onEncounter(payload.battleGroup, payload.uuid)
    },
    TRIGGER_MAP_SWITCH: (payload, callbacks) => {
        if (callbacks.onSwitchMap) callbacks.onSwitchMap(payload.targetMapId, payload.targetEntryId)
    },
    INTERACT_NPC: (payload, callbacks) => {
        if (callbacks.onInteract) callbacks.onInteract(payload.interaction)
    }
}

/**
 * 动作处理器注册表
 * 键: 组件名称
 * 值: 处理系统/函数
 * 顺序: 数组顺序决定了优先级的默认顺序 (如果需要更复杂的优先级，可能需要权重系统)
 */
const ActionHandlers = [
    { component: 'actionBattle', handler: BattleSystem },
    { component: 'actionTeleport', handler: TeleportSystem },
    { component: 'actionDialogue', handler: DialogueSystem }
]

/**
 * Action System Facade
 * 统一调度各个子系统，并处理事件队列
 */
export const ActionSystem = {
    /**
     * @param {object} callbacks - External callbacks
     */
    update(callbacks = {}) {
        // 1. Process Action Queue (Triggered Events)
        while (actionQueue.length > 0) {
            const event = actionQueue.shift() // FIFO
            const { source } = event

            if (!source) continue

            // 动态匹配行为组件
            for (const { component, handler } of ActionHandlers) {
                if (source[component]) {
                    handler.handle(source, callbacks)
                    // 目前设计为：一次触发通常只执行一个主要动作，避免冲突
                    // 如果需要同时执行多个动作，可以移除 break
                    break 
                }
            }
        }

        // 2. Process Legacy/UI Events (EventQueue)
        const events = eventQueue.drain()
        for (const event of events) {
            const handler = EventHandlers[event.type]
            if (handler) {
                handler(event.payload, callbacks)
            }
        }
    }
}
