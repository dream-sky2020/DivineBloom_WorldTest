import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const sceneConfigSchema = z.object({
    id: z.string(),
    name: z.string().default('Unknown Scene'),
    gravity: z.object({
        x: z.number().default(0),
        y: z.number().default(0)
    }).optional().default({ x: 0, y: 0 }),
    width: z.number().default(2000),
    height: z.number().default(2000),
    groundColor: z.string().default('#1e293b') // slate-800
});

export type SceneConfigData = z.infer<typeof sceneConfigSchema>;

export const SceneConfig: IComponentDefinition<typeof sceneConfigSchema, SceneConfigData> = {
  name: 'SceneConfig',
  schema: sceneConfigSchema,
  create(data: Partial<SceneConfigData> = {}) {
    if (!data.id) data.id = 'unknown'; // Ensure ID exists
    return sceneConfigSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const SceneConfigSchema = sceneConfigSchema;
