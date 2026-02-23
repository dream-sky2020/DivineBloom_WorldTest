import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
  Spawn,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS
} from '@components';

const fleeEnemyOptionsSchema = z.object({
  spriteId: z.string().default('enemy_slime'),
  scale: z.number().optional(),
  baseSpeed: z.number().default(110),
  visionRadius: z.number().default(550),
  maxHealth: z.number().default(50)
});

export const FleeEnemySpawnerEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Flee Enemy Spawner'),
  spawnEnabled: z.boolean().default(true),
  spawnLimit: z.number().min(0).default(10),
  spawnInterval: z.number().min(0).default(3),
  spawnBatchSize: z.number().min(1).default(1),
  spawnGroup: z.string().default('fleeEnemy'),
  enemyName: z.string().optional(),
  enemyOptions: fleeEnemyOptionsSchema.default({} as any)
});

export type FleeEnemySpawnerEntityData = z.infer<typeof FleeEnemySpawnerEntitySchema>;

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基础属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  { path: 'spawn.enabled', label: '启用产卵', type: 'checkbox', group: '逃跑生成器' },
  { path: 'spawn.spawnLimit', label: '产卵上限', type: 'number', props: { min: 0, step: 1 }, group: '逃跑生成器' },
  { path: 'spawn.spawnInterval', label: '产卵间隔', type: 'number', props: { min: 0, step: 0.1 }, group: '逃跑生成器' },
  { path: 'spawn.spawnBatchSize', label: '每批数量', type: 'number', props: { min: 1, step: 1 }, group: '逃跑生成器' },
  { path: 'spawn.spawnGroup', label: '生成分组', type: 'text', group: '逃跑生成器' },
  { path: 'spawn.spawnEntityId', label: '产卵实体 ID', type: 'text', group: '逃跑生成器' },
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const FleeEnemySpawnerEntity: IEntityDefinition<typeof FleeEnemySpawnerEntitySchema> = {
  type: 'flee_enemy_spawner',
  name: '逃跑敌人生成器',
  order: 15,
  creationIndex: 0,
  schema: FleeEnemySpawnerEntitySchema,
  create(data: FleeEnemySpawnerEntityData) {
    const normalizedData = {
      ...(data as any),
      spawnGroup: (data as any)?.spawnGroup ?? (data as any)?.countByComponent
    };
    const result = FleeEnemySpawnerEntitySchema.safeParse(normalizedData);
    if (!result.success) {
      console.error('[FleeEnemySpawnerEntity] Validation failed', result.error);
      return null;
    }

    const {
      x, y, name, spawnEnabled, spawnLimit, spawnInterval, spawnBatchSize, spawnGroup, enemyName, enemyOptions
    } = result.data;

    const root = world.add({
      type: 'flee_enemy_spawner',
      name,
      transform: Transform.create(x, y),
      spawn: Spawn.create({
        enabled: spawnEnabled,
        spawnLimit,
        spawnInterval,
        cooldown: 0,
        spawnBatchSize,
        spawnGroup,
        spawnEntityId: 'flee_enemy',
        spawnPosition: {
          mode: 'self',
          offsetX: 0,
          offsetY: 0,
          radius: 160,
          rectWidth: 240,
          rectHeight: 160
        },
        spawnParams: {
          name: enemyName,
          options: enemyOptions
        }
      })
    });

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 70,
      editorBox: { w: 24, h: 24, scale: 1 }
    });

    return root;
  },
  serialize(entity: any) {
    return {
      type: 'flee_enemy_spawner',
      x: entity.transform?.x ?? 0,
      y: entity.transform?.y ?? 0,
      name: entity.name ?? 'Flee Enemy Spawner',
      spawnEnabled: entity.spawn?.enabled ?? true,
      spawnLimit: entity.spawn?.spawnLimit ?? 10,
      spawnInterval: entity.spawn?.spawnInterval ?? 3,
      spawnBatchSize: entity.spawn?.spawnBatchSize ?? 1,
      spawnGroup: entity.spawn?.spawnGroup ?? 'fleeEnemy',
      enemyName: entity.spawn?.spawnParams?.name,
      enemyOptions: entity.spawn?.spawnParams?.options ?? {}
    };
  },
  deserialize(data: any) {
    return this.create(data);
  }
};
