import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const localTransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  rotation: z.number().default(0)
});

export type LocalTransformData = z.infer<typeof localTransformSchema>;

export const LocalTransform: IComponentDefinition<typeof localTransformSchema, LocalTransformData> = {
  name: 'LocalTransform',
  schema: localTransformSchema,
  create(x: number | Partial<LocalTransformData> = 0, y: number = 0, rotation: number = 0) {
    if (typeof x === 'object') {
        return localTransformSchema.parse(x);
    }
    return localTransformSchema.parse({ x, y, rotation });
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'localTransform.x', label: '相对坐标 X', type: 'number', group: '本地变换 (LocalTransform)' },
    { path: 'localTransform.y', label: '相对坐标 Y', type: 'number', group: '本地变换 (LocalTransform)' },
    { path: 'localTransform.rotation', label: '相对旋转', type: 'number', props: { step: 0.1 }, group: '本地变换 (LocalTransform)' }
  ]
};

export const LocalTransformSchema = localTransformSchema;
export const LOCAL_TRANSFORM_INSPECTOR_FIELDS = LocalTransform.inspectorFields;
