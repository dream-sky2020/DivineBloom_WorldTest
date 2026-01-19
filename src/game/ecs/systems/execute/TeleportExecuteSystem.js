import { world } from '@/game/ecs/world'
import { SceneTransition } from '@/game/ecs/entities/components/Requests'
import { createLogger } from '@/utils/logger'

const logger = createLogger('TeleportSystem')

/**
 * Teleport System
 * 处理传送逻辑（同地图传送和跨地图传送）
 */
export const TeleportExecuteSystem = {
  handle(request, callbacks, mapData) {
    const entity = request.source
    const targetEntity = request.target

    logger.info('Handle called for entity:', entity.type)

    if (!entity.actionTeleport) {
      logger.warn('Entity missing actionTeleport component!', entity)
      return
    }

    const { mapId, entryId, destinationId, targetX, targetY } = entity.actionTeleport

    // 安全检查：防止无效的 mapId（如验证失败时的 fallback 值）
    if (mapId === 'error' || mapId === 'null' || mapId === 'undefined') {
      logger.error('Invalid mapId detected, aborting teleport:', mapId)
      return
    }

    // 判断传送类型（使用 != null 来同时排除 null 和 undefined）
    const isCrossMapTeleport = mapId != null && entryId != null
    const isLocalTeleport = destinationId != null || (targetX != null && targetY != null)

    // === 同地图传送：使用目的地实体或直接坐标 ===
    if (isLocalTeleport) {
      if (!targetEntity || !targetEntity.position) {
        logger.warn('Local teleport failed: No target entity or target has no position')
        return
      }

      let finalX, finalY

      // 优先使用目的地实体ID查找实际坐标
      if (destinationId != null) {
        const destinations = world.with('destinationId', 'position')
        const destination = [...destinations].find(d => d.destinationId === destinationId)
        
        if (destination) {
          finalX = destination.position.x
          finalY = destination.position.y
          logger.info(`Local teleport: Moving ${targetEntity.type} to destination '${destinationId}' at (${finalX}, ${finalY})`)
        } else {
          logger.error(`Destination entity '${destinationId}' not found! Teleport aborted.`)
          return
        }
      } else if (targetX != null && targetY != null) {
        // 使用直接坐标
        finalX = targetX
        finalY = targetY
        logger.info(`Local teleport: Moving ${targetEntity.type} to direct coords (${finalX}, ${finalY})`)
      } else {
        logger.error('Invalid local teleport: No destinationId or coordinates provided')
        return
      }

      targetEntity.position.x = finalX
      targetEntity.position.y = finalY

      // 移除临时 Action (如果不是 Portal)
      if (entity.type !== 'portal') {
        world.removeComponent(entity, 'actionTeleport')
      }
      return
    }

    // === 跨地图传送：使用 mapId 和 entryId ===
    if (isCrossMapTeleport) {
      logger.info(`Triggering transition to ${mapId}:${entryId}`)

      // 给实体添加切换场景请求，交由 WorldScene → SceneManager 处理
      world.addComponent(entity, 'sceneTransition', SceneTransition({
        mapId,
        entryId
      }))

      // 如果不是 Portal (例如 Player 的临时 Action)，则移除组件
      if (entity.type !== 'portal') {
        world.removeComponent(entity, 'actionTeleport')
      }

      logger.info(`Requesting transition to map: ${mapId}, entry: ${entryId}`)
      return
    }

    // 如果两种模式都不满足，说明配置有问题
    logger.error('Invalid teleport configuration: must have either (mapId + entryId) or (destinationId / targetX + targetY)', entity.actionTeleport)
  }
}
