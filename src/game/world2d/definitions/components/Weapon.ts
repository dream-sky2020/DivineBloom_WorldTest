import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { ShapeType } from '../enums/Shape';
const weaponSchema = z.object({
  weaponType: z.string().default('pistol'),
  fireRate: z.number().min(0.01).default(0.5),
  damage: z.number().min(0).default(10),
  bulletSpeed: z.number().min(0).default(500),
  bulletColor: z.string().default('#FFFF00'),
  bulletRadius: z.number().min(1).default(2),
  bulletLifeTime: z.number().default(3),
  bulletSpriteId: z.string().default('particle_1'),
  bulletSpriteScale: z.number().optional(),
  bulletDetectCcdEnabled: z.boolean().default(true),
  bulletDetectCcdMinDistance: z.number().default(0),
  bulletDetectCcdBuffer: z.number().default(0),
  bulletShape: z.object({
    type: z.nativeEnum(ShapeType).optional(),
    radius: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    rotation: z.number().optional(),
    offsetX: z.number().optional(),
    offsetY: z.number().optional(),
    p1: z.object({ x: z.number(), y: z.number() }).optional(),
    p2: z.object({ x: z.number(), y: z.number() }).optional()
  }).optional(),
  cooldown: z.number().min(0).default(0),
  isFiring: z.boolean().default(false),
  fireDirection: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 1, y: 0 })
});

export type WeaponData = z.infer<typeof weaponSchema>;

export const Weapon: IComponentDefinition<typeof weaponSchema, WeaponData> = {
  name: 'Weapon',
  schema: weaponSchema,
  create(config: Partial<WeaponData> = {}) {
    return weaponSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'weapon.weaponType', label: '武器类型', type: 'text', group: '武器 (Weapon)' },
    { path: 'weapon.damage', label: '伤害', type: 'number', props: { min: 0, step: 1 }, group: '武器 (Weapon)' },
    { path: 'weapon.fireRate', label: '射速', type: 'number', tip: '每秒发射次数', props: { min: 0.01, step: 0.1 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletSpeed', label: '子弹速度', type: 'number', props: { min: 0, step: 50 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletLifeTime', label: '子弹寿命', type: 'number', props: { min: 0.1, step: 0.1 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletColor', label: '子弹颜色', type: 'color', group: '武器 (Weapon)' },
    { path: 'weapon.bulletSpriteId', label: '子弹图标', type: 'text', tip: 'Sprite 资源 ID', group: '武器 (Weapon)' },
    { path: 'weapon.bulletSpriteScale', label: '子弹缩放', type: 'number', props: { step: 0.05, min: 0 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletDetectCcdEnabled', label: '子弹高速检测', type: 'checkbox', group: '武器 (Weapon)' },
    { path: 'weapon.bulletDetectCcdMinDistance', label: '子弹 CCD 距离阈值', type: 'number', props: { min: 0, step: 1 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletDetectCcdBuffer', label: '子弹 CCD 缓冲', type: 'number', props: { step: 0.5 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletShape', label: '子弹形状', type: 'json', tip: '用于 Shape 组件', group: '武器 (Weapon)' }
  ]
};

export const WeaponSchema = weaponSchema;
export const WEAPON_INSPECTOR_FIELDS = Weapon.inspectorFields;
