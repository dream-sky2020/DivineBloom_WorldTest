import { z } from 'zod'
import { world } from '@world2d/world'
import {
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  ShapeType, Shape,
  Sprite,
  Inspector,
  Projectile,
  DetectProjectile,
  LifeTime, LIFETIME_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Parent, Children, LocalTransform, Trigger
} from '@components'

export const BulletEntity = {
  name: 'Bullet',
  description: 'Standard projectile entity',

  schema: z.object({
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
    // 速度方向（由 WeaponSystem 传入）
    velocityX: z.number().optional(),
    velocityY: z.number().optional()
  }),

  create: (config = {}) => {
    // 1. 解析基础配置
    const params = BulletEntity.schema.parse(config)

    const root = world.add({
      type: 'bullet',
      tags: ['bullet'],
      
      // 基础位置
      transform: Transform(params.x, params.y),

      // 速度组件（独立于 projectile.speed）
      velocity: Velocity(params.velocityX || 0, params.velocityY || 0),

      sprite: Sprite.create('particle_1', {
        scale: params.radius / 16, // particle_1.png 大小约为 32px
        tint: params.color
      }),

      // 战斗属性（仅伤害相关）
      projectile: Projectile({
        damage: params.damage
      }),

      // 射线检测属性 (CCD)
      detectProjectile: DetectProjectile({
        target: ['enemy', 'obstacle', 'player'], // 默认目标
        prevPosition: { x: params.x, y: params.y } // 初始上一帧位置等于当前位置
      }),
      
      // 生命周期管理
      lifeTime: LifeTime(params.maxLifeTime, true),

      // 添加 Trigger 支持动作分发（例如子弹命中后产生特殊效果）
      trigger: Trigger({
        rules: [{ type: 'onEnter' }], // 当 detectProjectile 产生结果时触发
        actions: [] // 预留
      })
    })

    // 2. 创建子实体 (Body Part) 负责物理探测
    const body = world.add({
      parent: Parent(root),
      transform: Transform(),
      localTransform: LocalTransform(0, 0),
      name: `Bullet_Body`,
      // 物理碰撞体 (作为触发器，不阻挡物体)
      shape: Shape({
        type: ShapeType.CIRCLE,
        radius: params.radius
      }),
      collider: Collider.create({
        shapeId: 'body',
        isTrigger: true, // 子弹是触发器
        isStatic: false
      })
    });

    root.children = Children([body]);
    
    // 编辑器支持
    root.inspector = Inspector.create({
      fields: [
        ...TRANSFORM_INSPECTOR_FIELDS,
        ...VELOCITY_INSPECTOR_FIELDS,
        ...COLLIDER_INSPECTOR_FIELDS,
        { path: 'projectile.damage', label: 'Damage', type: 'number' },
        { path: 'projectile.speed', label: 'Speed', type: 'number' },
        { path: 'projectile.maxLifeTime', label: 'Life Time', type: 'number' },
        ...LIFETIME_INSPECTOR_FIELDS,
        { path: 'sprite.tint', label: 'Color', type: 'color' }
      ]
    })
    
    // 添加到世界中
    return root
  }
}
