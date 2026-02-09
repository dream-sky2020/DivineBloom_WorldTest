import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import { PlayerConfig } from '@schema/assets';
import { WeaponEntity } from './WeaponEntity';
import {
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Bounds, BOUNDS_INSPECTOR_FIELDS,
  Detectable,
  Health, HEALTH_INSPECTOR_FIELDS,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  DETECT_AREA_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Shape, ShapeType, SHAPE_INSPECTOR_FIELDS
} from '@components';

// --- Schema Definition ---

const weaponConfigSchema = z.object({
  weaponType: z.string().optional(),
  damage: z.number().optional(),
  fireRate: z.number().optional(),
  bulletSpeed: z.number().optional(),
  bulletColor: z.string().optional(),
  bulletLifeTime: z.number().optional(),
  bulletRadius: z.number().optional(),
  bulletSpriteId: z.string().optional(),
  bulletSpriteScale: z.number().optional(),
  bulletDetectCcdEnabled: z.boolean().optional(),
  bulletDetectCcdMinDistance: z.number().optional(),
  bulletDetectCcdBuffer: z.number().optional(),
  bulletShape: z.object({
    type: z.string().optional(),
    radius: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    rotation: z.number().optional(),
    offsetX: z.number().optional(),
    offsetY: z.number().optional(),
    p1: z.object({ x: z.number(), y: z.number() }).optional(),
    p2: z.object({ x: z.number(), y: z.number() }).optional()
  }).optional(),
  attackMode: z.string().optional(),
  attackArcDeg: z.number().optional(),
  attackAngleOffsetDeg: z.number().optional(),
  blockIfOutOfRange: z.boolean().optional(),
  orbitRadius: z.number().optional(),
  orbitAngle: z.number().optional(),
  orbitSpeed: z.number().optional(),
  followSpeed: z.number().optional(),
  followRangeX: z.number().optional(),
  followRangeY: z.number().optional(),
  linearAccelFactor: z.number().optional(),
  spriteId: z.string().optional(),
  spriteScale: z.number().optional(),
  spriteTint: z.string().optional()
});

export const PlayerEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Player'),
  assetId: z.string().optional().default('hero'),
  scale: z.number().optional().default(0.7),
  // 允许传入单个或多个武器配置
  weaponConfig: weaponConfigSchema.optional(),
  weaponConfigs: z.array(weaponConfigSchema).optional()
});

export type PlayerEntityData = z.infer<typeof PlayerEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  { path: 'speed', label: '基础速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  { path: 'fastSpeed', label: '奔跑速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  ...(HEALTH_INSPECTOR_FIELDS || []),
  ...(VELOCITY_INSPECTOR_FIELDS || []),
  ...(SHAPE_INSPECTOR_FIELDS || []),
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

    const { x, y, name, assetId, scale, weaponConfig, weaponConfigs } = result.data;

    const root = world.add({
      type: 'player',
      name: name,
      transform: Transform.create(x, y),
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: 12 }),
      collider: Collider.create(),
      detectable: Detectable.create(['player', 'teleportable']),
      velocity: Velocity.create(),
      input: true,
      player: true,
      speed: (PlayerConfig as any).speed || 200,
      fastSpeed: (PlayerConfig as any).fastSpeed || 320,
      bounds: Bounds.create(),
      health: Health.create({ maxHealth: 100, currentHealth: 100 }),
      sprite: Sprite.create(assetId, { scale }),
      animation: Animation.create('idle'),
    });

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 100,
      editorBox: { w: 40, h: 40, scale: 1 }
    });

    const configList = (weaponConfigs && weaponConfigs.length > 0)
      ? weaponConfigs
      : (weaponConfig ? [weaponConfig] : [{}]);

    const count = configList.length;
    configList.forEach((cfg, index) => {
      const orbitAngle = cfg.orbitAngle ?? (count > 1 ? (index * Math.PI * 2) / count : 0);
      const weaponEntityData: any = {
        x,
        y,
        ownerTarget: 'player',
        orbitRadius: cfg.orbitRadius ?? 40,
        orbitAngle,
        orbitSpeed: cfg.orbitSpeed ?? 2,
        followSpeed: cfg.followSpeed ?? 300,
        followRangeX: cfg.followRangeX ?? 0,
        followRangeY: cfg.followRangeY ?? 0,
        linearAccelFactor: cfg.linearAccelFactor ?? 0,
        weaponConfig: {
          weaponType: cfg.weaponType,
          damage: cfg.damage,
          fireRate: cfg.fireRate,
          bulletSpeed: cfg.bulletSpeed,
          bulletColor: cfg.bulletColor,
          bulletLifeTime: cfg.bulletLifeTime,
          bulletRadius: cfg.bulletRadius,
          bulletSpriteId: cfg.bulletSpriteId,
          bulletSpriteScale: cfg.bulletSpriteScale,
          bulletDetectCcdEnabled: cfg.bulletDetectCcdEnabled,
          bulletDetectCcdMinDistance: cfg.bulletDetectCcdMinDistance,
          bulletDetectCcdBuffer: cfg.bulletDetectCcdBuffer,
          bulletShape: cfg.bulletShape,
          attackMode: cfg.attackMode,
          attackArcDeg: cfg.attackArcDeg,
          attackAngleOffsetDeg: cfg.attackAngleOffsetDeg,
          blockIfOutOfRange: cfg.blockIfOutOfRange
        }
      };

      if (cfg.spriteId !== undefined) weaponEntityData.spriteId = cfg.spriteId;
      if (cfg.spriteScale !== undefined) weaponEntityData.spriteScale = cfg.spriteScale;
      if (cfg.spriteTint !== undefined) weaponEntityData.spriteTint = cfg.spriteTint;

      WeaponEntity.create(weaponEntityData);
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
