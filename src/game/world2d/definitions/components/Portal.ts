import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const portalSchema = z.object({
  mapId: z.string().optional(),
  entryId: z.string().optional(),
  destinationId: z.string().optional(),
  targetX: z.number().optional(),
  targetY: z.number().optional(),
  defaultCooldown: z.number().default(0.5),
  isForced: z.boolean().default(true)
});

export type PortalData = z.infer<typeof portalSchema>;

export const Portal: IComponentDefinition<typeof portalSchema, PortalData> = {
  name: 'Portal',
  schema: portalSchema,
  create(config: Partial<PortalData> = {}) {
    return portalSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'portal.isForced', label: '强制传送', type: 'checkbox', tip: '勾选则触碰即走，不勾选需按交互键', group: '传送逻辑 (Portal)' },
    { path: 'portal.defaultCooldown', label: '默认冷却', type: 'number', props: { min: 0, step: 0.1 }, tip: '触发后的默认冷却时间', group: '传送逻辑 (Portal)' },
    { path: 'portal.mapId', label: '目标地图', type: 'text', group: '目标位置 (Portal)' },
    { path: 'portal.entryId', label: '入口 ID', type: 'text', group: '目标位置 (Portal)' },
    { path: 'portal.destinationId', label: '同图目的地', type: 'text', group: '目标位置 (Portal)' },
    { path: 'portal.targetX', label: '目标 X', type: 'number', group: '目标位置 (Portal)' },
    { path: 'portal.targetY', label: '目标 Y', type: 'number', group: '目标位置 (Portal)' }
  ]
};

export const PortalSchema = portalSchema;
export const PORTAL_INSPECTOR_FIELDS = Portal.inspectorFields;
