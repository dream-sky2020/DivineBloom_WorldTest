import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { Inspector } from '@/game/ecs/entities/components/Inspector'

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

const INSPECTOR_FIELDS = [
  { path: 'destinationId', label: '目的地 ID', type: 'text', tip: '传送门引用的唯一 ID', props: { readonly: true } },
  { path: 'name', label: '显示名称', type: 'text' },
  { path: 'position.x', label: '坐标 X', type: 'number' },
  { path: 'position.y', label: '坐标 Y', type: 'number' }
];

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
        type: 'rect', // 指定类型为 rect，避免被 VisualRenderSystem 误判为缺失 id 的 Sprite
        color: visual?.color || '#8b5cf6',
        size: visual?.size || 20,
        width: visual?.size || 20,
        height: visual?.size || 20
      },

      // 标记为不可序列化的静态实体（从地图配置加载）
      isStatic: true,

      // [NEW] 添加 Inspector
      inspector: Inspector.create({ 
        fields: INSPECTOR_FIELDS,
        hitPriority: 60,
        // 目的地是一个点，我们定义一个稍大的编辑框方便点击
        editorBox: {
          w: 32,
          h: 32,
          anchorX: 0.5,
          anchorY: 0.5
        }
      })
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
