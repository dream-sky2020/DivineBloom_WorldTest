import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const weaponIntentSchema = z.object({
  wantsToFire: z.boolean().default(false),
  aimDirection: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 1, y: 0 }),
  // 玩家朝向（用于前后左右判定）
  facingDirection: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 1, y: 0 }),
  aimAngle: z.number().optional()
});

export type WeaponIntentData = z.infer<typeof weaponIntentSchema>;

export const WeaponIntent: IComponentDefinition<typeof weaponIntentSchema, WeaponIntentData> = {
  name: 'WeaponIntent',
  schema: weaponIntentSchema,
  create(data: Partial<WeaponIntentData> = {}) {
    return weaponIntentSchema.parse(data);
  },
  serialize(component) {
      // Intent 也是运行时状态
    return {
        wantsToFire: false,
        aimDirection: component.aimDirection, // 也许保留瞄准方向是合理的
        facingDirection: component.facingDirection,
        aimAngle: component.aimAngle
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const WeaponIntentSchema = weaponIntentSchema;
