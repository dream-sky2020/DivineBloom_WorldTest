import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// --- Horde AI Config ---
const hordeAIConfigSchema = z.object({
  strategy: z.enum(['chase', 'steering']).default('chase'),
  baseSpeed: z.number().default(80),
  visionRadius: z.number().default(400),
  proximitySpeed: z.object({
    enabled: z.boolean().default(true),
    minDistance: z.number().default(60),
    maxDistance: z.number().default(500),
    minMultiplier: z.number().default(0.5),
    maxMultiplier: z.number().default(2.0),
    acceleration: z.number().default(100),
  }).default({}),
  separationWeight: z.number().default(1.5),
});

export type HordeAIConfigData = z.infer<typeof hordeAIConfigSchema>;

export const HordeAIConfig: IComponentDefinition<typeof hordeAIConfigSchema, HordeAIConfigData> = {
  name: 'HordeAIConfig',
  schema: hordeAIConfigSchema,
  create(options: Partial<HordeAIConfigData> = {}) {
    return hordeAIConfigSchema.parse(options);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

// --- Horde AI State ---
const hordeAIStateSchema = z.object({
  currentSpeed: z.number().default(80),
  moveDir: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
  targetPos: z.object({ x: z.number(), y: z.number() }).nullable().default(null),
});

export type HordeAIStateData = z.infer<typeof hordeAIStateSchema>;

export const HordeAIState: IComponentDefinition<typeof hordeAIStateSchema, HordeAIStateData> = {
  name: 'HordeAIState',
  schema: hordeAIStateSchema,
  create(options: Partial<HordeAIStateData> = {}) {
    return hordeAIStateSchema.parse(options);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

// Compatibility Export
export const HordeAI = {
    Config: HordeAIConfig.create.bind(HordeAIConfig),
    State: HordeAIState.create.bind(HordeAIState),
    ConfigSchema: hordeAIConfigSchema,
    StateSchema: hordeAIStateSchema
};

export const HordeAIConfigSchema = hordeAIConfigSchema;
export const HordeAIStateSchema = hordeAIStateSchema;
