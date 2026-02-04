import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const velocitySchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0)
});

export type VelocityData = z.infer<typeof velocitySchema>;

export const Velocity: IComponentDefinition<typeof velocitySchema, VelocityData> = {
  name: 'Velocity',
  schema: velocitySchema,
  create(x: number | Partial<VelocityData> = 0, y: number = 0) {
    if (typeof x === 'object') {
        return velocitySchema.parse(x);
    }
    return velocitySchema.parse({ x, y });
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'velocity.x', label: '速度 X', type: 'number', props: { step: 10 }, group: '速度 (Velocity)' },
    { path: 'velocity.y', label: '速度 Y', type: 'number', props: { step: 10 }, group: '速度 (Velocity)' }
  ]
};

export const VelocitySchema = velocitySchema;
export const VELOCITY_INSPECTOR_FIELDS = Velocity.inspectorFields;
