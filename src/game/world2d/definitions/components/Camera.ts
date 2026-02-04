import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const cameraSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  targetX: z.number().default(0),
  targetY: z.number().default(0),
  lerp: z.number().min(0).max(1).default(0.1),
  useBounds: z.boolean().default(true),
  deadZone: z.object({
    width: z.number().default(100),
    height: z.number().default(100)
  }).default({ width: 100, height: 100 })
});

export type CameraData = z.infer<typeof cameraSchema>;

export const Camera: IComponentDefinition<typeof cameraSchema, CameraData> = {
  name: 'Camera',
  schema: cameraSchema,
  create(data: Partial<CameraData> = {}) {
    return cameraSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const CameraSchema = cameraSchema;
