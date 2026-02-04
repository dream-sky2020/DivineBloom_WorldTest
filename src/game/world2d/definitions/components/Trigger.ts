import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

export const triggerRuleSchema = z.object({
  type: z.enum(['onEnter', 'onExit', 'onStay', 'onPress', 'onSight']),
  requireArea: z.boolean().default(false),
  requireInput: z.boolean().default(false),
  requireEnterOnly: z.boolean().default(false),
  condition: z.enum(['none', 'notStunned']).default('none')
});

const triggerSchema = z.object({
  rules: z.array(triggerRuleSchema).default([]),
  actions: z.array(z.string()).default([]), // Action IDs
  active: z.boolean().default(true),
  triggered: z.boolean().default(false),
  defaultCooldown: z.number().default(0.5),
  cooldownTimer: z.number().default(0),
  oneShot: z.boolean().default(false),
  oneShotExecuted: z.boolean().default(false),
  wasInside: z.boolean().default(false)
});

export type TriggerData = z.infer<typeof triggerSchema>;

export const Trigger: IComponentDefinition<typeof triggerSchema, TriggerData> = {
  name: 'Trigger',
  schema: triggerSchema,
  create(config: Partial<TriggerData> = {}) {
    return triggerSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const TriggerSchema = triggerSchema;
export const TriggerRuleSchema = triggerRuleSchema;
