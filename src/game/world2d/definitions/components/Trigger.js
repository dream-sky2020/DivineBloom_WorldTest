import { z } from 'zod';

export const TriggerRuleSchema = z.object({
  type: z.enum(['onEnter', 'onExit', 'onStay', 'onPress', 'onSight']),
  requireArea: z.boolean().default(false),
  requireInput: z.boolean().default(false),
  requireEnterOnly: z.boolean().default(false),

  // Condition check
  condition: z.enum(['none', 'notStunned']).default('none')
});

export const TriggerSchema = z.object({
  rules: z.array(TriggerRuleSchema).default([]),
  actions: z.array(z.string()).default([]), // Action IDs

  // Flattened State Properties
  active: z.boolean().default(true),
  triggered: z.boolean().default(false),
  defaultCooldown: z.number().default(0.5),
  cooldownTimer: z.number().default(0),
  oneShot: z.boolean().default(false),
  oneShotExecuted: z.boolean().default(false),
  wasInside: z.boolean().default(false)
});

export const Trigger = (config = {}) => {
  const result = TriggerSchema.safeParse(config);

  if (result.success) {
    return result.data;
  } else {
    console.error('[Trigger] Schema validation failed', result.error);
    return TriggerSchema.parse({});
  }
}
