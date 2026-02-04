import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const mousePositionSchema = z.object({
    worldX: z.number().default(0),
    worldY: z.number().default(0),
    screenX: z.number().default(0),
    screenY: z.number().default(0)
});

export type MousePositionData = z.infer<typeof mousePositionSchema>;

export const MousePosition: IComponentDefinition<typeof mousePositionSchema, MousePositionData> = {
  name: 'MousePosition',
  schema: mousePositionSchema,
  create(data: Partial<MousePositionData> = {}) {
    return mousePositionSchema.parse(data);
  },
  serialize(component) {
    // 运行时输入，无需保存
    return {
        worldX: 0,
        worldY: 0,
        screenX: 0,
        screenY: 0
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const MousePositionSchema = mousePositionSchema;
