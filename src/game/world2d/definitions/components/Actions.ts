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

// --- Create Entity Action ---
const actionsCreateEntitySchema = z.object({
  templateId: z.string().optional(),
  entityType: z.string().optional(),
  customData: z.any().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional()
}).refine(
  data => data.templateId != null || data.entityType != null,
  { message: "CreateEntity must have either templateId or entityType" }
);

export type ActionsCreateEntityData = z.infer<typeof actionsCreateEntitySchema>;

export const ActionCreateEntity: IComponentDefinition<typeof actionsCreateEntitySchema, ActionsCreateEntityData> = {
  name: 'ActionCreateEntity',
  schema: actionsCreateEntitySchema,
  create(templateIdOrConfig?: string | ActionsCreateEntityData, entityType?: string, customData?: any, position?: { x: number; y: number }) {
    if (typeof templateIdOrConfig === 'object' && templateIdOrConfig !== null) {
      return actionsCreateEntitySchema.parse(templateIdOrConfig);
    }
    return actionsCreateEntitySchema.parse({
      templateId: typeof templateIdOrConfig === 'string' ? templateIdOrConfig : undefined,
      entityType,
      customData,
      position
    });
  },
  serialize(component) {
    return {
      templateId: component.templateId,
      entityType: component.entityType,
      customData: component.customData,
      position: component.position
    };
  },
  deserialize(data) {
    return actionsCreateEntitySchema.parse(data);
  }
};

// --- Emit Signal Action ---
const actionsEmitSignalSchema = z.object({
  signal: z.string(),
  payload: z.any().optional(),
  target: z.any().optional()
});

export type ActionsEmitSignalData = z.infer<typeof actionsEmitSignalSchema>;

export const ActionEmitSignal: IComponentDefinition<typeof actionsEmitSignalSchema, ActionsEmitSignalData> = {
  name: 'ActionEmitSignal',
  schema: actionsEmitSignalSchema,
  create(signalOrConfig?: string | ActionsEmitSignalData, payload?: any, target?: any) {
    if (typeof signalOrConfig === 'object' && signalOrConfig !== null) {
      return actionsEmitSignalSchema.parse(signalOrConfig);
    }
    return actionsEmitSignalSchema.parse({ signal: signalOrConfig, payload, target });
  },
  serialize(component) {
    return {
      signal: component.signal,
      payload: component.payload,
      target: component.target
    };
  },
  deserialize(data) {
    return actionsEmitSignalSchema.parse(data);
  }
};

// Compatibility Export
export const Actions = {
  Dialogue: ActionDialogue.create.bind(ActionDialogue),
  Teleport: ActionTeleport.create.bind(ActionTeleport),
  CreateEntity: ActionCreateEntity.create.bind(ActionCreateEntity),
  EmitSignal: ActionEmitSignal.create.bind(ActionEmitSignal),
  DialogueSchema: actionsDialogueSchema,
  TeleportSchema: actionsTeleportSchema,
  CreateEntitySchema: actionsCreateEntitySchema,
  EmitSignalSchema: actionsEmitSignalSchema
};

export const ActionsDialogueSchema = actionsDialogueSchema;
export const ActionsTeleportSchema = actionsTeleportSchema;
export const ActionsCreateEntitySchema = actionsCreateEntitySchema;
export const ActionsEmitSignalSchema = actionsEmitSignalSchema;
