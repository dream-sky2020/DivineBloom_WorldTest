import { world } from '@/game/ecs/world'

/**
 * Teleport System
 * 处理地图切换逻辑
 */
export const TeleportExecuteSystem = {
  handle(entity, callbacks) {
    if (callbacks.onSwitchMap && entity.actionTeleport) {
      callbacks.onSwitchMap(entity.actionTeleport.mapId, entity.actionTeleport.entryId)
    }
  }
}
