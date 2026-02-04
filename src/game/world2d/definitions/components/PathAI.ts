import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// --- Path AI Config ---
const pathAIConfigSchema = z.object({
  points: z.array(z.object({ x: z.number(), y: z.number() })),
  mode: z.enum(['loop', 'ping-pong']).default('loop'),
  speed: z.number().default(60),
  waitTime: z.number().default(0),
  smoothTurning: z.boolean().default(true),
});

export type PathAIConfigData = z.infer<typeof pathAIConfigSchema>;

export const PathAIConfig: IComponentDefinition<typeof pathAIConfigSchema, PathAIConfigData> = {
  name: 'PathAIConfig',
  schema: pathAIConfigSchema,
  create(points: any[] | Partial<PathAIConfigData> = [], options: Partial<PathAIConfigData> = {}) {
     if (Array.isArray(points)) {
         return pathAIConfigSchema.parse({ points, ...options });
     }
     return pathAIConfigSchema.parse(points); // assume points is config object
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

// --- Path AI State ---
const pathAIStateSchema = z.object({
  currentIndex: z.number().default(0),
  direction: z.number().default(1),
  waitTimer: z.number().default(0),
  isWaiting: z.boolean().default(false),
  moveDir: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
});

export type PathAIStateData = z.infer<typeof pathAIStateSchema>;

export const PathAIState: IComponentDefinition<typeof pathAIStateSchema, PathAIStateData> = {
  name: 'PathAIState',
  schema: pathAIStateSchema,
  create(options: Partial<PathAIStateData> = {}) {
    return pathAIStateSchema.parse(options);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

// Compatibility Export
export const PathAI = {
    Config: PathAIConfig.create.bind(PathAIConfig),
    State: PathAIState.create.bind(PathAIState),
    ConfigSchema: pathAIConfigSchema,
    StateSchema: pathAIStateSchema
};

export const PathAIConfigSchema = pathAIConfigSchema;
export const PathAIStateSchema = pathAIStateSchema;
