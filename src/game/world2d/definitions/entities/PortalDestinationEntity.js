import { z } from 'zod'
import { world } from '@world2d/world'
import { Inspector, EDITOR_INSPECTOR_FIELDS } from '@components'

// --- Schema Definition ---

export const PortalDestinationEntitySchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  visual: z.object({
    color: z.string().optional().default('#8b5cf6'),
    size: z.number().optional().default(20)
  }).optional()
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'destinationId', label: '目的地 ID', type: 'text', tip: '传送门引用的唯一 ID', props: { readonly: true }, group: '基本属性' },
  { path: 'name', label: '显示名称', type: 'text', group: '基本属性' },
  { path: 'position.x', label: '坐标 X', type: 'number', group: '基本属性' },
  { path: 'position.y', label: '坐标 Y', type: 'number', group: '基本属性' },
  ...EDITOR_INSPECTOR_FIELDS
];

export const PortalDestinationEntity = {
  create(data) {
    const result = PortalDestinationEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PortalDestinationEntity] Validation failed', result.error);
      return null;
    }

    const { id, x, y, name, visual } = result.data;
    const destName = name || `Destination_${id}`

    const entity = {
      type: 'portal_destination',
      name: destName,
      destinationId: id,
      position: { x, y },
      visual: {
        type: 'rect',
        color: visual?.color || '#8b5cf6',
        size: visual?.size || 20,
        width: visual?.size || 20,
        height: visual?.size || 20
      },
      isStatic: true,
    };

    entity.inspector = Inspector.create({ 
      fields: INSPECTOR_FIELDS,
      hitPriority: 60,
      editorBox: { w: 32, h: 32, anchorX: 0.5, anchorY: 0.5 }
    });

    return world.add(entity);
  },

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
