import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const detectInputSchema = z.object({
  keys: z.array(z.string()).default(['Interact']),
  isPressed: z.boolean().default(false),
  justPressed: z.boolean().default(false)
});

export type DetectInputData = z.infer<typeof detectInputSchema>;

export const DetectInput: IComponentDefinition<typeof detectInputSchema, DetectInputData> = {
  name: 'DetectInput',
  schema: detectInputSchema,
  create(config: Partial<DetectInputData> = {}) {
    return detectInputSchema.parse(config);
  },
  serialize(component) {
    // 运行时输入状态不需要持久化
    return {
        keys: component.keys,
        isPressed: false,
        justPressed: false
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const DetectInputSchema = detectInputSchema;
