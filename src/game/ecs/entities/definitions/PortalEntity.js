import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { DetectArea, Trigger } from '@/game/ecs/entities/components/Triggers'
import { Actions } from '@/game/ecs/entities/components/Actions'

// --- Schema Definition ---

export const PortalEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  width: z.number(),
  height: z.number(),
  // 跨地图传送：需要 targetMapId 和 targetEntryId
  targetMapId: z.string().optional(),
  targetEntryId: z.string().optional(),
  // 同地图传送：可以使用 destinationId（推荐）或直接坐标 targetX/targetY
  destinationId: z.string().optional(),
  targetX: z.number().optional(),
  targetY: z.number().optional()
}).refine(
  data => {
    // 必须是跨地图传送或同地图传送之一
    // 使用 != null 来同时排除 null 和 undefined
    const isCrossMap = data.targetMapId != null && data.targetEntryId != null
    const isLocalTeleport = data.destinationId != null || (data.targetX != null && data.targetY != null)
    return isCrossMap || isLocalTeleport
  },
  {
    message: "Portal must have either (targetMapId + targetEntryId) for cross-map teleport or (destinationId / targetX + targetY) for local teleport"
  }
);

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
      return null;
    }

    const { x, y, name, width, height, targetMapId, targetEntryId, destinationId, targetX, targetY } = result.data;

    // 判断传送类型（使用 != null 来同时排除 null 和 undefined）
    const isCrossMap = targetMapId != null && targetEntryId != null
    const isLocalTeleport = destinationId != null || (targetX != null && targetY != null)

    // 生成默认名称
    let portalName = name
    if (!portalName) {
      if (isCrossMap) {
        portalName = `To_${targetMapId}_${targetEntryId}`
      } else if (destinationId) {
        portalName = `To_${destinationId}`
      } else if (targetX != null && targetY != null) {
        portalName = `Local_Teleport_${targetX}_${targetY}`
      }
    }

    // Offset calculation:
    // Portal position is usually top-left or center? 
    // Assuming x,y passed here are top-left of the zone (based on usual Tiled map export).
    // Our AABB detect system expects a center position for the entity + offset.
    // If entity.position is set to {x,y}, and we want the box to be from x to x+w:
    // With offset { w/2, h/2 } and size { w, h }, center is x+w/2, box is [x, x+w].

    return world.add({
      type: 'portal',
      name: portalName,
      position: { x, y },

      detectArea: DetectArea({
        shape: 'aabb',
        offset: { x: width / 2, y: height / 2 },
        size: { w: width, h: height },
        target: ['player']  // 只检测玩家，不检测敌人（避免敌人误触传送门）
      }),

      trigger: Trigger({
        rules: [{ type: 'onEnter', requireEnterOnly: true }],  // 只在刚进入时触发一次
        actions: ['TELEPORT']
      }),

      actionTeleport: Actions.Teleport(
        isCrossMap ? targetMapId : undefined,
        isCrossMap ? targetEntryId : undefined,
        isLocalTeleport && destinationId ? destinationId : undefined,
        isLocalTeleport && targetX != null ? targetX : undefined,
        isLocalTeleport && targetY != null ? targetY : undefined
      )
    })
  },

  // Portal Serialization
  serialize(entity) {
    // 逆向解构：从 Component 还原配置数据
    const { position, detectArea, actionTeleport, name } = entity

    // detectArea.size => {w, h}
    // actionTeleport => {mapId, entryId, destinationId, targetX, targetY}

    const data = {
      type: 'portal',
      x: position.x,
      y: position.y,
      name: name,
      width: detectArea.size.w,
      height: detectArea.size.h
    }

    // 根据传送类型添加对应字段（使用 != null 来同时排除 null 和 undefined）
    if (actionTeleport.mapId != null && actionTeleport.entryId != null) {
      // 跨地图传送
      data.targetMapId = actionTeleport.mapId
      data.targetEntryId = actionTeleport.entryId
    } else if (actionTeleport.destinationId != null) {
      // 同地图传送（使用目的地实体）
      data.destinationId = actionTeleport.destinationId
    } else if (actionTeleport.targetX != null && actionTeleport.targetY != null) {
      // 同地图传送（使用直接坐标）
      data.targetX = actionTeleport.targetX
      data.targetY = actionTeleport.targetY
    }

    return data
  }
}
