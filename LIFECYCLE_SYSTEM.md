# 生命周期系统实现文档

## 📋 概述

实现了一个通用的实体生命周期管理系统，用于自动删除生命周期结束的临时实体（如子弹、粒子特效等）。

## 🏗️ 架构设计

### 数据流

```
实体创建 (带 LifeTime 组件)
    ↓
LifeTimeSystem (每帧倒计时)
    ↓
currentTime <= 0 && autoRemove = true
    ↓
发送 DELETE_ENTITY 命令到全局命令队列
    ↓
ExecuteSystem 处理删除命令
    ↓
world.remove(entity)
```

### 系统执行顺序

```
1. sense        (感知阶段)
2. intent       (意图阶段)
3. decision     (决策阶段)
4. control      (控制阶段) ← WeaponSystem 生成子弹
5. physics      (物理阶段) ← MovementSystem, CollisionSystem
6. lifecycle    (生命周期阶段) ← LifeTimeSystem ⭐ 新增
7. execution    (执行阶段) ← ExecuteSystem 处理删除命令
```

## 📁 文件清单

### 新增文件

1. **组件**
   - `src/game/world2d/definitions/components/LifeTime.js`

2. **系统**
   - `src/game/world2d/systems/lifecycle/LifeTimeSystem.js`

### 修改文件

1. **组件导出**
   - `src/game/world2d/definitions/components/index.js`

2. **实体定义**
   - `src/game/world2d/definitions/entities/BulletEntity.js`

3. **系统注册**
   - `src/game/world2d/SystemRegistry.js`

4. **场景管理**
   - `src/game/world2d/WorldScene.js`

## ⚙️ 组件详解

### LifeTime 组件

```javascript
{
  maxTime: 3,         // 最大生命时间（秒）
  currentTime: 3,     // 当前剩余时间（秒，运行时递减）
  autoRemove: true    // 时间耗尽时是否自动删除
}
```

**使用示例：**

```javascript
import { LifeTime } from '@components'

// 创建一个 3 秒后自动删除的实体
const entity = {
  position: { x: 100, y: 100 },
  lifeTime: LifeTime(3)        // 3秒后删除
}

// 创建一个 5 秒倒计时但不自动删除的实体
const entity2 = {
  position: { x: 200, y: 200 },
  lifeTime: LifeTime(5, false)  // 倒计时但不删除
}
```

## 🔧 系统详解

### LifeTimeSystem

**职责：**
1. 每帧减少 `lifeTime.currentTime`
2. 当 `currentTime <= 0` 且 `autoRemove = true` 时，发送删除命令

**特点：**
- ✅ 使用命令模式，统一由 ExecuteSystem 处理删除
- ✅ 有降级方案（如果全局命令队列不存在，直接删除）
- ✅ 带调试日志，便于追踪实体删除

**代码片段：**

```javascript
// 倒计时
lifeTime.currentTime -= dt

// 检查是否需要删除
if (lifeTime.currentTime <= 0 && lifeTime.autoRemove) {
  // 发送删除命令
  globalEntity.commands.queue.push({
    type: 'DELETE_ENTITY',
    payload: { entity }
  })
}
```

## 🎮 使用场景

### 1. 子弹实体（已集成）

```javascript
// BulletEntity.js
const entity = {
  type: 'bullet',
  position: { x, y },
  velocity: Velocity(vx, vy),
  projectile: Projectile({ damage: 10, ... }),
  lifeTime: LifeTime(3),  // 3秒后自动删除 ✅
  // ...
}
```

### 2. 粒子特效（可扩展）

```javascript
const particle = {
  type: 'particle',
  position: { x, y },
  sprite: Sprite.create('particle_1'),
  lifeTime: LifeTime(1.5),  // 1.5秒后消失
  // ...
}
```

### 3. 临时视觉效果（可扩展）

```javascript
const vfx = {
  type: 'vfx',
  position: { x, y },
  animation: Animation({ ... }),
  lifeTime: LifeTime(2),  // 2秒后删除
  // ...
}
```

## 🎯 高级功能（待扩展）

### 1. 生命周期事件回调

```javascript
lifeTime: LifeTime(3, true, {
  onExpire: (entity) => {
    // 生命周期结束时触发（如播放爆炸特效）
    createExplosion(entity.position)
  }
})
```

### 2. 条件删除

```javascript
lifeTime: LifeTime(10, true, {
  removeCondition: (entity) => {
    // 自定义删除条件
    return entity.health.current <= 0 || outOfBounds(entity)
  }
})
```

### 3. 生命周期百分比

```javascript
const progress = entity.lifeTime.currentTime / entity.lifeTime.maxTime
// 可用于淡出动画、渐变效果等
entity.sprite.alpha = progress
```

## 🐛 调试

### 查看生命周期日志

LifeTimeSystem 会在删除实体时输出调试日志：

```
GAME:LifeTimeSystem:debug Requested removal for entity: bullet
  type: "bullet"
  remainingTime: -0.016
```

### 检查实体状态

在浏览器控制台：

```javascript
// 查看所有带生命周期的实体
const lifeTimeEntities = Array.from(world).filter(e => e.lifeTime)
console.table(lifeTimeEntities.map(e => ({
  type: e.type,
  maxTime: e.lifeTime.maxTime,
  currentTime: e.lifeTime.currentTime.toFixed(2),
  autoRemove: e.lifeTime.autoRemove
})))
```

## 📊 性能优化

### 批量处理

LifeTimeSystem 使用 `world.with('lifeTime')` 查询，自动批量处理所有需要倒计时的实体：

```javascript
const lifeTimeEntities = world.with('lifeTime')
// 只遍历有生命周期的实体，性能高效
```

### 命令队列合并

所有删除请求统一进入命令队列，由 ExecuteSystem 集中处理，避免多次遍历世界实体。

## ✅ 测试清单

- [x] 子弹在 3 秒后自动删除
- [x] 删除命令正确发送到 ExecuteSystem
- [x] 实体从 HierarchyPanel 中消失
- [x] 实体从渲染中移除
- [x] 日志正确输出实体信息
- [ ] 多个实体同时删除（压力测试）
- [ ] 生命周期回调功能（待实现）

## 🎉 完成

生命周期系统已完全集成到 ECS 架构中！

- **组件化设计**：LifeTime 组件可复用
- **命令模式**：统一由 ExecuteSystem 处理删除
- **易于扩展**：可添加回调、条件删除等功能
- **性能优良**：批量处理，查询高效

现在按下 **J 键** 射击，子弹会在 3 秒后自动消失！🎯
