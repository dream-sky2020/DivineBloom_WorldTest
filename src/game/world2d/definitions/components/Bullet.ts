import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// Bullet 作为纯标识组件存在，具体行为参数拆分到其他通用组件中。
const bulletSchema = z.object({});

export type BulletData = z.infer<typeof bulletSchema>;

export const Bullet: IComponentDefinition<typeof bulletSchema, BulletData> = {
  name: 'Bullet',
  schema: bulletSchema,
  create(config: Partial<BulletData> = {}) {
    return bulletSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: []
};

export const BulletSchema = bulletSchema;
export const BULLET_INSPECTOR_FIELDS = Bullet.inspectorFields;
