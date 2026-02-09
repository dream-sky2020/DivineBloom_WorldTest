import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

/**
 * 波次时间映射表
 * 根据属性列表65-82行的数据定义
 */
export const WAVE_DIFFICULTY_MAP: Record<number, number> = {
  1: 15,
  2: 20,
  3: 25,
  4: 30,
  5: 35,
  6: 40,
  7: 45,
  8: 50,
  9: 55,
  10: 60,
  11: 65,
  12: 70,
  13: 75,
  14: 80,
  15: 85,
  16: 90,
  // Boss波次时间为120
};

export const BOSS_WAVE_DURATION = 120;

const combatProgressSchema = z.object({
  // 当前波次（从1开始）
  waveIndex: z.number().min(1).default(1),

  // 当前波次已进行时间（秒）
  waveElapsed: z.number().min(0).default(0),

  // 当前波次总时长（秒）
  waveDuration: z.number().min(0).default(0),

  // 是否为Boss波次
  isBossWave: z.boolean().default(false),

  // 当前难度值
  difficulty: z.number().min(0).default(0),

  // 当前波次击杀数
  enemiesKilled: z.number().min(0).default(0),

  // 累计击杀数
  totalEnemiesKilled: z.number().min(0).default(0),

  // 总计游戏时间（秒）
  totalElapsedTime: z.number().min(0).default(0)
});

export type CombatProgressData = z.infer<typeof combatProgressSchema>;

export const CombatProgress: IComponentDefinition<typeof combatProgressSchema, CombatProgressData> = {
  name: 'CombatProgress',
  schema: combatProgressSchema,
  create(options: Partial<CombatProgressData> = {}) {
    return combatProgressSchema.parse(options);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'combatProgress.waveIndex', label: '当前波次', type: 'number', props: { min: 1, step: 1 }, group: '战斗进度 (Combat)' },
    { path: 'combatProgress.waveElapsed', label: '波次已进行', type: 'number', props: { min: 0, step: 1 }, group: '战斗进度 (Combat)' },
    { path: 'combatProgress.waveDuration', label: '波次时长', type: 'number', props: { min: 0, step: 1 }, group: '战斗进度 (Combat)' },
    { path: 'combatProgress.isBossWave', label: 'Boss波次', type: 'checkbox', group: '战斗进度 (Combat)' },
    { path: 'combatProgress.difficulty', label: '当前难度', type: 'number', props: { min: 0, step: 1 }, group: '战斗进度 (Combat)' },
    { path: 'combatProgress.enemiesKilled', label: '波次击杀', type: 'number', props: { min: 0, step: 1 }, group: '战斗进度 (Combat)' },
    { path: 'combatProgress.totalEnemiesKilled', label: '累计击杀', type: 'number', props: { min: 0, step: 1 }, group: '战斗进度 (Combat)' },
    { path: 'combatProgress.totalElapsedTime', label: '总计时间', type: 'number', props: { min: 0, step: 1 }, group: '战斗进度 (Combat)' }
  ]
};

export const CombatProgressSchema = combatProgressSchema;
export const COMBAT_PROGRESS_INSPECTOR_FIELDS = CombatProgress.inspectorFields;
