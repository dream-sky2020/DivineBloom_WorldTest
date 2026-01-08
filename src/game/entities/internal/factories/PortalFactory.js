import { world } from '@/game/ecs/world'

export const PortalFactory = {
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
      trigger: {
        type: 'ZONE',
        bounds: { x: 0, y: 0, w: width, h: height }
      },
      actionTeleport: {
        mapId: targetMapId,
        entryId: targetEntryId
      }
    })
  }
}

