import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// Schema 定义：存储实体引用，Zod 无法验证复杂的 Entity 对象，所以用 any
const childrenSchema = z.object({
  entities: z.array(z.any()).default([])
});

export type ChildrenData = z.infer<typeof childrenSchema>;

export const Children: IComponentDefinition<typeof childrenSchema, ChildrenData> = {
  name: 'Children',
  schema: childrenSchema,
  create(entities: any[] = []) {
    return { entities: [...entities] };
  },
  // Children 组件通常包含运行时实体引用，不直接序列化实体本身
  // 序列化时可能只需要标记，或者由 EntitySerializer 处理层级
  serialize(component) {
    return { entities: [] }; 
  },
  deserialize(data) {
    return this.create(data?.entities || []);
  }
};

export const ChildrenSchema = childrenSchema;
