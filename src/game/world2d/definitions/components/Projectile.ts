import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const projectileSchema = z.object({
  damage: z.number().default(10),              // 伤害值
  isPenetrating: z.boolean().default(false),   // 是否穿透（穿透不消失）
  penetrationCount: z.number().default(0),     // 剩余穿透次数（0 = 无穿透）
  knockback: z.number().default(0),            // 击退力度
  criticalChance: z.number().default(0),       // 暴击率（0-1）
  criticalMultiplier: z.number().default(1.5)  // 暴击倍率
});

export type ProjectileData = z.infer<typeof projectileSchema>;

export const Projectile: IComponentDefinition<typeof projectileSchema, ProjectileData> = {
  name: 'Projectile',
  schema: projectileSchema,
  create(config: Partial<ProjectileData> = {}) {
    return projectileSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const ProjectileSchema = projectileSchema;
