import { world } from '@/game/ecs/world'
import { SceneTransition } from '@/game/entities/components/Requests'
import { createLogger } from '@/utils/logger'

const logger = createLogger('TeleportSystem')

/**
 * Teleport System
 * 处理地图切换逻辑
 */
export const TeleportExecuteSystem = {
  handle(entity, callbacks) {
    logger.info('Handle called for entity:', entity.type)

    if (entity.actionTeleport) {
      const { mapId, entryId } = entity.actionTeleport

      if (!mapId) {
        logger.warn('Missing mapId in actionTeleport')
        world.removeComponent(entity, 'actionTeleport')
        return
      }

      logger.info(`Triggering transition to ${mapId}:${entryId}`)

      // 给实体添加切换场景请求，交由 WorldScene → SceneManager 处理
      world.addComponent(entity, 'sceneTransition', SceneTransition({
        mapId,
        entryId
      }))

      // 如果不是 Portal (例如 Player 的临时 Action)，则移除组件
      // Portal 的 Action 是配置数据，需要保留
      if (entity.type !== 'portal') {
        world.removeComponent(entity, 'actionTeleport')
      }

      logger.info(`Requesting transition to map: ${mapId}, entry: ${entryId}`)
    } else {
      logger.warn('Entity missing actionTeleport component!', entity)
    }
  }
}
