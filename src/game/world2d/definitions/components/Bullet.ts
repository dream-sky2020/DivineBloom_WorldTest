import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const bulletSchema = z.object({
  // 核心战斗属性（来自 Projectile）
  damage: z.number().default(10),                    // 单次命中基础伤害
  isPenetrating: z.boolean().default(false),         // 是否穿透目标（命中后不立即销毁）
  penetrationCount: z.number().default(0),           // 剩余可穿透次数（0=不可穿透）
  knockback: z.number().default(0),                  // 命中后施加的击退强度
  criticalChance: z.number().default(0),             // 暴击概率（0~1）
  criticalMultiplier: z.number().default(1.5),       // 暴击伤害倍率（例如 1.5=150%）

  // 基础弹体属性
  radius: z.number().default(2),                     // 子弹半径（用于体积/碰撞近似）
  speed: z.number().default(0),                      // 当前速度标量（通常由 velocity 推导）
  maxLifeTime: z.number().default(3),                // 最大存活时间（秒）
  ownerId: z.string().nullable().default(null),      // 发射者 ID（用于归属判定/结算）
  teamId: z.string().nullable().default(null),       // 队伍 ID（用于敌我识别）

  // 命中与伤害行为
  canFriendlyFire: z.boolean().default(false),       // 是否允许友军伤害
  destroyOnHit: z.boolean().default(true),           // 命中后是否销毁（穿透弹可设为 false）
  hitInterval: z.number().default(0),                // 同一目标重复受击间隔（秒，0=无间隔）
  armorPenetration: z.number().default(0),           // 护甲穿透值（具体算法由伤害系统决定）
  damageFalloffPerHit: z.number().default(0),        // 每次命中后伤害衰减值
  minDamage: z.number().default(0),                  // 衰减后的最低伤害下限

  // 反弹相关
  isBouncing: z.boolean().default(false),            // 是否启用反弹逻辑
  remainingBounces: z.number().default(0),           // 剩余可反弹次数
  maxBounces: z.number().default(0),                 // 初始/最大反弹次数（可用于重置）
  bounceDamping: z.number().default(1),              // 反弹后速度保留系数（1=不衰减）
  bounceFriction: z.number().default(0),             // 反弹时切向摩擦（越大越容易减速）
  bounceMinSpeed: z.number().default(0),             // 低于该速度时不再反弹
  bounceAngleRandomness: z.number().default(0),      // 反弹角随机扰动强度（0=无随机）
  bounceOnWorldBounds: z.boolean().default(true),    // 是否可在世界边界反弹
  bounceOnStatic: z.boolean().default(true),         // 是否可在静态碰撞体上反弹
  bounceOnDynamic: z.boolean().default(false),       // 是否可在动态碰撞体上反弹

  // 轨迹与运动修正
  gravityScale: z.number().default(0),               // 重力缩放（0=不受重力）
  drag: z.number().default(0),                       // 线性阻力（越大减速越快）
  homingStrength: z.number().default(0),             // 追踪强度（0=不追踪）
  maxMoveDistance: z.number().default(0),            // 最大可移动距离（0=不限制）
  remainingMoveDistance: z.number().default(0),      // 剩余可移动距离（运行时扣减）

  // 爆炸与附加效果
  explodeOnExpire: z.boolean().default(false),       // 生命周期结束时是否触发爆炸
  explosionRadius: z.number().default(0),            // 爆炸影响半径
  explosionDamageScale: z.number().default(1),       // 爆炸伤害系数（相对 damage）
  statusEffectId: z.string().nullable().default(null), // 命中附加的状态效果 ID
  statusEffectChance: z.number().default(0),         // 状态效果触发概率（0~1）
  elementType: z.string().default('physical')        // 伤害元素类型（如 physical/fire/ice）
});

export type BulletData = z.infer<typeof bulletSchema>;

export const Bullet: IComponentDefinition<typeof bulletSchema, BulletData> = {
  name: 'Bullet',
  schema: bulletSchema,
  create(config: Partial<BulletData> = {}) {
    return bulletSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'bullet.damage', label: '伤害', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.radius', label: '半径', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.speed', label: '速度', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.maxMoveDistance', label: '最大移动距离', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.remainingMoveDistance', label: '剩余移动距离', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.maxLifeTime', label: '生命周期', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.isPenetrating', label: '可穿透', type: 'checkbox', group: '子弹 (Bullet)' },
    { path: 'bullet.penetrationCount', label: '剩余穿透次数', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.isBouncing', label: '启用反弹', type: 'checkbox', group: '子弹 (Bullet)' },
    { path: 'bullet.remainingBounces', label: '剩余反弹次数', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.maxBounces', label: '最大反弹次数', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.bounceDamping', label: '反弹衰减', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.bounceFriction', label: '反弹摩擦', type: 'number', group: '子弹 (Bullet)' },
    { path: 'bullet.bounceOnWorldBounds', label: '边界反弹', type: 'checkbox', group: '子弹 (Bullet)' }
  ]
};

export const BulletSchema = bulletSchema;
export const BULLET_INSPECTOR_FIELDS = Bullet.inspectorFields;
