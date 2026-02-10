import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
  PortalDetect, Portal,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  ShapeType,
  PORTAL_DETECT_INSPECTOR_FIELDS,
  PORTAL_INSPECTOR_FIELDS,
  TRANSFORM_INSPECTOR_FIELDS,
  Transform, Parent, Children, LocalTransform, Shape,
  SHAPE_INSPECTOR_FIELDS, LOCAL_TRANSFORM_INSPECTOR_FIELDS
} from '@components';

// --- Schema Definition ---

export const PortalEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  width: z.number(),
  height: z.number(),
  isForced: z.boolean().optional().default(true),
  targetMapId: z.string().optional(),
  targetEntryId: z.string().optional(),
  destinationId: z.string().optional(),
  targetX: z.number().optional(),
  targetY: z.number().optional()
}).refine(
  data => {
    const isCrossMap = data.targetMapId != null && data.targetEntryId != null
    const isLocalTeleport = data.destinationId != null || (data.targetX != null && data.targetY != null)
    return isCrossMap || isLocalTeleport
  },
  { message: "Portal must have either (targetMapId + targetEntryId) for cross-map teleport or (destinationId / targetX + targetY) for local teleport" }
);

export type PortalEntityData = z.infer<typeof PortalEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '传送门名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const PortalEntity: IEntityDefinition<typeof PortalEntitySchema> = {
  type: 'portal',
  name: '传送门',
  order: 60,
  creationIndex: 0,
  schema: PortalEntitySchema,
  create(data: PortalEntityData) {
    const result = PortalEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PortalEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, width, height, isForced, targetMapId, targetEntryId, destinationId, targetX, targetY } = result.data;
    const isCrossMap = targetMapId != null && targetEntryId != null
    const isLocalTeleport = destinationId != null || (targetX != null && targetY != null)

    let portalName = name || (isCrossMap ? `To_${targetMapId}_${targetEntryId}` : destinationId ? `To_${destinationId}` : `Teleport_${targetX}_${targetY}`);

    const root = world.add({
      type: 'portal',
      name: portalName,
      transform: Transform.create(x, y)
    });

    // Sensor Child (Detection Only)
    const sensor = world.add({
      parent: Parent.create(root),
      transform: Transform.create(),
      localTransform: LocalTransform.create(width / 2, height / 2),
      name: `${root.name}_Sensor`,
      shape: Shape.create({
          type: ShapeType.AABB,
          width: width,
          height: height,
      }),
      portalDetect: PortalDetect.create({}),
      portal: Portal.create({
        mapId: isCrossMap ? targetMapId : undefined,
        entryId: isCrossMap ? targetEntryId : undefined,
        destinationId: isLocalTeleport && destinationId ? destinationId : undefined,
        targetX: isLocalTeleport && targetX != null ? targetX : undefined,
        targetY: isLocalTeleport && targetY != null ? targetY : undefined,
        defaultCooldown: isForced ? 0.5 : 0.8,
        isForced
      })
    });

    root.children = Children.create([sensor]);
    sensor.inspector = Inspector.create({
      fields: [
        ...(LOCAL_TRANSFORM_INSPECTOR_FIELDS || []),
        ...(SHAPE_INSPECTOR_FIELDS || []),
        ...(PORTAL_DETECT_INSPECTOR_FIELDS || []),
        ...(PORTAL_INSPECTOR_FIELDS || [])
      ],
      hitPriority: 60,
      editorBox: { w: 30, h: 30, scale: 1 }
    });

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 70,
      editorBox: { w: 40, h: 40, anchorX: 0, anchorY: 0 }
    });

    return root;
  },

  serialize(entity: any) {
    const { transform, name, children } = entity
    
    // 从子实体中获取探测区域尺寸
    // @ts-ignore
    const sensor = children?.entities.find(e => e.portalDetect || e.portal);
    const shape = sensor?.shape;
    const portal = sensor?.portal;

    const data: any = {
      type: 'portal',
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      name: name,
      width: shape?.width ?? 0,
      height: shape?.height ?? 0,
      isForced: portal?.isForced ?? true
    }

    if (portal?.mapId != null && portal?.entryId != null) {
      data.targetMapId = portal.mapId
      data.targetEntryId = portal.entryId
    } else if (portal?.destinationId != null) {
      data.destinationId = portal.destinationId
    } else if (portal?.targetX != null && portal?.targetY != null) {
      data.targetX = portal.targetX
      data.targetY = portal.targetY
    }
    return data;
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
