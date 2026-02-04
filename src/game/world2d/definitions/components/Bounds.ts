import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const boundsSchema = z.object({
  minX: z.number().default(0),
  maxX: z.number().default(9999),
  minY: z.number().default(0),
  maxY: z.number().default(9999)
});

export type BoundsData = z.infer<typeof boundsSchema>;

export const Bounds: IComponentDefinition<typeof boundsSchema, BoundsData> = {
  name: 'Bounds',
  schema: boundsSchema,
  create(minX: number | Partial<BoundsData> = 0, maxX: number = 9999, minY: number = 0, maxY: number = 9999) {
    if (typeof minX === 'object') {
        return boundsSchema.parse(minX);
    }
    return boundsSchema.parse({ minX, maxX, minY, maxY });
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'bounds.minX', label: '最小 X', type: 'number', props: { step: 10 }, group: '边界 (Bounds)' },
    { path: 'bounds.maxX', label: '最大 X', type: 'number', props: { step: 10 }, group: '边界 (Bounds)' },
    { path: 'bounds.minY', label: '最小 Y', type: 'number', props: { step: 10 }, group: '边界 (Bounds)' },
    { path: 'bounds.maxY', label: '最大 Y', type: 'number', props: { step: 10 }, group: '边界 (Bounds)' }
  ]
};

export const BoundsSchema = boundsSchema;
export const BOUNDS_INSPECTOR_FIELDS = Bounds.inspectorFields;
