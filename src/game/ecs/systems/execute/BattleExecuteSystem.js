import { actionQueue } from '@/game/ecs/world'

/**
 * Battle System
 * 处理战斗遭遇逻辑
 */
export const BattleExecuteSystem = {
  update(callbacks = {}) {
    // 遍历 ActionQueue, 寻找需要战斗的实体
    // 注意：不要在这里移除队列内容，由 ActionSystem 主循环统一清空，或者只处理对应类型的

    // 更好的方式是 ActionSystem 将 entity 传递进来，而不是 BattleSystem 自己去遍历
    // 但为了保持接口一致，我们可以在 ActionSystem 中做分发
  },

  /**
   * @param {object} entity 
   * @param {object} callbacks 
   */
  handle(entity, callbacks) {
    if (callbacks.onEncounter && entity.actionBattle) {
      callbacks.onEncounter(entity.actionBattle.group, entity.actionBattle.uuid)
    }
  }
}
