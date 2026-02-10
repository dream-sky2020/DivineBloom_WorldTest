import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const nearbyEnemySchema = z.object({
  id: z.string(),
  entity: z.any(),
  distance: z.number(),
  distanceSq: z.number(),
  direction: z.object({
    x: z.number(),
    y: z.number()
  }),
  angle: z.number(),
  priority: z.number().default(1),
  category: z.enum(['normal', 'horde']).default('normal')
});

const weaponSenseSchema = z.object({
  nearbyEnemies: z.array(nearbyEnemySchema).default([]),
  primaryTarget: nearbyEnemySchema.nullable().default(null),
  senseRadius: z.number().default(0)
});

export type NearbyEnemyData = z.infer<typeof nearbyEnemySchema>;
export type WeaponSenseData = z.infer<typeof weaponSenseSchema>;

export const WeaponSense: IComponentDefinition<typeof weaponSenseSchema, WeaponSenseData> = {
  name: 'WeaponSense',
  schema: weaponSenseSchema,
  create(data: Partial<WeaponSenseData> = {}) {
    return weaponSenseSchema.parse(data);
  },
  serialize(component) {
    return {
      nearbyEnemies: [],
      primaryTarget: null,
      senseRadius: component.senseRadius
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'weaponSense.senseRadius', label: '感知半径', type: 'number', props: { readonly: true }, group: '武器感知 (WeaponSense)' },
    { path: 'weaponSense.primaryTarget.id', label: '主目标', type: 'text', props: { readonly: true }, group: '武器感知 (WeaponSense)' },
    { path: 'weaponSense.nearbyEnemies', label: '附近敌人', type: 'json', props: { readonly: true }, group: '武器感知 (WeaponSense)' }
  ]
};

export const WeaponSenseSchema = weaponSenseSchema;
export const WEAPON_SENSE_INSPECTOR_FIELDS = WeaponSense.inspectorFields;
