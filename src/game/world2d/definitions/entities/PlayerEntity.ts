import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import { PlayerConfig } from '@schema/assets';
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
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Shape, ShapeType
} from '@components';

// --- Schema Definition ---

export const PlayerEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Player'),
  assetId: z.string().optional().default('hero'),
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

export type PlayerEntityData = z.infer<typeof PlayerEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  { path: 'speed', label: '基础速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  { path: 'fastSpeed', label: '奔跑速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  ...(HEALTH_INSPECTOR_FIELDS || []),
  ...(WEAPON_INSPECTOR_FIELDS || []),
  ...(VELOCITY_INSPECTOR_FIELDS || []),
  ...(COLLIDER_INSPECTOR_FIELDS || []),
  ...(BOUNDS_INSPECTOR_FIELDS || []),
  ...(SPRITE_INSPECTOR_FIELDS || []),
  ...(DETECT_AREA_INSPECTOR_FIELDS || []), // Added detect area fields support
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const PlayerEntity: IEntityDefinition<typeof PlayerEntitySchema> = {
  type: 'player',
  name: '玩家',
  order: 0,
  creationIndex: 0,
  schema: PlayerEntitySchema,
  create(data: PlayerEntityData) {
    const result = PlayerEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PlayerEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, assetId, scale, weaponConfig } = result.data;

    const root = world.add({
      type: 'player',
      name: name,
      transform: Transform.create(x, y),
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: 12 }),
      collider: Collider.create({ shapeId: 'body' }),
      detectable: Detectable.create(['player', 'teleportable']),
      velocity: Velocity.create(),
      input: true,
      player: true,
      speed: (PlayerConfig as any).speed || 200,
      fastSpeed: (PlayerConfig as any).fastSpeed || 320,
      bounds: Bounds.create(),
      health: Health.create({ maxHealth: 100, currentHealth: 100 }),
      weapon: Weapon.create({
        weaponType: weaponConfig?.weaponType || 'pistol',
        damage: weaponConfig?.damage || 10,
        fireRate: weaponConfig?.fireRate || 0.5,
        bulletSpeed: weaponConfig?.bulletSpeed || 500,
        bulletColor: weaponConfig?.bulletColor || '#FFFF00',
        bulletLifeTime: weaponConfig?.bulletLifeTime || 5
      }),
      weaponIntent: WeaponIntent.create(),
      sprite: Sprite.create(assetId, { scale }),
      animation: Animation.create('idle'),
    });

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 100,
      editorBox: { w: 40, h: 40, scale: 1 }
    });

    return root;
  },

  serialize(entity: any) {
    return {
      type: 'player',
      x: entity.transform.x,
      y: entity.transform.y,
      name: entity.name,
      assetId: entity.sprite?.id || 'hero',
      scale: entity.sprite?.scale || 0.7
    }
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
