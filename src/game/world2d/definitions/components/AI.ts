import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// --- AI Config ---
const aiConfigSchema = z.object({
  type: z.string().default('wander'),
  visionRadius: z.number().default(120),
  speed: z.number().default(80),
  visionType: z.string().default('circle'),
  visionAngle: z.number().default(Math.PI / 2),
  visionProximity: z.number().default(40),
  suspicionTime: z.number().default(0),
  minYRatio: z.number().default(0.35),
  homePosition: z.object({ x: z.number(), y: z.number() }).optional(),
  patrolRadius: z.number().default(150),
  detectedState: z.string().default('chase'),
  stunDuration: z.number().default(5),
  chaseExitMultiplier: z.number().default(1.5)
});

export type AIConfigData = z.infer<typeof aiConfigSchema>;

export const AIConfig: IComponentDefinition<typeof aiConfigSchema, AIConfigData> = {
  name: 'AIConfig',
  schema: aiConfigSchema,
  create(type: string | Partial<AIConfigData> = 'wander', visionRadius: number = 120, speed: number = 80, extraOptions: Partial<AIConfigData> = {}) {
    // 如果第一个参数是对象，直接合并
    if (typeof type === 'object') {
        const defaultData = aiConfigSchema.parse({});
        return aiConfigSchema.parse({ ...defaultData, ...type });
    }

    const visionAngle = (extraOptions.visionAngle !== undefined)
      ? extraOptions.visionAngle * (Math.PI / 180) // Convert degree to radian if needed
      : undefined;

    const input = {
      type,
      visionRadius,
      speed,
      visionType: extraOptions.visionType,
      visionAngle: visionAngle, // Use processed angle
      visionProximity: extraOptions.visionProximity,
      suspicionTime: extraOptions.suspicionTime,
      minYRatio: extraOptions.minYRatio,
      homePosition: extraOptions.homePosition,
      patrolRadius: extraOptions.patrolRadius,
      detectedState: extraOptions.detectedState,
      stunDuration: extraOptions.stunDuration,
      chaseExitMultiplier: extraOptions.chaseExitMultiplier
    };
    return aiConfigSchema.parse(input);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return aiConfigSchema.parse(data);
  }
};

// --- AI State ---
const aiStateSchema = z.object({
  state: z.string().default('wander'),
  timer: z.number().default(0),
  lostTargetTimer: z.number().default(0),
  lastSeenPos: z.object({ x: z.number(), y: z.number() }).nullable().default(null),
  suspicion: z.number().default(0),
  moveDir: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
  facing: z.object({ x: z.number(), y: z.number() }).default({ x: 1, y: 0 }),
  colorHex: z.string().default('#eab308'),
  alertAnim: z.number().default(0),
  starAngle: z.number().default(0),
  justEntered: z.boolean().default(true),
  targetPos: z.object({ x: z.number(), y: z.number() }).nullable().default(null)
});

export type AIStateData = z.infer<typeof aiStateSchema>;

export const AIState: IComponentDefinition<typeof aiStateSchema, AIStateData> = {
  name: 'AIState',
  schema: aiStateSchema,
  create(isStunned: boolean | Partial<AIStateData> = false, stunnedTimer: number = 0, defaultState: string = 'wander') {
    // Support object input
    if (typeof isStunned === 'object') {
        return aiStateSchema.parse(isStunned);
    }
    const input = {
      state: isStunned ? 'stunned' : defaultState,
      timer: isStunned ? (stunnedTimer || 3.0) : 0
    };
    return aiStateSchema.parse(input);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
     return aiStateSchema.parse(data);
  }
};

// Compatibility Export
export const AI = {
    Config: AIConfig.create.bind(AIConfig),
    State: AIState.create.bind(AIState),
    ConfigSchema: aiConfigSchema,
    StateSchema: aiStateSchema
};

export const AIConfigSchema = aiConfigSchema;
export const AIStateSchema = aiStateSchema;
