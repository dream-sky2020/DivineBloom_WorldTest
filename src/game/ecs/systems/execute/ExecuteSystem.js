import { actionQueue, eventQueue } from '@/game/ecs/world'
import { BattleExecuteSystem } from '@/game/ecs/systems/execute/BattleExecuteSystem'
import { DialogueExecuteSystem } from '@/game/ecs/systems/execute/DialogueExecuteSystem'
import { TeleportExecuteSystem } from '@/game/ecs/systems/execute/TeleportExecuteSystem'

/**
 * 遗留事件处理器
 */
const EventHandlers = {
  TRIGGER_BATTLE: (payload, callbacks) => {
    if (callbacks && callbacks.onEncounter) callbacks.onEncounter(payload.battleGroup, payload.uuid)
  },
  TRIGGER_MAP_SWITCH: (payload, callbacks) => {
    if (callbacks && callbacks.onSwitchMap) callbacks.onSwitchMap(payload.targetMapId, payload.targetEntryId)
  },
  INTERACT_NPC: (payload, callbacks) => {
    if (callbacks && callbacks.onInteract) callbacks.onInteract(payload.interaction)
  }
}

/**
 * ExecuteSystem
 * 任务执行总管
 * 接收 TriggerSystem 产生的 Action 请求，分发给具体子系统
 */
export const ExecuteSystem = {
  update(callbacks = {}) {
    // 1. 处理 ActionQueue (ECS 内部产生)
    // Defensive check: ensure queue exists (though imported)
    if (!actionQueue) {
      console.error('[ExecuteSystem] ActionQueue is undefined!');
      return;
    }

    const queueLength = actionQueue.length
    for (let i = 0; i < queueLength; i++) {
      const request = actionQueue.shift()
      if (!request) continue

      // Type Guard: Validate request structure
      if (!request.source || !request.type) {
        console.error('[ExecuteSystem] Invalid request structure:', request);
        continue;
      }

      const { source, type } = request

      // console.log(`[ExecuteSystem] Processing action: ${type}`, source.type)

      switch (type) {
        case 'BATTLE':
          BattleExecuteSystem.handle(source, callbacks)
          break

        case 'DIALOGUE':
          DialogueExecuteSystem.handle(source, callbacks)
          break

        case 'TELEPORT':
          TeleportExecuteSystem.handle(source, callbacks)
          break

        default:
          console.warn(`[ExecuteSystem] Unknown action type: ${type}`, source)
      }
    }

    // 2. 处理 Legacy/UI Events (EventQueue) - 保持兼容性
    if (!eventQueue) return;

    const events = eventQueue.drain()
    for (const event of events) {
      if (!event.type || !event.payload) {
        console.warn('[ExecuteSystem] Invalid legacy event format:', event);
        continue;
      }

      const handler = EventHandlers[event.type]
      if (handler) {
        try {
          handler(event.payload, callbacks)
        } catch (e) {
          console.error(`[ExecuteSystem] Error handling legacy event ${event.type}:`, e);
        }
      } else {
        // Optional: warn about unhandled legacy events if strict
      }
    }
  }
}
