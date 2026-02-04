import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// --- Dialogue Action ---
const actionsDialogueSchema = z.object({
  scriptId: z.string().default('error_missing_id')
});

export type ActionsDialogueData = z.infer<typeof actionsDialogueSchema>;

export const ActionDialogue: IComponentDefinition<typeof actionsDialogueSchema, ActionsDialogueData> = {
  name: 'ActionDialogue',
  schema: actionsDialogueSchema,
  create(scriptId: string = 'error_missing_id') {
    return actionsDialogueSchema.parse({ scriptId });
  },
  serialize(component) {
    return { scriptId: component.scriptId };
  },
  deserialize(data) {
    return this.create(data.scriptId);
  }
};

// --- Teleport Action ---
const actionsTeleportSchema = z.object({
  mapId: z.string().optional(),
  entryId: z.string().optional(),
  destinationId: z.string().optional(),
  targetX: z.number().optional(),
  targetY: z.number().optional()
}).refine(
  data => {
    const isCrossMap = data.mapId != null && data.entryId != null
    const isLocalTeleport = data.destinationId != null || (data.targetX != null && data.targetY != null)
    return isCrossMap || isLocalTeleport
  },
  {
    message: "Teleport must have either (mapId + entryId) for cross-map or (destinationId / targetX + targetY) for local teleport"
  }
);

export type ActionsTeleportData = z.infer<typeof actionsTeleportSchema>;

export const ActionTeleport: IComponentDefinition<typeof actionsTeleportSchema, ActionsTeleportData> = {
  name: 'ActionTeleport',
  schema: actionsTeleportSchema,
  create(mapId?: string, entryId?: string, destinationId?: string, targetX?: number, targetY?: number) {
    // 支持直接传入对象
    if (typeof mapId === 'object' && mapId !== null) {
         return actionsTeleportSchema.parse(mapId);
    }
    return actionsTeleportSchema.parse({ mapId, entryId, destinationId, targetX, targetY });
  },
  serialize(component) {
    return {
        mapId: component.mapId,
        entryId: component.entryId,
        destinationId: component.destinationId,
        targetX: component.targetX,
        targetY: component.targetY
    };
  },
  deserialize(data) {
    return actionsTeleportSchema.parse(data);
  }
};

// Compatibility Export
export const Actions = {
    Dialogue: ActionDialogue.create.bind(ActionDialogue),
    Teleport: ActionTeleport.create.bind(ActionTeleport),
    DialogueSchema: actionsDialogueSchema,
    TeleportSchema: actionsTeleportSchema
};

export const ActionsDialogueSchema = actionsDialogueSchema;
export const ActionsTeleportSchema = actionsTeleportSchema;
