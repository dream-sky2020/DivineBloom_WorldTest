import { z } from 'zod';

/**
 * Children 组件，用于父实体追踪其子实体列表
 * 注意：在 ECS 中，通常建议子实体持有 Parent 引用。
 * Children 组件主要用于加速某些特定的父到子的操作（如递归销毁）。
 */
export const ChildrenSchema = z.object({
  entities: z.array(z.any()).default([])
});

export function Children(entities = []) {
  return { entities: [...entities] };
}
