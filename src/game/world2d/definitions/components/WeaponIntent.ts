import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const weaponIntentSchema = z.object({
  shouldFire: z.boolean().default(false),
  fireThisTick: z.boolean().default(false),
  sourceMode: z.enum(['idle', 'manual', 'auto']).default('idle'),
  targetId: z.string().nullable().default(null),
  attackDirection: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 1, y: 0 }),
  aimAngle: z.number().default(0),
  projectileSpeed: z.number().default(0),
  projectileCount: z.number().int().min(1).default(1),
  projectileDamage: z.number().default(0),
  projectileLifeTime: z.number().default(0),
  projectileRadius: z.number().default(0),
  projectileSpreadDeg: z.number().default(0),
  projectiles: z.array(z.object({
    direction: z.object({
      x: z.number(),
      y: z.number()
    }),
    speed: z.number(),
    angleOffsetDeg: z.number().default(0)
  })).default([])
});

export type WeaponIntentData = z.infer<typeof weaponIntentSchema>;

export const WeaponIntent: IComponentDefinition<typeof weaponIntentSchema, WeaponIntentData> = {
  name: 'WeaponIntent',
  schema: weaponIntentSchema,
  create(data: Partial<WeaponIntentData> = {}) {
    return weaponIntentSchema.parse(data);
  },
  serialize(component) {
    // Intent 为运行时状态，不持久化具体结果
    return {
      shouldFire: false,
      fireThisTick: false,
      sourceMode: 'idle',
      targetId: null,
      attackDirection: component.attackDirection,
      aimAngle: 0,
      projectileSpeed: component.projectileSpeed,
      projectileCount: component.projectileCount,
      projectileDamage: component.projectileDamage,
      projectileLifeTime: component.projectileLifeTime,
      projectileRadius: component.projectileRadius,
      projectileSpreadDeg: component.projectileSpreadDeg,
      projectiles: []
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'weaponIntent.shouldFire', label: '应当开火', type: 'checkbox', props: { readonly: true }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.fireThisTick', label: '本帧开火', type: 'checkbox', props: { readonly: true }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.sourceMode', label: '来源模式', type: 'text', props: { readonly: true }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.targetId', label: '目标 ID', type: 'text', props: { readonly: true }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.attackDirection.x', label: '方向 X', type: 'number', props: { readonly: true, step: 0.01 }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.attackDirection.y', label: '方向 Y', type: 'number', props: { readonly: true, step: 0.01 }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.aimAngle', label: '瞄准角度(rad)', type: 'number', props: { readonly: true, step: 0.01 }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.projectileCount', label: '子弹数量', type: 'number', props: { readonly: true, min: 1, step: 1 }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.projectileSpeed', label: '子弹速度', type: 'number', props: { readonly: true, step: 1 }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.projectileDamage', label: '子弹伤害', type: 'number', props: { readonly: true, step: 1 }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.projectileLifeTime', label: '子弹寿命', type: 'number', props: { readonly: true, step: 0.1 }, group: '武器意图 (WeaponIntent)' },
    { path: 'weaponIntent.projectileSpreadDeg', label: '散射角度', type: 'number', props: { readonly: true, step: 1 }, group: '武器意图 (WeaponIntent)' }
  ]
};

export const WeaponIntentSchema = weaponIntentSchema;
export const WEAPON_INTENT_INSPECTOR_FIELDS = WeaponIntent.inspectorFields;
