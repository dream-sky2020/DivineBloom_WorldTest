import { z } from 'zod'
import { world } from '@/game/ecs/world'

// --- Schema Definition ---

export const PortalDestinationEntitySchema = z.object({
  id: z.string(), // 唯一标识符，用于被传送门引用
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  // 可选的视觉配置
  visual: z.object({
    color: z.string().optional().default('#8b5cf6'), // 紫色
    size: z.number().optional().default(20)
  }).optional()
});

// --- Entity Definition ---

export const PortalDestinationEntity = {
  /**
   * Create a Portal Destination entity
   * @param {z.infer<typeof PortalDestinationEntitySchema>} data
   */
  create(data) {
    // Validate Input
    const result = PortalDestinationEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PortalDestinationEntity] Validation failed', result.error);
      return null;
    }

    const { id, x, y, name, visual } = result.data;

    // 生成默认名称
    const destName = name || `Destination_${id}`

    // 创建实体
    return world.add({
      type: 'portal_destination',
      name: destName,
      destinationId: id, // 目的地唯一ID
      position: { x, y },
      
      // 视觉配置（用于渲染系统）
      visual: {
        color: visual?.color || '#8b5cf6',
        size: visual?.size || 20
      },

      // 标记为不可序列化的静态实体（从地图配置加载）
      isStatic: true
    })
  },

  // Portal Destination Serialization
  serialize(entity) {
    const { position, destinationId, name, visual } = entity

    return {
      type: 'portal_destination',
      id: destinationId,
      x: position.x,
      y: position.y,
      name: name,
      visual: visual ? {
        color: visual.color,
        size: visual.size
      } : undefined
    }
  }
}
