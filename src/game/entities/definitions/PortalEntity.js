import { world } from '@/game/ecs/world'
import { Triggers } from '@/game/entities/components/Triggers'
import { Actions } from '@/game/entities/components/Actions'

export const PortalEntity = {
  /**
   * Create a Portal entity
   * @param {object} data
   * @param {number} data.x
   * @param {number} data.y
   * @param {number} data.width
   * @param {number} data.height
   * @param {string} data.targetMapId
   * @param {string} data.targetEntryId
   */
  create(data) {
    const { x, y, width, height, targetMapId, targetEntryId } = data
    
    return world.add({
      type: 'portal',
      position: { x, y },
      trigger: Triggers.PlayerZone({ x: 0, y: 0, w: width, h: height }),
      actionTeleport: Actions.Teleport(targetMapId, targetEntryId)
    })
  },

  // Portal is static and usually defined in map data, so no serialization needed
  serialize(entity) {
    return null
  }
}
