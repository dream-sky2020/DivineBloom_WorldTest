import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const worldTransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  rotation: z.number().default(0),
  prevX: z.number().default(0),
  prevY: z.number().default(0)
});

export type WorldTransformData = z.infer<typeof worldTransformSchema>;

export const WorldTransform: IComponentDefinition<typeof worldTransformSchema, WorldTransformData> = {
  name: 'WorldTransform',
  schema: worldTransformSchema,
  create(x: number | Partial<WorldTransformData> = 0, y: number = 0, rotation: number = 0) {
    if (typeof x === 'object') {
        return worldTransformSchema.parse({
            ...x,
            prevX: x.prevX ?? x.x ?? 0,
            prevY: x.prevY ?? x.y ?? 0
        });
    }
    return worldTransformSchema.parse({ x, y, rotation, prevX: x, prevY: y });
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const WorldTransformSchema = worldTransformSchema;
