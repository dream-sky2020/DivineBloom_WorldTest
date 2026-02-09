import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  ShapeType, Shape, SHAPE_INSPECTOR_FIELDS,
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Inspector,
  Projectile,
  DetectArea, DETECT_AREA_INSPECTOR_FIELDS,
  LifeTime, LIFETIME_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Trigger
} from '@components';

const BulletEntitySchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  // 物理属性
  radius: z.number().default(2),
  // 战斗属性
  damage: z.number().default(10),
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
  // 速度方向（由 WeaponSystem 传入）
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

      // 速度组件（独立于 projectile.speed）
      velocity: Velocity.create(params.velocityX || 0, params.velocityY || 0),

      sprite: Sprite.create(params.spriteId, {
        scale: params.spriteScale ?? (params.radius / 16), // particle_1.png 大小约为 32px
        tint: params.color
      }),

      // 战斗属性（仅伤害相关）
      projectile: Projectile.create({
        damage: params.damage
      }),

      // 高速探测 (CCD)
      detectArea: DetectArea.create({
        target: ['enemy', 'obstacle', 'player'], // 默认目标
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
      lifeTime: LifeTime.create(params.maxLifeTime, true),

      // 添加 Trigger 支持动作分发（例如子弹命中后产生特殊效果）
      trigger: Trigger.create({
        rules: [{ type: 'onEnter' }], // 当 detectArea 产生结果时触发
        actions: [] // 预留
      })
    });

    // 编辑器支持
    root.inspector = Inspector.create({
      fields: [
        ...(TRANSFORM_INSPECTOR_FIELDS || []),
        ...(VELOCITY_INSPECTOR_FIELDS || []),
        ...(SHAPE_INSPECTOR_FIELDS || []),
        ...(COLLIDER_INSPECTOR_FIELDS || []),
        { path: 'projectile.damage', label: 'Damage', type: 'number' },
        { path: 'projectile.speed', label: 'Speed', type: 'number' },
        { path: 'projectile.maxLifeTime', label: 'Life Time', type: 'number' },
        ...(LIFETIME_INSPECTOR_FIELDS || []),
        ...(SPRITE_INSPECTOR_FIELDS || []),
        ...(DETECT_AREA_INSPECTOR_FIELDS || [])
      ]
    })
    
    // 添加到世界中
    return root
  },

  serialize(entity: any) {
    // Bullet 通常是瞬态的，可能不需要复杂的序列化，或者仅用于调试
    const { transform, projectile, sprite, lifeTime, children } = entity
    const data: any = {
      type: 'bullet',
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      radius: projectile?.radius ?? 2,
      damage: projectile?.damage ?? 10,
      maxLifeTime: lifeTime?.maxTime ?? 3,
      color: sprite?.tint ?? '#FFFF00',
      spriteId: sprite?.id ?? 'particle_1',
      spriteScale: sprite?.scale ?? (projectile?.radius ? projectile.radius / 16 : 0.125),
      detectCcdEnabled: entity.detectArea?.ccdEnabled ?? true,
      detectCcdMinDistance: entity.detectArea?.ccdMinDistance ?? 0,
      detectCcdBuffer: entity.detectArea?.ccdBuffer ?? 0
    }
    return data;
  },

  deserialize(data: any) {
      return this.create(data);
  }
}
