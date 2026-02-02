# 组件职责分离重构文档

## 📋 概述

重构了 `Projectile` 组件，遵循 ECS 的**单一职责原则**，将不同功能分离到专门的组件中。

## 🔧 重构前的问题

### 旧的 Projectile 组件（❌ 职责不清）

```javascript
{
  damage: 10,              // ✅ 战斗属性
  speed: 500,              // ❌ 应该由 Velocity 组件管理
  maxDistance: 1000,       // ❌ 如果需要，应该单独组件
  traveledDistance: 0,     // ❌ 如果需要，应该单独组件
  maxLifeTime: 5,          // ❌ 应该由 LifeTime 组件管理
  currentLifeTime: 0,      // ❌ 应该由 LifeTime 组件管理
  ownerId: 123,            // ❌ 应该是实体级别的属性
  isPenetrating: false     // ✅ 战斗属性
}
```

**问题：**
- 混合了多种职责（移动、生命周期、战斗）
- 组件臃肿，难以复用
- 违反了 ECS 的组件化原则

## ✅ 重构后的设计

### 职责分离

| 功能 | 负责组件 | 说明 |
|------|----------|------|
| 🎯 **伤害值** | `Projectile` | 战斗相关属性 |
| 🎯 **穿透** | `Projectile` | 战斗相关属性 |
| 🎯 **击退** | `Projectile` | 战斗相关属性 |
| 🎯 **暴击** | `Projectile` | 战斗相关属性 |
| 🚀 **速度** | `Velocity` | 物理运动组件 |
| ⏱️ **生命周期** | `LifeTime` | 生命周期管理组件 |
| 🎯 **碰撞检测** | `DetectProjectile` | 碰撞检测组件 |
| 📏 **距离检测** | *(可选)* 单独组件 | 如果需要按距离删除 |

### 新的 Projectile 组件（✅ 职责清晰）

```javascript
export const ProjectileSchema = z.object({
  damage: z.number().default(10),              // 伤害值
  isPenetrating: z.boolean().default(false),   // 是否穿透
  penetrationCount: z.number().default(0),     // 剩余穿透次数
  knockback: z.number().default(0),            // 击退力度
  criticalChance: z.number().default(0),       // 暴击率
  criticalMultiplier: z.number().default(1.5)  // 暴击倍率
});
```

**优点：**
- ✅ 只关注战斗属性
- ✅ 清晰的职责边界
- ✅ 易于扩展（暴击、穿透等）
- ✅ 符合 ECS 原则

## 🎮 完整的子弹实体结构

```javascript
// BulletEntity
{
  type: 'bullet',
  tags: ['bullet'],
  
  // 位置
  position: { x: 100, y: 100 },
  
  // 速度（由 Velocity 组件管理）
  velocity: Velocity(500, 0),  // vx=500, vy=0
  
  // 生命周期（由 LifeTime 组件管理）
  lifeTime: LifeTime(3),       // 3秒后删除
  
  // 战斗属性（由 Projectile 组件管理）
  projectile: Projectile({
    damage: 15,
    isPenetrating: false
  }),
  
  // 碰撞检测（由 DetectProjectile 组件管理）
  detectProjectile: DetectProjectile({
    target: ['enemy', 'obstacle']
  }),
  
  // 碰撞体（由 Collider 组件管理）
  collider: Collider.circle(2, false),
  
  // 视觉（由 Sprite 组件管理）
  sprite: Sprite.create('particle_1', {
    tint: '#FFFF00'
  })
}
```

## 📊 对比表

| 属性 | 重构前 | 重构后 |
|------|--------|--------|
| **damage** | Projectile ✅ | Projectile ✅ |
| **speed** | Projectile ❌ | Velocity ✅ |
| **maxLifeTime** | Projectile ❌ | LifeTime ✅ |
| **maxDistance** | Projectile ❌ | *(可选组件)* |
| **isPenetrating** | Projectile ✅ | Projectile ✅ |

## 🚀 使用示例

### 创建普通子弹

```javascript
BulletEntity.create({
  x: 100,
  y: 100,
  velocityX: 500,
  velocityY: 0,
  damage: 10,
  maxLifeTime: 3,
  color: '#FFFF00'
})
```

### 创建穿透子弹

```javascript
BulletEntity.create({
  x: 100,
  y: 100,
  velocityX: 600,
  velocityY: 0,
  damage: 15,
  maxLifeTime: 5,
  color: '#00FFFF'
})

// 然后修改 projectile 属性
entity.projectile.isPenetrating = true
entity.projectile.penetrationCount = 3  // 可穿透 3 个敌人
```

### 创建暴击子弹

```javascript
entity.projectile.criticalChance = 0.25      // 25% 暴击率
entity.projectile.criticalMultiplier = 2.0   // 2倍暴击伤害
```

## 🎯 扩展性

现在可以轻松添加新的战斗机制：

### 1. 穿透系统
```javascript
// 在碰撞系统中
if (projectile.isPenetrating && projectile.penetrationCount > 0) {
  projectile.penetrationCount--
  // 继续飞行，不删除子弹
} else {
  // 删除子弹
}
```

### 2. 暴击系统
```javascript
// 在伤害计算中
let finalDamage = projectile.damage
if (Math.random() < projectile.criticalChance) {
  finalDamage *= projectile.criticalMultiplier
  // 显示暴击特效
}
```

### 3. 击退系统
```javascript
// 在碰撞时
if (projectile.knockback > 0) {
  target.velocity.x += direction.x * projectile.knockback
  target.velocity.y += direction.y * projectile.knockback
}
```

## 🔮 未来扩展（可选）

### DistanceTracker 组件（如果需要按距离删除）

```javascript
// 新组件
export const DistanceTrackerSchema = z.object({
  maxDistance: z.number().default(1000),
  traveledDistance: z.number().default(0),
  startPosition: z.object({
    x: z.number(),
    y: z.number()
  })
})

// 新系统
export const DistanceTrackerSystem = {
  update(dt) {
    for (const entity of world.with('distanceTracker', 'position')) {
      const tracker = entity.distanceTracker
      const dx = entity.position.x - tracker.startPosition.x
      const dy = entity.position.y - tracker.startPosition.y
      tracker.traveledDistance = Math.sqrt(dx * dx + dy * dy)
      
      if (tracker.traveledDistance >= tracker.maxDistance) {
        // 发送删除命令
      }
    }
  }
}
```

## ✅ 重构检查清单

- [x] 移除 Projectile 中的 `speed` 属性
- [x] 移除 Projectile 中的 `maxLifeTime` 和 `currentLifeTime`
- [x] 移除 Projectile 中的 `maxDistance` 和 `traveledDistance`
- [x] 添加战斗相关的扩展属性（穿透、暴击等）
- [x] 更新 BulletEntity 使用新的组件结构
- [x] 保持向后兼容性（BulletEntity API 不变）

## 🎉 总结

这次重构实现了：
- ✅ **职责分离**：每个组件只做一件事
- ✅ **可复用性**：组件可以独立使用
- ✅ **可扩展性**：添加新功能更容易
- ✅ **符合 ECS**：遵循组件化原则

现在的系统更加模块化、清晰、易于维护！🎯
