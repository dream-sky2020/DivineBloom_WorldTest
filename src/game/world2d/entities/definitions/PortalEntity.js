import { z } from 'zod'
import { world } from '@world2d/world'
import { DetectArea, DetectInput, Trigger } from '@world2d/entities/components/Triggers'
import { Actions } from '@world2d/entities/components/Actions'
import { Inspector, EDITOR_INSPECTOR_FIELDS } from '@world2d/entities/components/Inspector'

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

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '传送门名称', type: 'text', group: '基本属性' },
  { path: 'position.x', label: '坐标 X', type: 'number', group: '基本属性' },
  { path: 'position.y', label: '坐标 Y', type: 'number', group: '基本属性' },
  { path: 'detectArea.size.w', label: '触发宽度', type: 'number', group: '触发区域' },
  { path: 'detectArea.size.h', label: '触发高度', type: 'number', group: '触发区域' },
  { path: 'isForced', label: '强制传送', type: 'checkbox', tip: '勾选则触碰即走，不勾选需按交互键', group: '交互逻辑' },
  { path: 'actionTeleport.mapId', label: '目标地图', type: 'text', group: '目标位置' },
  { path: 'actionTeleport.entryId', label: '入口 ID', type: 'text', group: '目标位置' },
  { path: 'actionTeleport.destinationId', label: '同图目的地', type: 'text', group: '目标位置' },
  ...EDITOR_INSPECTOR_FIELDS
];

export const PortalEntity = {
  create(data) {
    const result = PortalEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PortalEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, width, height, isForced, targetMapId, targetEntryId, destinationId, targetX, targetY } = result.data;
    const isCrossMap = targetMapId != null && targetEntryId != null
    const isLocalTeleport = destinationId != null || (targetX != null && targetY != null)

    let portalName = name || (isCrossMap ? `To_${targetMapId}_${targetEntryId}` : destinationId ? `To_${destinationId}` : `Teleport_${targetX}_${targetY}`);

    const entity = {
      type: 'portal',
      name: portalName,
      position: { x, y },
      isForced: isForced,
      detectArea: DetectArea({
        shape: 'aabb',
        offset: { x: width / 2, y: height / 2 },
        size: { w: width, h: height },
        target: isForced ? 'teleportable' : 'player',
        debugColor: isForced ? 'rgba(168, 85, 247, 0.8)' : 'rgba(249, 115, 22, 0.8)'
      }),
      trigger: Trigger({
        rules: isForced ? [{ type: 'onStay' }] : [{ type: 'onPress', requireArea: true }],
        actions: ['TELEPORT'],
        defaultCooldown: isForced ? 0 : 0.8
      }),
      actionTeleport: Actions.Teleport(
        isCrossMap ? targetMapId : undefined,
        isCrossMap ? targetEntryId : undefined,
        isLocalTeleport && destinationId ? destinationId : undefined,
        isLocalTeleport && targetX != null ? targetX : undefined,
        isLocalTeleport && targetY != null ? targetY : undefined
      ),
    };

    if (!isForced) {
      entity.detectInput = DetectInput({ keys: ['Interact'] });
    }

    entity.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 70,
      editorBox: { w: width, h: height, anchorX: 0, anchorY: 0 }
    });

    return world.add(entity);
  },

  serialize(entity) {
    const { position, detectArea, actionTeleport, name, isForced } = entity
    const data = {
      type: 'portal',
      x: position.x,
      y: position.y,
      name: name,
      width: detectArea.size.w,
      height: detectArea.size.h,
      isForced: isForced
    }
    if (actionTeleport.mapId != null && actionTeleport.entryId != null) {
      data.targetMapId = actionTeleport.mapId
      data.targetEntryId = actionTeleport.entryId
    } else if (actionTeleport.destinationId != null) {
      data.destinationId = actionTeleport.destinationId
    } else if (actionTeleport.targetX != null && actionTeleport.targetY != null) {
      data.targetX = actionTeleport.targetX
      data.targetY = actionTeleport.targetY
    }
    return data;
  }
}
