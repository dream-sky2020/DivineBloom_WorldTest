import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const monsterSchema = z.object({
  category: z.enum(['normal', 'horde']).default('normal'),
  priority: z.number().default(1)
});

export type MonsterData = z.infer<typeof monsterSchema>;

export const Monster: IComponentDefinition<typeof monsterSchema, MonsterData> = {
  name: 'Monster',
  schema: monsterSchema,
  create(config: Partial<MonsterData> = {}) {
    return monsterSchema.parse(config);
  },
  serialize(component) {
    return {
      category: component.category,
      priority: component.priority
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const MonsterSchema = monsterSchema;
