import { z } from 'zod';

export const ParentSchema = z.object({
  // 引用父实体的 ID (或者直接引用对象，但在序列化时通常用 ID)
  // 在运行时，我们通常直接把 entity 对象赋值给它，Miniplex 支持存对象
  // 这里 Schema 定义为 any，因为 Zod 校验 Entity 对象比较麻烦
  entity: z.any() 
});

export const Parent = (entity) => {
  return { entity };
};

// 暂时不需要 LocalTransform，直接复用 Shape.offsetX/Y
// 如果未来需要更复杂的层级变换（如旋转嵌套），再引入 LocalTransform
