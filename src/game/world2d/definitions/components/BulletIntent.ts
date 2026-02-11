import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const bulletIntentSchema = z.object({
  movementMode: z.enum(['linear', 'homing', 'orbit', 'wave', 'boomerang', 'scripted']).default('linear'),
  enabled: z.boolean().default(true),
  baseDirection: z.object({
    x: z.number().default(1),
    y: z.number().default(0)
  }).default({ x: 1, y: 0 }),
  speed: z.number().default(0),
  acceleration: z.number().default(0),
  maxSpeed: z.number().default(0),
  turnRate: z.number().default(0),
  targetId: z.string().nullable().default(null),
  orbitCenterId: z.string().nullable().default(null),
  orbitRadius: z.number().default(0),
  orbitAngularSpeed: z.number().default(0),
  waveAmplitude: z.number().default(0),
  waveFrequency: z.number().default(0),
  phase: z.number().default(0),
  boomerangReturnDelay: z.number().default(0),
  boomerangReturnSpeed: z.number().default(0),
  age: z.number().default(0),
  customParams: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({})
});

export type BulletIntentData = z.infer<typeof bulletIntentSchema>;

export const BulletIntent: IComponentDefinition<typeof bulletIntentSchema, BulletIntentData> = {
  name: 'BulletIntent',
  schema: bulletIntentSchema,
  create(config: Partial<BulletIntentData> = {}) {
    return bulletIntentSchema.parse(config);
  },
  serialize(component) {
    return {
      ...component,
      // 运行时字段重置，防止场景重载继承旧状态
      age: 0,
      phase: 0
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'bulletIntent.movementMode', label: '运动模式', type: 'select', props: { options: ['linear', 'homing', 'orbit', 'wave', 'boomerang', 'scripted'] }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.enabled', label: '启用', type: 'checkbox', group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.baseDirection.x', label: '方向 X', type: 'number', props: { step: 0.01 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.baseDirection.y', label: '方向 Y', type: 'number', props: { step: 0.01 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.speed', label: '速度', type: 'number', props: { step: 10 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.acceleration', label: '加速度', type: 'number', props: { step: 10 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.maxSpeed', label: '最大速度', type: 'number', props: { step: 10 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.turnRate', label: '转向速度', type: 'number', props: { step: 0.1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.targetId', label: '目标 ID', type: 'text', group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.orbitRadius', label: '环绕半径', type: 'number', props: { step: 1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.orbitAngularSpeed', label: '环绕角速度', type: 'number', props: { step: 0.1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.waveAmplitude', label: '波幅', type: 'number', props: { step: 1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.waveFrequency', label: '波频', type: 'number', props: { step: 0.1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.boomerangReturnDelay', label: '回旋延迟', type: 'number', props: { step: 0.1, min: 0 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.boomerangReturnSpeed', label: '回旋速度', type: 'number', props: { step: 10, min: 0 }, group: '子弹意图 (BulletIntent)' }
  ]
};

export const BulletIntentSchema = bulletIntentSchema;
export const BULLET_INTENT_INSPECTOR_FIELDS = BulletIntent.inspectorFields;
