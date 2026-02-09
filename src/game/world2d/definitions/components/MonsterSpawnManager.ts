import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const monsterSpawnManagerSchema = z.object({
  // 是否启用刷新
  spawnEnabled: z.boolean().default(true),

  // 刷新间隔（秒）
  spawnInterval: z.number().min(0).default(1),

  // 刷新计时器（秒）
  spawnTimer: z.number().min(0).default(0),

  // 场上怪物上限
  maxAlive: z.number().min(0).default(50),

  // 当前场上怪物数量
  aliveCount: z.number().min(0).default(0),

  // 总刷新数量
  totalSpawned: z.number().min(0).default(0),

  // 每波次刷新倍率
  waveSpawnMultiplier: z.number().min(0).default(1),

  // 单波次刷新上限（0表示不限制）
  spawnCapPerWave: z.number().min(0).default(0),

  // 刷新半径
  spawnRadius: z.number().min(0).default(500),

  // 最小距离（避免刷脸）
  minDistanceFromPlayer: z.number().min(0).default(120)
});

export type MonsterSpawnManagerData = z.infer<typeof monsterSpawnManagerSchema>;

export const MonsterSpawnManager: IComponentDefinition<typeof monsterSpawnManagerSchema, MonsterSpawnManagerData> = {
  name: 'MonsterSpawnManager',
  schema: monsterSpawnManagerSchema,
  create(options: Partial<MonsterSpawnManagerData> = {}) {
    return monsterSpawnManagerSchema.parse(options);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'monsterSpawnManager.spawnEnabled', label: '启用刷新', type: 'checkbox', group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.spawnInterval', label: '刷新间隔', type: 'number', props: { min: 0, step: 0.1 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.spawnTimer', label: '刷新计时', type: 'number', props: { min: 0, step: 0.1 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.maxAlive', label: '场上上限', type: 'number', props: { min: 0, step: 1 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.aliveCount', label: '当前数量', type: 'number', props: { min: 0, step: 1 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.totalSpawned', label: '累计刷新', type: 'number', props: { min: 0, step: 1 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.waveSpawnMultiplier', label: '波次倍率', type: 'number', props: { min: 0, step: 0.1 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.spawnCapPerWave', label: '波次上限', type: 'number', props: { min: 0, step: 1 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.spawnRadius', label: '刷新半径', type: 'number', props: { min: 0, step: 10 }, group: '怪物刷新 (Spawn)' },
    { path: 'monsterSpawnManager.minDistanceFromPlayer', label: '最小距离', type: 'number', props: { min: 0, step: 5 }, group: '怪物刷新 (Spawn)' }
  ]
};

export const MonsterSpawnManagerSchema = monsterSpawnManagerSchema;
export const MONSTER_SPAWN_MANAGER_INSPECTOR_FIELDS = MonsterSpawnManager.inspectorFields;
