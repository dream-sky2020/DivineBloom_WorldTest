import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
  Bounce, BOUNCE_INSPECTOR_FIELDS,
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  ShapeType, Shape, SHAPE_INSPECTOR_FIELDS,
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Inspector,
  Bullet, BULLET_INSPECTOR_FIELDS,
  Damage, DAMAGE_INSPECTOR_FIELDS,
  DamageDetect, DAMAGE_DETECT_INSPECTOR_FIELDS,
  LifeTime, LIFETIME_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS
} from '@components';

const BulletEntitySchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  // 物理属性
  radius: z.number().default(2),
  // 战斗属性
  damage: z.number().default(10),
  maxHitCount: z.number().int().min(0).default(1),
  remainingHitCount: z.number().int().min(0).optional(),
  // 生命周期
  maxLifeTime: z.number().default(3),
  // 视觉属性
  color: z.string().default('#FFFF00'),
  spriteId: z.string().default('particle_1'),
  spriteScale: z.number().optional(),
  detectCcdEnabled: z.boolean().default(true),
  detectCcdMinDistance: z.number().default(0),
  detectCcdBuffer: z.number().default(0),
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
  // 速度方向（由 WeaponControlSystem 传入）
  velocityX: z.number().optional(),
  velocityY: z.number().optional()
});

export type BulletEntityData = z.infer<typeof BulletEntitySchema>;

export const BulletEntity: IEntityDefinition<typeof BulletEntitySchema> = {
  type: 'bullet',
  name: '子弹',
  order: 99,
  creationIndex: 0,

  schema: BulletEntitySchema,

  create: (config: Partial<BulletEntityData> = {}) => {
    // 1. 解析基础配置
    const params = BulletEntitySchema.parse(config)

    const root = world.add({
      type: 'bullet',
      tags: ['bullet'],

      // 基础位置
      transform: Transform.create(params.x, params.y),

      // 速度组件（独立于 bullet.speed）
      velocity: Velocity.create({
        x: params.velocityX || 0,
        y: params.velocityY || 0
      }),

      sprite: Sprite.create(params.spriteId, {
        scale: params.spriteScale ?? (params.radius / 16), // particle_1.png 大小约为 32px
        tint: params.color
      }),

      // 战斗与弹体属性
      bullet: Bullet.create(),
      bounce: Bounce.create(),
      damage: Damage.create({
        amount: params.damage,
        maxHitCount: params.maxHitCount,
        remainingHitCount: params.remainingHitCount ?? params.maxHitCount
      }),

      // 高速探测 (CCD)
      damageDetect: DamageDetect.create({
        ccdEnabled: params.detectCcdEnabled,
        ccdMinDistance: params.detectCcdMinDistance,
        ccdBuffer: params.detectCcdBuffer || params.radius
      }),

      shape: Shape.create({
        type: params.bulletShape?.type || ShapeType.CIRCLE,
        radius: params.bulletShape?.radius ?? params.radius,
        width: params.bulletShape?.width,
        height: params.bulletShape?.height,
        rotation: params.bulletShape?.rotation,
        offsetX: params.bulletShape?.offsetX,
        offsetY: params.bulletShape?.offsetY,
        p1: params.bulletShape?.p1,
        p2: params.bulletShape?.p2
      }),
      collider: Collider.create({
        isTrigger: true, // 子弹是触发器
        isStatic: false
      }),

      // 生命周期管理
      lifeTime: LifeTime.create(params.maxLifeTime, true)
    });

    // 运行时双缓冲命中集合兜底初始化（不参与序列化）
    if (root.damageDetect) {
      if (!root.damageDetect.lastHits) root.damageDetect.lastHits = new Set<string>();
      if (!root.damageDetect.activeHits) root.damageDetect.activeHits = new Set<string>();
    }

    // 编辑器支持
    root.inspector = Inspector.create({
      fields: [
        ...(TRANSFORM_INSPECTOR_FIELDS || []),
        ...(VELOCITY_INSPECTOR_FIELDS || []),
        ...(SHAPE_INSPECTOR_FIELDS || []),
        ...(COLLIDER_INSPECTOR_FIELDS || []),
        ...(BULLET_INSPECTOR_FIELDS || []),
        ...(BOUNCE_INSPECTOR_FIELDS || []),
        ...(DAMAGE_INSPECTOR_FIELDS || []),
        ...(LIFETIME_INSPECTOR_FIELDS || []),
        ...(SPRITE_INSPECTOR_FIELDS || []),
        ...(DAMAGE_DETECT_INSPECTOR_FIELDS || [])
      ]
    })

    // 添加到世界中
    return root
  },

  serialize(entity: any) {
    // Bullet 通常是瞬态的，可能不需要复杂的序列化，或者仅用于调试
    const { transform, shape, sprite, lifeTime, damage } = entity
    const data: any = {
      type: 'bullet',
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      radius: shape?.radius ?? 2,
      damage: damage?.amount ?? 10,
      maxHitCount: damage?.maxHitCount ?? 1,
      remainingHitCount: damage?.remainingHitCount ?? (damage?.maxHitCount ?? 1),
      maxLifeTime: lifeTime?.maxTime ?? 3,
      color: sprite?.tint ?? '#FFFF00',
      spriteId: sprite?.id ?? 'particle_1',
      spriteScale: sprite?.scale ?? ((shape?.radius ? shape.radius / 16 : 0.125)),
      detectCcdEnabled: entity.damageDetect?.ccdEnabled ?? true,
      detectCcdMinDistance: entity.damageDetect?.ccdMinDistance ?? 0,
      detectCcdBuffer: entity.damageDetect?.ccdBuffer ?? 0
    }
    return data;
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
