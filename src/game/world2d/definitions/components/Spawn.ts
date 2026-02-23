import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const spawnPositionSchema = z.object({
  mode: z.enum(['self', 'target', 'offset', 'randomRadius', 'randomRect']).default('self'),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  radius: z.number().min(0).default(120),
  rectWidth: z.number().min(0).default(240),
  rectHeight: z.number().min(0).default(160)
});

const spawnSchema = z.object({
  // 是否启用产卵
  enabled: z.boolean().default(true),

  // 产卵上限（基于 spawnGroup）
  spawnLimit: z.number().min(0).default(50),

  // 产卵间隔（秒）
  spawnInterval: z.number().min(0).default(1),

  // 当前冷却（秒）
  cooldown: z.number().min(0).default(0),

  // 本回合是否触发产卵
  shouldSpawnThisTick: z.boolean().default(false),

  // 本回合实际要产卵数量（由 intent 计算）
  spawnCountThisTick: z.number().min(0).default(0),

  // 默认每次产卵数量（由 intent 裁剪）
  spawnBatchSize: z.number().min(1).default(1),

  // 依据哪个生成分组统计上限（来自 spawnGroupCountMap）
  spawnGroup: z.string().default('monster'),

  // 产卵实体 id/type（用于查 spawnRegistry）
  spawnEntityId: z.string().default('horde_enemy'),

  // 产卵坐标策略
  spawnPosition: spawnPositionSchema.default({
    mode: 'self',
    offsetX: 0,
    offsetY: 0,
    radius: 120,
    rectWidth: 240,
    rectHeight: 160
  }),

  // 传给 spawnFactory 的参数
  spawnParams: z.record(z.string(), z.any()).default({}),

  // 调试/缓存字段（sense 阶段维护）
  currentCount: z.number().min(0).default(0),
  isAtLimit: z.boolean().default(false)
});

export type SpawnData = z.infer<typeof spawnSchema>;

export const Spawn: IComponentDefinition<typeof spawnSchema, SpawnData> = {
  name: 'Spawn',
  schema: spawnSchema,
  create(data: Partial<SpawnData> & Record<string, any> = {}) {
    // Legacy 兼容：将旧字段映射到新字段，减少迁移成本。
    const normalized = {
      ...data,
      enabled: data.enabled ?? data.spawnEnabled,
      spawnLimit: data.spawnLimit ?? data.maxAlive,
      cooldown: data.cooldown ?? data.spawnTimer,
      spawnGroup: data.spawnGroup ?? data.countByComponent
    };
    return spawnSchema.parse(normalized);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'spawn.enabled', label: '启用产卵', type: 'checkbox', group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnLimit', label: '产卵上限', type: 'number', props: { min: 0, step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnInterval', label: '产卵间隔', type: 'number', props: { min: 0, step: 0.1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.cooldown', label: '冷却', type: 'number', props: { min: 0, step: 0.1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnGroup', label: '生成分组', type: 'text', group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnEntityId', label: '产卵实体 ID', type: 'text', group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnBatchSize', label: '每批数量', type: 'number', props: { min: 1, step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnPosition.mode', label: '产卵位置模式', type: 'select', props: { options: ['self', 'target', 'offset', 'randomRadius', 'randomRect'] }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnPosition.offsetX', label: '偏移 X', type: 'number', props: { step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnPosition.offsetY', label: '偏移 Y', type: 'number', props: { step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnPosition.radius', label: '随机半径', type: 'number', props: { min: 0, step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnPosition.rectWidth', label: '矩形宽度', type: 'number', props: { min: 0, step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnPosition.rectHeight', label: '矩形高度', type: 'number', props: { min: 0, step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.currentCount', label: '当前计数', type: 'number', props: { min: 0, step: 1 }, group: '产卵器 (Spawner)' },
    { path: 'spawn.isAtLimit', label: '达到上限', type: 'checkbox', group: '产卵器 (Spawner)' },
    { path: 'spawn.shouldSpawnThisTick', label: '本回合产卵', type: 'checkbox', group: '产卵器 (Spawner)' },
    { path: 'spawn.spawnCountThisTick', label: '本回合数量', type: 'number', props: { min: 0, step: 1 }, group: '产卵器 (Spawner)' }
  ]
};

export const SpawnSchema = spawnSchema;
export const SPAWN_INSPECTOR_FIELDS = Spawn.inspectorFields;
