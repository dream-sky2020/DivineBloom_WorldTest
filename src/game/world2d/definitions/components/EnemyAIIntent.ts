import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const enemyAIIntentSchema = z.object({
  state: z.string().default('wander'),
  action: z.enum(['idle', 'move', 'stunned']).default('idle'),
  targetPos: z.object({
    x: z.number(),
    y: z.number()
  }).nullable().default(null),
  suspicion: z.number().default(0),
  hasBattleResult: z.boolean().default(false)
});

export type EnemyAIIntentData = z.infer<typeof enemyAIIntentSchema>;

export const EnemyAIIntent: IComponentDefinition<typeof enemyAIIntentSchema, EnemyAIIntentData> = {
  name: 'EnemyAIIntent',
  schema: enemyAIIntentSchema,
  create(data: Partial<EnemyAIIntentData> = {}) {
    return enemyAIIntentSchema.parse(data);
  },
  serialize(component) {
    // AI Intent 是运行时决策，不持久化即时动作
    return {
      state: component.state,
      action: component.action,
      targetPos: component.targetPos,
      suspicion: component.suspicion,
      hasBattleResult: false
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const EnemyAIIntentSchema = enemyAIIntentSchema;
