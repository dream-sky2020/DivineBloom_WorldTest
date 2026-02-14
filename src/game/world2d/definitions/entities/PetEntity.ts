import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import { WeaponEntity } from './WeaponEntity';
import {
  Bounds,
  BOUNDS_INSPECTOR_FIELDS,
  Children,
  DamageDetectable,
  Detectable,
  Health,
  HEALTH_INSPECTOR_FIELDS,
  Inspector,
  EDITOR_INSPECTOR_FIELDS,
  Motion,
  MotionMode,
  MOTION_INSPECTOR_FIELDS,
  MotionSteerProfile,
  Shape,
  ShapeType,
  SHAPE_INSPECTOR_FIELDS,
  Sprite,
  SPRITE_INSPECTOR_FIELDS,
  Transform,
  TRANSFORM_INSPECTOR_FIELDS,
  Velocity,
  VELOCITY_INSPECTOR_FIELDS,
  PortalDetectable
} from '@components';

const petWeaponConfigSchema = z.object({
  orbitRadius: z.number().default(30),
  orbitAngle: z.number().default(0),
  orbitSpeed: z.number().default(2.5),
  followSpeed: z.number().default(260),
  followRangeX: z.number().default(0),
  followRangeY: z.number().default(0),
  linearAccelFactor: z.number().default(0),
  spriteId: z.string().optional(),
  spriteScale: z.number().optional(),
  spriteTint: z.string().optional(),
  weaponConfig: z.object({
    weaponType: z.string().optional(),
    damage: z.number().optional(),
    fireRate: z.number().optional(),
    bulletSpeed: z.number().optional(),
    bulletColor: z.string().optional(),
    bulletLifeTime: z.number().optional(),
    bulletRadius: z.number().optional(),
    bulletSpriteId: z.string().optional(),
    bulletSpriteScale: z.number().optional(),
    damageDetectCcdEnabled: z.boolean().optional(),
    damageDetectCcdMinDistance: z.number().optional(),
    damageDetectCcdBuffer: z.number().optional(),
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
    projectileCount: z.number().optional(),
    projectileSpreadDeg: z.number().optional(),
    attackMode: z.string().optional(),
    attackArcDeg: z.number().optional(),
    attackAngleOffsetDeg: z.number().optional(),
    blockIfOutOfRange: z.boolean().optional()
  }).optional()
}).default({
  orbitRadius: 30,
  orbitAngle: 0,
  orbitSpeed: 2.5,
  followSpeed: 260,
  followRangeX: 0,
  followRangeY: 0,
  linearAccelFactor: 0
});

const PetEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Pet'),
  petId: z.string().optional(),
  ownerTarget: z.string().optional().default('player'),
  spriteId: z.string().optional().default('enemy_slime'),
  spriteScale: z.number().optional().default(0.45),
  spriteTint: z.string().optional().default('#9cf4ff'),
  radius: z.number().optional().default(10),
  maxHealth: z.number().optional().default(100),
  currentHealth: z.number().optional().default(100),
  followSpeed: z.number().optional().default(240),
  followStopDistance: z.number().optional().default(8),
  followRangeX: z.number().optional().default(12),
  followRangeY: z.number().optional().default(12),
  followOffsetX: z.number().optional().default(-28),
  followOffsetY: z.number().optional().default(0),
  followDistanceSpeedFactor: z.number().optional().default(0.2),
  weapon: petWeaponConfigSchema
});

