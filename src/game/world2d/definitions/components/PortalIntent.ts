import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const portalIntentSchema = z.object({
  type: z.enum(['crossMap', 'local']),
  mapId: z.string().optional(),
  entryId: z.string().optional(),
  destinationId: z.string().optional(),
  targetX: z.number().optional(),
  targetY: z.number().optional(),
  // 运行时引用，不参与序列化
  source: z.any().optional()
});

export type PortalIntentData = z.infer<typeof portalIntentSchema>;

export const PortalIntent: IComponentDefinition<typeof portalIntentSchema, PortalIntentData> = {
  name: 'PortalIntent',
  schema: portalIntentSchema,
  create(data: Partial<PortalIntentData> = {}) {
    return portalIntentSchema.parse(data);
  },
  serialize(component) {
    return {
      type: component.type,
      mapId: component.mapId,
      entryId: component.entryId,
      destinationId: component.destinationId,
      targetX: component.targetX,
      targetY: component.targetY
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const PortalIntentSchema = portalIntentSchema;
