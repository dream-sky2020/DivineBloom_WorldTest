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
  bulletMaxHitCount: z.number().int().min(0).default(1),
  bulletSpriteId: z.string().default('particle_1'),
  bulletSpriteScale: z.number().optional(),
  damageDetectCcdEnabled: z.boolean().default(true),
  damageDetectCcdMinDistance: z.number().default(0),
  damageDetectCcdBuffer: z.number().default(0),
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
  projectileCount: z.number().int().min(1).default(1),
  projectileSpreadDeg: z.number().min(0).default(0),
  cooldown: z.number().min(0).default(0),
  isFiring: z.boolean().default(false),
  fireDirection: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 1, y: 0 }),
  // 攻击方向基准
  attackMode: z.enum([
    'free',
    'ownerFacing',
    'worldUp'
  ]).default('free'),
  // 允许偏移角度（总角度）
  attackArcDeg: z.number().min(0).default(180),
  // 攻击方向偏移（度）
  attackAngleOffsetDeg: z.number().default(0),
  // 超出限制时是否禁止射击（否则夹到边界）
  blockIfOutOfRange: z.boolean().default(false)
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
    { path: 'weapon.bulletMaxHitCount', label: '子弹最大命中次数', type: 'number', props: { min: 0, step: 1 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletColor', label: '子弹颜色', type: 'color', group: '武器 (Weapon)' },
    { path: 'weapon.bulletSpriteId', label: '子弹图标', type: 'text', tip: 'Sprite 资源 ID', group: '武器 (Weapon)' },
    { path: 'weapon.bulletSpriteScale', label: '子弹缩放', type: 'number', props: { step: 0.05, min: 0 }, group: '武器 (Weapon)' },
    { path: 'weapon.damageDetectCcdEnabled', label: '子弹高速检测', type: 'checkbox', group: '武器 (Weapon)' },
    { path: 'weapon.damageDetectCcdMinDistance', label: '子弹 CCD 距离阈值', type: 'number', props: { min: 0, step: 1 }, group: '武器 (Weapon)' },
    { path: 'weapon.damageDetectCcdBuffer', label: '子弹 CCD 缓冲', type: 'number', props: { step: 0.5 }, group: '武器 (Weapon)' },
    { path: 'weapon.bulletShape', label: '子弹形状', type: 'json', tip: '用于 Shape 组件', group: '武器 (Weapon)' },
    { path: 'weapon.projectileCount', label: '子弹数量', type: 'number', props: { min: 1, step: 1 }, group: '武器 (Weapon)' },
    { path: 'weapon.projectileSpreadDeg', label: '子弹散射角', type: 'number', props: { min: 0, step: 1 }, group: '武器 (Weapon)' },
    { path: 'weapon.attackMode', label: '攻击基准', type: 'text', group: '武器 (Weapon)' },
    { path: 'weapon.attackArcDeg', label: '允许偏移角', type: 'number', props: { min: 0, step: 5 }, group: '武器 (Weapon)' },
    { path: 'weapon.attackAngleOffsetDeg', label: '方向偏移', type: 'number', props: { step: 5 }, group: '武器 (Weapon)' },
    { path: 'weapon.blockIfOutOfRange', label: '超出禁止射击', type: 'checkbox', group: '武器 (Weapon)' }
  ]
};

export const WeaponSchema = weaponSchema;
export const WEAPON_INSPECTOR_FIELDS = Weapon.inspectorFields;