export type PetEntityData = z.infer<typeof PetEntitySchema>;

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  ...(VELOCITY_INSPECTOR_FIELDS || []),
  ...(MOTION_INSPECTOR_FIELDS || []),
  ...(HEALTH_INSPECTOR_FIELDS || []),
  ...(SHAPE_INSPECTOR_FIELDS || []),
  ...(BOUNDS_INSPECTOR_FIELDS || []),
  ...(SPRITE_INSPECTOR_FIELDS || []),
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const PetEntity: IEntityDefinition<typeof PetEntitySchema> = {
  type: 'pet',
  name: '宠物',
  order: 15,
  creationIndex: 0,
  schema: PetEntitySchema,
  create(data: PetEntityData) {
    const result = PetEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PetEntity] Validation failed', result.error);
      return null;
    }

    const params = result.data;
    const petId = params.petId || `pet_${Math.random().toString(36).slice(2, 10)}`;
    const ownerTarget = params.ownerTarget || 'player';

    const root = world.add({
      id: petId,
      type: 'pet',
      name: params.name,
      tags: ['pet', 'ally'],
      transform: Transform.create(params.x, params.y),
      velocity: Velocity.create(),
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: params.radius }),
      bounds: Bounds.create(),
      health: Health.create({
        maxHealth: params.maxHealth,
        currentHealth: Math.min(params.currentHealth, params.maxHealth)
      }),
      detectable: Detectable.create(['pet', 'ally', 'teleportable']),
      damageDetectable: DamageDetectable.create(['pet', 'ally']),
      portalDetectable: PortalDetectable.create(['pet', 'ally', 'teleportable']),
      motion: Motion.create({
        enabled: true,
        mode: MotionMode.FOLLOW,
        maxSpeed: params.followSpeed,
        stopDistance: params.followStopDistance,
        deadZoneAxis: {
          x: params.followRangeX,
          y: params.followRangeY
        },
        distanceSpeedFactor: params.followDistanceSpeedFactor,
        target: {
          entityId: ownerTarget,
          offset: {
            x: params.followOffsetX,
            y: params.followOffsetY
          }
        }
      }),
      motionSteerProfile: MotionSteerProfile.create({
        profileId: 'pet_follow',
        speedScale: 1,
        distanceSpeedScale: 1,
        weights: {
          seek: 1,
          arrive: 1,
          separation: 0.15,
          avoidObstacle: 0.4,
          portalAttract: 0.9
        },
        portal: {
          enabled: true,
          minBenefitDistance: 80,
          maxPortalApproachDistance: 900,
          preferPortalWhenNoTarget: false
        }
      }),
      sprite: Sprite.create(params.spriteId, {
        scale: params.spriteScale,
        tint: params.spriteTint
      })
    });

    const weapon = WeaponEntity.create({
      x: params.x,
      y: params.y,
      name: `${params.name}_Weapon`,
      ownerTarget: petId,
      orbitRadius: params.weapon.orbitRadius,
      orbitAngle: params.weapon.orbitAngle,
      orbitSpeed: params.weapon.orbitSpeed,
      followSpeed: params.weapon.followSpeed,
      followRangeX: params.weapon.followRangeX,
      followRangeY: params.weapon.followRangeY,
      linearAccelFactor: params.weapon.linearAccelFactor,
      spriteId: params.weapon.spriteId,
      spriteScale: params.weapon.spriteScale,
      spriteTint: params.weapon.spriteTint,
      weaponConfig: params.weapon.weaponConfig
    } as any);

    root.children = Children.create(weapon ? [weapon] : []);
    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 85,
      editorBox: { w: 32, h: 32, scale: 1 }
    });

    return root;
  },

  serialize(entity: any) {
    const weaponEntity = entity.children?.entities?.find((c: any) => c?.type === 'weapon');
    return {
      type: 'pet',
      x: entity.transform?.x ?? 0,
      y: entity.transform?.y ?? 0,
      name: entity.name ?? 'Pet',
      petId: entity.id,
      ownerTarget: entity.motion?.target?.entityId ?? 'player',
      spriteId: entity.sprite?.id ?? 'enemy_slime',
      spriteScale: entity.sprite?.scale ?? 0.45,
      spriteTint: entity.sprite?.tint ?? '#9cf4ff',
      radius: entity.shape?.radius ?? 10,
      maxHealth: entity.health?.maxHealth ?? 100,
      currentHealth: entity.health?.currentHealth ?? 100,
      followSpeed: entity.motion?.maxSpeed ?? 240,
      followStopDistance: entity.motion?.stopDistance ?? 8,
      followRangeX: entity.motion?.deadZoneAxis?.x ?? 12,
      followRangeY: entity.motion?.deadZoneAxis?.y ?? 12,
      followOffsetX: entity.motion?.target?.offset?.x ?? -28,
      followOffsetY: entity.motion?.target?.offset?.y ?? 0,
      followDistanceSpeedFactor: entity.motion?.distanceSpeedFactor ?? 0.2,
      weapon: {
        orbitRadius: weaponEntity?.motion?.orbit?.radius ?? 30,
        orbitAngle: weaponEntity?.motion?.orbit?.angle ?? 0,
        orbitSpeed: (weaponEntity?.motion?.orbit?.clockwise ? -1 : 1) * (weaponEntity?.motion?.orbit?.angularSpeed ?? 2.5),
        followSpeed: weaponEntity?.motion?.maxSpeed ?? 260,
        followRangeX: weaponEntity?.motion?.deadZoneAxis?.x ?? 0,
        followRangeY: weaponEntity?.motion?.deadZoneAxis?.y ?? 0,
        linearAccelFactor: weaponEntity?.motion?.distanceSpeedFactor ?? 0,
        spriteId: weaponEntity?.sprite?.id,
        spriteScale: weaponEntity?.sprite?.scale,
        spriteTint: weaponEntity?.sprite?.tint,
        weaponConfig: weaponEntity?.weapon ? {
          weaponType: weaponEntity.weapon.weaponType,
          damage: weaponEntity.weapon.damage,
          fireRate: weaponEntity.weapon.fireRate,
          bulletSpeed: weaponEntity.weapon.bulletSpeed,
          bulletColor: weaponEntity.weapon.bulletColor,
          bulletLifeTime: weaponEntity.weapon.bulletLifeTime,
          bulletRadius: weaponEntity.weapon.bulletRadius,
          bulletSpriteId: weaponEntity.weapon.bulletSpriteId,
          bulletSpriteScale: weaponEntity.weapon.bulletSpriteScale,
          damageDetectCcdEnabled: weaponEntity.weapon.damageDetectCcdEnabled,
          damageDetectCcdMinDistance: weaponEntity.weapon.damageDetectCcdMinDistance,
          damageDetectCcdBuffer: weaponEntity.weapon.damageDetectCcdBuffer,
          bulletShape: weaponEntity.weapon.bulletShape,
          projectileCount: weaponEntity.weapon.projectileCount,
          projectileSpreadDeg: weaponEntity.weapon.projectileSpreadDeg,
          attackMode: weaponEntity.weapon.attackMode,
          attackArcDeg: weaponEntity.weapon.attackArcDeg,
          attackAngleOffsetDeg: weaponEntity.weapon.attackAngleOffsetDeg,
          blockIfOutOfRange: weaponEntity.weapon.blockIfOutOfRange
        } : undefined
      }
    };
  },

  deserialize(data: any) {
    return this.create(data);
  }
};
