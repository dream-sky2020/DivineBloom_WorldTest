import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const rawInputSchema = z.object({
  axes: z.object({
    x: z.number().default(0),
    y: z.number().default(0)
  }).default({ x: 0, y: 0 }),
  buttons: z.object({
    interact: z.boolean().default(false),
    run: z.boolean().default(false),
    menu: z.boolean().default(false),
    cancel: z.boolean().default(false),
    shop: z.boolean().default(false),
    attack: z.boolean().default(false),
    attackJustPressed: z.boolean().default(false),
    attackJustReleased: z.boolean().default(false),
    autoAttackEnable: z.boolean().default(false),
    autoAttackDisable: z.boolean().default(false)
  }).default({}),
  __prevButtons: z.object({
    attack: z.boolean().default(false),
    autoAttackEnable: z.boolean().default(false),
    autoAttackDisable: z.boolean().default(false)
  }).default({})
});

export type RawInputData = z.infer<typeof rawInputSchema>;

export const RawInput: IComponentDefinition<typeof rawInputSchema, RawInputData> = {
  name: 'RawInput',
  schema: rawInputSchema,
  create(data: Partial<RawInputData> = {}) {
    return rawInputSchema.parse(data);
  },
  serialize(_component) {
    // 输入是运行时态，不持久化按键状态
    return rawInputSchema.parse({});
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const RawInputSchema = rawInputSchema;
