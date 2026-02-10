import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const playerIntentSchema = z.object({
  move: z.object({
    x: z.number().default(0),
    y: z.number().default(0)
  }).default({ x: 0, y: 0 }),
  wantsToRun: z.boolean().default(false),
  wantsToInteract: z.boolean().default(false),
  wantsToOpenMenu: z.boolean().default(false),
  wantsToOpenShop: z.boolean().default(false),
  // 供 PortalIntentSystem 做按下沿检测
  __portalInteractPrev: z.boolean().default(false)
});

export type PlayerIntentData = z.infer<typeof playerIntentSchema>;

export const PlayerIntent: IComponentDefinition<typeof playerIntentSchema, PlayerIntentData> = {
  name: 'PlayerIntent',
  schema: playerIntentSchema,
  create(data: Partial<PlayerIntentData> = {}) {
    return playerIntentSchema.parse(data);
  },
  serialize(component) {
    // Intent 为运行时状态，不持久化本帧动作意图
    return {
      move: { x: 0, y: 0 },
      wantsToRun: false,
      wantsToInteract: false,
      wantsToOpenMenu: false,
      wantsToOpenShop: false,
      __portalInteractPrev: component.__portalInteractPrev
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const PlayerIntentSchema = playerIntentSchema;
