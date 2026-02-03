import { z } from 'zod'
import { world } from '@world2d/world'
import { PlayerConfig } from '@schema/assets'
import {
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Bounds, BOUNDS_INSPECTOR_FIELDS,
  Detectable,
  Health, HEALTH_INSPECTOR_FIELDS,
  Weapon, WEAPON_INSPECTOR_FIELDS,
  WeaponIntent,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  DETECT_AREA_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS
} from '@components'

// --- Schema Definition ---

export const PlayerEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Player'),
  scale: z.number().optional().default(0.7),
  // 允许传入武器配置
  weaponConfig: z.object({
    weaponType: z.string().optional(),
    damage: z.number().optional(),
    fireRate: z.number().optional(),
    bulletSpeed: z.number().optional(),
    bulletColor: z.string().optional(),
    bulletLifeTime: z.number().optional()
  }).optional()
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  ...TRANSFORM_INSPECTOR_FIELDS,
  { path: 'speed', label: '基础速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  { path: 'fastSpeed', label: '奔跑速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  ...HEALTH_INSPECTOR_FIELDS,
  ...WEAPON_INSPECTOR_FIELDS,
  ...VELOCITY_INSPECTOR_FIELDS,
  ...COLLIDER_INSPECTOR_FIELDS,
  ...BOUNDS_INSPECTOR_FIELDS,
  ...SPRITE_INSPECTOR_FIELDS,
  ...DETECT_AREA_INSPECTOR_FIELDS, // Added detect area fields support
  ...EDITOR_INSPECTOR_FIELDS
];

export const PlayerEntity = {
  create(data) {
    const result = PlayerEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PlayerEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, scale, weaponConfig } = result.data;

    const entity = {
      type: 'player',
      name: name,
      transform: Transform(x, y),
      velocity: Velocity(),
      detectable: Detectable(['player', 'teleportable']),
      input: true,
      player: true,
      speed: PlayerConfig.speed || 200,
      fastSpeed: PlayerConfig.fastSpeed || 320,
      collider: Collider.circle(12),
      bounds: Bounds(),
      health: Health.create({ maxHealth: 100, currentHealth: 100 }),
      weapon: Weapon({
        weaponType: weaponConfig?.weaponType || 'pistol',
        damage: weaponConfig?.damage || 10,
        fireRate: weaponConfig?.fireRate || 0.5,
        bulletSpeed: weaponConfig?.bulletSpeed || 500,
        bulletColor: weaponConfig?.bulletColor || '#FFFF00',
        bulletLifeTime: weaponConfig?.bulletLifeTime || 5
      }),
      weaponIntent: WeaponIntent(),
      sprite: Sprite.create('hero', { scale }),
      animation: Animation.create('idle'),
    };

    entity.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 100,
      editorBox: { w: 32, h: 48, scale: 1 }
    });

    return world.add(entity);
  },

  serialize(entity) {
    return {
      type: 'player',
      x: entity.transform.x,
      y: entity.transform.y,
      name: entity.name,
      scale: entity.sprite?.scale || 0.7
    }
  }
}
