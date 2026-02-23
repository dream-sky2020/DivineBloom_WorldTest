import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const spawnMaskSchema = z.object({
  group: z.string().min(1).default('monster'),
  sourceSpawnerId: z.string().optional()
});

export type SpawnMaskData = z.infer<typeof spawnMaskSchema>;

export const SpawnMask: IComponentDefinition<typeof spawnMaskSchema, SpawnMaskData> = {
  name: 'SpawnMask',
  schema: spawnMaskSchema,
  create(data: Partial<SpawnMaskData> = {}) {
    return spawnMaskSchema.parse(data);
  },
  serialize(component) {
    return {
      group: component.group,
      sourceSpawnerId: component.sourceSpawnerId
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'spawnMask.group', label: '生成分组', type: 'text', group: '生成标识 (SpawnMask)' },
    { path: 'spawnMask.sourceSpawnerId', label: '来源生成器 ID', type: 'text', group: '生成标识 (SpawnMask)' }
  ]
};

export const SpawnMaskSchema = spawnMaskSchema;
