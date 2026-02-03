import { world } from '@world2d/world'
import { SceneTransition } from '@components'
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
      if (!targetEntity || !targetEntity.transform) {
        logger.warn('Local teleport failed: No target entity or target has no transform')
        return
      }

      let finalX, finalY

      // 优先使用目的地实体ID查找实际坐标
      if (destinationId != null) {
        const destinations = world.with('destinationId', 'transform')
        const destination = [...destinations].find(d => d.destinationId === destinationId)
        
        if (destination) {
          finalX = destination.transform.x
          finalY = destination.transform.y
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

      targetEntity.transform.x = finalX
      targetEntity.transform.y = finalY

      // 移除临时 Action (如果不是 Portal)
      if (entity.type !== 'portal') {
        world.removeComponent(entity, 'actionTeleport')
      }
      return
    }

    // === 跨地图传送：使用 mapId 和 entryId ===
    if (isCrossMapTeleport) {
      // 关键安全检查：仅允许具备 'player' 标签的实体触发跨地图传送
      const isPlayer = targetEntity.detectable?.labels?.includes('player')
      
      if (!isPlayer) {
        logger.info(`Cross-map teleport ignored for non-player entity: ${targetEntity.type}`)
        return
      }

      logger.info(`Triggering transition to ${mapId}:${entryId} for player`)

      // 给触发传送的实体（玩家）添加切换场景请求
      // WorldScene 会检测到此请求并通知 SceneManager
      world.addComponent(targetEntity, 'sceneTransition', SceneTransition({
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
