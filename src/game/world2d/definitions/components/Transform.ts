import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// 1. 定义 Schema (Zod)
const transformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  prevX: z.number().default(0),
  prevY: z.number().default(0)
});

// 2. 推导类型 (TypeScript)
export type TransformData = z.infer<typeof transformSchema>;

// 3. 实现接口
export const Transform: IComponentDefinition<typeof transformSchema, TransformData> = {
  name: 'Transform',
  
  schema: transformSchema,

  // Runtime Creator
  // 支持重载: create() / create(x, y) / create({x, y})
  create(xOrObj: number | Partial<TransformData> = 0, y: number = 0): TransformData {
    let data;
    if (typeof xOrObj === 'object') {
      const x = xOrObj.x || 0;
      const yVal = xOrObj.y || 0;
      data = { x, y: yVal, prevX: x, prevY: yVal };
    } else {
      data = { x: xOrObj, y, prevX: xOrObj, prevY: y };
    }
    return transformSchema.parse(data);
  },

  serialize(component: TransformData) {
    return {
      x: component.x,
      y: component.y,
      prevX: component.prevX,
      prevY: component.prevY
    };
  },

  deserialize(data: any) {
    if (!data) return this.create(0, 0);
    // 兼容旧数组格式 [x, y] 如果存在的话
    if (Array.isArray(data)) {
        return this.create(data[0], data[1]);
    }
    return this.create(data.x, data.y);
  },

  inspectorFields: [
    { path: 'transform.x', label: '坐标 X', type: 'number', group: '变换 (Transform)' },
    { path: 'transform.y', label: '坐标 Y', type: 'number', group: '变换 (Transform)' }
  ]
};

// 兼容导出 (保留旧的引用习惯，如果有必要)
export const TransformSchema = transformSchema;
export const TRANSFORM_INSPECTOR_FIELDS = Transform.inspectorFields;
