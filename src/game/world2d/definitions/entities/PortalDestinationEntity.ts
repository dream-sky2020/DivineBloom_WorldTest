import { z } from 'zod';
import { world } from '@world2d/runtime/WorldEcsRuntime';
import { IEntityDefinition } from '../interface/IEntity';
import { Inspector, EDITOR_INSPECTOR_FIELDS, Transform, TRANSFORM_INSPECTOR_FIELDS } from '@components';

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

export type PortalDestinationEntityData = z.infer<typeof PortalDestinationEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'destinationId', label: '目的地 ID', type: 'text', tip: '传送门引用的唯一 ID', props: { readonly: true }, group: '基本属性' },
  { path: 'name', label: '显示名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const PortalDestinationEntity: IEntityDefinition<typeof PortalDestinationEntitySchema> = {
  type: 'portal_destination',
  name: '传送点',
  order: 61,
  creationIndex: 0,
  schema: PortalDestinationEntitySchema,
  create(data: PortalDestinationEntityData) {
    const result = PortalDestinationEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PortalDestinationEntity] Validation failed', result.error);
      return null;
    }

    const { id, x, y, name, visual } = result.data;
    const destName = name || `Destination_${id}`

    const entity: any = {
      type: 'portal_destination',
      name: destName,
      destinationId: id,
      transform: Transform.create(x, y),
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
      editorBox: { w: 40, h: 40, anchorX: 0.5, anchorY: 0.5 }
    });

    return world.add(entity);
  },

  serialize(entity: any) {
    const { transform, destinationId, name, visual } = entity
    return {
      type: 'portal_destination',
      id: destinationId,
      x: transform.x,
      y: transform.y,
      name: name,
      visual: visual ? {
        color: visual.color,
        size: visual.size
      } : undefined
    }
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
