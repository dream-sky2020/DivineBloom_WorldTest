import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { ConditionLogic } from '../enums/ConditionLogic';

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

  // --- 结束目标 (Targets) ---
  // 目标时长（秒），-1 代表无时长限制
  targetDuration: z.number().default(-1),
  // 目标击杀普通敌人数量，-1 代表无数量限制
  targetEnemiesKilled: z.number().default(-1),
  // 目标精英击杀数量，-1 代表无限制
  targetEliteKilled: z.number().default(-1),
  // 目标Boss击杀数量，-1 代表无限制
  targetBossKilled: z.number().default(-1),
  // 目标判定模式：AND (全部完成) 或 OR (任意一个完成)
  targetCondition: z.nativeEnum(ConditionLogic).default(ConditionLogic.AND),

  // 是否为Boss波次
  isBossWave: z.boolean().default(false),

  // 当前难度值
  difficulty: z.number().min(0).default(0),

  // 是否已启动波次
  active: z.boolean().default(false),

  // 当前波次击杀数
  enemiesKilled: z.number().min(0).default(0),

  // 累计击杀数
  totalEnemiesKilled: z.number().min(0).default(0),

  // 当前波次Boss击杀数
  bossKilledInWave: z.number().min(0).default(0),

  // 累计Boss击杀数
  totalBossKilled: z.number().min(0).default(0),

  // 当前精英击杀数
  eliteKilledInWave: z.number().min(0).default(0),

  // 累计精英击杀数
  totalEliteKilled: z.number().min(0).default(0),

  // 总计游戏时间（秒）
  totalElapsedTime: z.number().min(0).default(0)
});

export type CombatProgressData = z.infer<typeof combatProgressSchema>;

export const CombatProgress: IComponentDefinition<typeof combatProgressSchema, CombatProgressData> = {
  name: 'CombatProgress',
  schema: combatProgressSchema,
  create(data: Partial<CombatProgressData> = {}) {
    return combatProgressSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'combatProgress.waveIndex', label: '当前波次', type: 'number', props: { min: 1, step: 1 }, group: '战斗状态 (Status)' },
    { path: 'combatProgress.active', label: '波次激活', type: 'checkbox', group: '战斗状态 (Status)' },
    { path: 'combatProgress.waveElapsed', label: '波次已进行', type: 'number', props: { min: 0, step: 1 }, group: '实时进度 (Progress)' },

    // 目标指标分组
    { path: 'combatProgress.targetCondition', label: '目标达成模式', type: 'enum', options: ConditionLogic, group: '波次目标 (Goal)' },
    { path: 'combatProgress.targetDuration', label: '目标时长 (-1无)', type: 'number', props: { min: -1, step: 1 }, group: '波次目标 (Goal)' },
    { path: 'combatProgress.targetEnemiesKilled', label: '目标击杀数 (-1无)', type: 'number', props: { min: -1, step: 1 }, group: '波次目标 (Goal)' },
    { path: 'combatProgress.targetEliteKilled', label: '目标精英数 (-1无)', type: 'number', props: { min: -1, step: 1 }, group: '波次目标 (Goal)' },
    { path: 'combatProgress.targetBossKilled', label: '目标Boss数 (-1无)', type: 'number', props: { min: -1, step: 1 }, group: '波次目标 (Goal)' },

    { path: 'combatProgress.isBossWave', label: 'Boss波次', type: 'checkbox', group: '战斗状态 (Status)' },
    { path: 'combatProgress.difficulty', label: '当前难度', type: 'number', props: { min: 0, step: 1 }, group: '统计 (Stats)' },
    { path: 'combatProgress.enemiesKilled', label: '波次击杀', type: 'number', props: { min: 0, step: 1 }, group: '实时进度 (Progress)' },
    { path: 'combatProgress.totalEnemiesKilled', label: '累计击杀', type: 'number', props: { min: 0, step: 1 }, group: '统计 (Stats)' },
    { path: 'combatProgress.bossKilledInWave', label: '波次Boss击杀', type: 'number', props: { min: 0, step: 1 }, group: '实时进度 (Progress)' },
    { path: 'combatProgress.totalBossKilled', label: '累计Boss击杀', type: 'number', props: { min: 0, step: 1 }, group: '统计 (Stats)' },
    { path: 'combatProgress.eliteKilledInWave', label: '波次精英击杀', type: 'number', props: { min: 0, step: 1 }, group: '实时进度 (Progress)' },
    { path: 'combatProgress.totalEliteKilled', label: '累计精英击杀', type: 'number', props: { min: 0, step: 1 }, group: '统计 (Stats)' },
    { path: 'combatProgress.totalElapsedTime', label: '总计时间', type: 'number', props: { min: 0, step: 1 }, group: '统计 (Stats)' }
  ]
};

export const CombatProgressSchema = combatProgressSchema;
export const COMBAT_PROGRESS_INSPECTOR_FIELDS = CombatProgress.inspectorFields;
