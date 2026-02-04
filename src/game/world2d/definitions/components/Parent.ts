import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const parentSchema = z.object({
  entity: z.any() 
});

export type ParentData = z.infer<typeof parentSchema>;

export const Parent: IComponentDefinition<typeof parentSchema, ParentData> = {
  name: 'Parent',
  schema: parentSchema,
  create(entity: any) {
    // 支持对象传入方式 Parent.create({ entity: ... })
    if (entity && entity.entity) {
        return { entity: entity.entity };
    }
    return { entity };
  },
  serialize(component) {
    // 父子关系序列化复杂，通常不需要在这里处理引用
    return { entity: null }; 
  },
  deserialize(data) {
    return this.create(data?.entity);
  }
};

export const ParentSchema = parentSchema;
