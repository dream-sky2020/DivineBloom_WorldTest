import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { DetectArea, Trigger } from '@/game/entities/components/Triggers'
import { Actions } from '@/game/entities/components/Actions'

// --- Schema Definition ---

export const PortalEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  width: z.number(),
  height: z.number(),
  targetMapId: z.string(),
  targetEntryId: z.string()
});

// --- Entity Definition ---

export const PortalEntity = {
  /**
   * Create a Portal entity
   * @param {z.infer<typeof PortalEntitySchema>} data
   */
  create(data) {
    // Validate Input
    const result = PortalEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PortalEntity] Validation failed', result.error);
      // Fallback or throw? For now, let's try to proceed with partial data if possible or just log error.
      // But usually we should return null or handle error.
      // Given the previous code didn't validate, we'll assume caller tries to be correct, but we log validation error.
    }
    // We use the validated data if success, otherwise original data (or maybe we should just crash in dev?)
    // The prompt says "like Actions.js", which returns default/fallback on error.
    // However, entities are more complex. Actions returned a component object.
    // Here we are adding to world.

    // If validation fails, we might want to not create the entity to avoid undefined behavior.
    if (!result.success) return null;

    const { x, y, name, width, height, targetMapId, targetEntryId } = result.data;

    // Offset calculation:
    // Portal position is usually top-left or center? 
    // Assuming x,y passed here are top-left of the zone (based on usual Tiled map export).
    // Our AABB detect system expects a center position for the entity + offset.
    // If entity.position is set to {x,y}, and we want the box to be from x to x+w:
    // With offset { w/2, h/2 } and size { w, h }, center is x+w/2, box is [x, x+w].

    return world.add({
      type: 'portal',
      name: name || `To_${targetMapId}`,
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

      actionTeleport: Actions.Teleport(targetMapId, targetEntryId)
    })
  },

  // Portal Serialization
  serialize(entity) {
    // 逆向解构：从 Component 还原配置数据
    const { position, detectArea, actionTeleport, name } = entity

    // detectArea.size => {w, h}
    // actionTeleport => {mapId, entryId}

    return {
      type: 'portal',
      x: position.x,
      y: position.y,
      name: name,
      width: detectArea.size.w,
      height: detectArea.size.h,
      targetMapId: actionTeleport.mapId,
      targetEntryId: actionTeleport.entryId
    }
  }
}
