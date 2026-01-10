import { world } from '@/game/ecs/world'
import { SceneTransition } from '@/game/entities/components/Requests'

/**
 * Teleport System
 * 处理地图切换逻辑
 */
export const TeleportExecuteSystem = {
  handle(entity, callbacks) {
    console.log('[TeleportSystem] Handle called for entity:', entity.type)

    if (entity.actionTeleport) {
      const { mapId, entryId } = entity.actionTeleport

      if (!mapId) {
        console.warn('[TeleportExecuteSystem] Missing mapId in actionTeleport')
        world.removeComponent(entity, 'actionTeleport')
        return
      }

      console.log(`[TeleportSystem] Triggering transition to ${mapId}:${entryId}`)

      // 给实体添加切换场景请求，交由 SceneSystem 处理
      world.addComponent(entity, 'sceneTransition', SceneTransition({
        mapId,
        entryId
      }))

      // 如果不是 Portal (例如 Player 的临时 Action)，则移除组件
      // Portal 的 Action 是配置数据，需要保留
      if (entity.type !== 'portal') {
        world.removeComponent(entity, 'actionTeleport')
      }

      console.log(`[TeleportExecuteSystem] Requesting transition to map: ${mapId}, entry: ${entryId}`)
    } else {
      console.warn('[TeleportSystem] Entity missing actionTeleport component!', entity)
    }
  }
}
