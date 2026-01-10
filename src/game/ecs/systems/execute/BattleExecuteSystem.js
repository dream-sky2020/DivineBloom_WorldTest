import { world } from '@/game/ecs/world'
import { BattleTransition } from '@/game/entities/components/Requests'

export const BattleExecuteSystem = {
  handle(entity, callbacks) {
    if (entity.actionBattle) {
      const { group, uuid } = entity.actionBattle

      if (!group) {
        console.warn('[BattleExecuteSystem] Missing enemy group in actionBattle')
        world.removeComponent(entity, 'actionBattle')
        return
      }

      // 延迟处理：添加组件，由 SceneSystem 在帧末尾统一处理
      // 这样可以避免在帧中间销毁 World 导致后续 System 报错
      world.addComponent(entity, 'battleTransition', BattleTransition({
        enemyGroup: group,
        battleId: uuid
      }))

      // 如果是 Enemy (配置数据)，则保留组件；如果是临时 Action (如 Player 主动发起)，则移除
      // 目前 Enemy 的 actionBattle 也是配置，不能移除，否则逃跑后无法再次触发
      if (entity.type !== 'enemy') {
        world.removeComponent(entity, 'actionBattle')
      }

      console.log(`[BattleExecuteSystem] Requesting battle with group:`, group)
    }
  }
}
