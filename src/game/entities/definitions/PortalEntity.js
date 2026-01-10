import { world } from '@/game/ecs/world'
import { DetectArea, Trigger } from '@/game/entities/components/Triggers'
import { Actions } from '@/game/entities/components/Actions'
import { Visuals } from '@/game/entities/components/Visuals'

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
    
    // Offset calculation:
    // Portal position is usually top-left or center? 
    // Assuming x,y passed here are top-left of the zone (based on usual Tiled map export).
    // Our AABB detect system expects a center position for the entity + offset.
    // If entity.position is set to {x,y}, and we want the box to be from x to x+w:
    // With offset { w/2, h/2 } and size { w, h }, center is x+w/2, box is [x, x+w].
    
    return world.add({
      type: 'portal',
      position: { x, y },
      
      detectArea: DetectArea({ 
        shape: 'aabb', 
        offset: { x: width / 2, y: height / 2 },
        size: { w: width, h: height },
        target: 'player'
      }),
      
      trigger: Trigger({ 
        rules: [{ type: 'onEnter' }], 
        actions: ['TELEPORT'] 
      }),

      actionTeleport: Actions.Teleport(targetMapId, targetEntryId),

      visual: Visuals.Sprite('portal_default', 1, 'default')
    })
  },

  // Portal Serialization
  serialize(entity) {
    // 逆向解构：从 Component 还原配置数据
    const { position, detectArea, actionTeleport } = entity
    
    // detectArea.size => {w, h}
    // actionTeleport => {mapId, entryId}
    
    return {
      x: position.x,
      y: position.y,
      width: detectArea.size.w,
      height: detectArea.size.h,
      targetMapId: actionTeleport.mapId,
      targetEntryId: actionTeleport.entryId
    }
  }
}
