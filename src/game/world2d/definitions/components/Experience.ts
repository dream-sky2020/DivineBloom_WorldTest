import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const experienceSchema = z.object({
  // 当前等级
  level: z.number().min(1).default(1),

  // 当前等级已获得经验
  currentExp: z.number().min(0).default(0),

  // 升级所需经验
  expToNextLevel: z.number().min(0).default(0),

  // 累计总经验
  totalExp: z.number().min(0).default(0),

  // 等级上限（可选）
  maxLevel: z.number().min(1).optional(),

  // 升级曲线配置
  expCurve: z.object({
    // 曲线类型：linear(线性) | exponential(指数) | table(表)
    type: z.enum(['linear', 'exponential', 'table']).default('linear'),

    // 基础经验
    baseExp: z.number().min(0).default(10),

    // 增长系数（线性为增量，指数为倍率）
    growth: z.number().min(0).default(1),

    // 指定等级经验表（当 type=table 时优先使用）
    table: z.array(z.number().min(0)).default([])
  }).default({
    type: 'linear',
    baseExp: 10,
    growth: 1,
    table: []
  })
});

export type ExperienceData = z.infer<typeof experienceSchema>;

export const Experience: IComponentDefinition<typeof experienceSchema, ExperienceData> = {
  name: 'Experience',
  schema: experienceSchema,
  create(data: Partial<ExperienceData> = {}) {
    return experienceSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'experience.level', label: '等级', type: 'number', props: { min: 1, step: 1 }, group: '经验 (Experience)' },
    { path: 'experience.currentExp', label: '当前经验', type: 'number', props: { min: 0, step: 1 }, group: '经验 (Experience)' },
    { path: 'experience.expToNextLevel', label: '升级所需经验', type: 'number', props: { min: 0, step: 1 }, group: '经验 (Experience)' },
    { path: 'experience.totalExp', label: '累计经验', type: 'number', props: { min: 0, step: 1 }, group: '经验 (Experience)' },
    { path: 'experience.maxLevel', label: '等级上限', type: 'number', props: { min: 1, step: 1 }, group: '经验 (Experience)' },
    { path: 'experience.expCurve.type', label: '曲线类型', type: 'text', group: '经验 (Experience)' },
    { path: 'experience.expCurve.baseExp', label: '基础经验', type: 'number', props: { min: 0, step: 1 }, group: '经验 (Experience)' },
    { path: 'experience.expCurve.growth', label: '增长系数', type: 'number', props: { min: 0, step: 0.1 }, group: '经验 (Experience)' },
    { path: 'experience.expCurve.table', label: '经验表', type: 'json', group: '经验 (Experience)' }
  ]
};

export const ExperienceSchema = experienceSchema;
export const EXPERIENCE_INSPECTOR_FIELDS = Experience.inspectorFields;
