# 组件 API 迁移指南

## 概述

我们将 `Physics.js` 拆分为三个独立的组件：`Velocity`、`Collider`、`Bounds`，以符合 ECS 的单一职责原则。

## 为什么要拆分？

✅ **符合 ECS 理念**：每个组件只负责一个功能  
✅ **更好的独立性**：速度组件不依赖物理系统  
✅ **更灵活的组合**：可以只使用速度而不需要碰撞体  
✅ **更清晰的语义**：`Velocity()` 比 `Physics.Velocity()` 更直观

## 迁移对照表

### 旧代码 → 新代码

| 旧 API (仍可用) | 新 API (推荐) | 说明 |
|----------------|--------------|------|
| `Physics.Velocity()` | `Velocity()` | 直接调用，更简洁 |
| `Physics.Circle(15)` | `Collider.circle(15)` | 语义更清晰 |
| `Physics.Box(30, 30)` | `Collider.box(30, 30)` | 语义更清晰 |
| `Physics.Collider({...})` | `Collider.create({...})` | 自定义碰撞体 |
| `Physics.Bounds()` | `Bounds()` | 直接调用，更简洁 |

## 实际迁移示例

### PlayerEntity 迁移

```javascript
// ❌ 旧代码（仍可用，但不推荐）
import { Physics } from '@components'

const entity = {
  velocity: Physics.Velocity(),
  collider: Physics.Circle(12),
  bounds: Physics.Bounds()
}

// ✅ 新代码（推荐）
import { Velocity, Collider, Bounds } from '@components'

const entity = {
  velocity: Velocity(),              // 更简洁！
  collider: Collider.circle(12),     // 更清晰！
  bounds: Bounds()                   // 更简洁！
}

// ✅ 也可以混合使用（逐步迁移）
import { Velocity, Physics } from '@components'

const entity = {
  velocity: Velocity(),              // 已迁移
  collider: Physics.Circle(12),      // 旧代码，以后再改
  bounds: Physics.Bounds()           // 旧代码，以后再改
}
```

### BulletEntity 添加速度组件

```javascript
// 💡 子弹实体现在可以添加独立的速度组件了
import { Velocity, Collider, Sprite } from '@components'

const entity = {
  position: { x: 0, y: 0 },
  velocity: Velocity(500, 0),        // 添加速度！
  collider: Collider.circle(2),      // 小型碰撞体
  sprite: Sprite.create('bullet_dot')
}
```

### EnemyEntity 迁移

```javascript
// ❌ 旧代码
import { Physics, AI } from '@components'

const entity = {
  velocity: Physics.Velocity(),
  collider: Physics.Circle(15),
  bounds: Physics.Bounds(),
  aiConfig: AI.Config(...)
}

// ✅ 新代码
import { Velocity, Collider, Bounds, AI } from '@components'

const entity = {
  velocity: Velocity(),
  collider: Collider.circle(15),
  bounds: Bounds(),
  aiConfig: AI.Config(...)
}
```

## 详细用法

### Velocity 组件

```javascript
// 默认速度 (0, 0)
velocity: Velocity()

// 指定速度
velocity: Velocity(100, 50)  // x=100, y=50

// 独立使用（无需碰撞体）
const bullet = {
  position: { x: 0, y: 0 },
  velocity: Velocity(300, 0),  // 只有速度，没有碰撞
  sprite: Sprite.create('effect')
}
```

### Collider 组件

```javascript
// 圆形碰撞体
collider: Collider.circle(15)
collider: Collider.circle(15, true)  // 静态碰撞体

// 矩形碰撞体
collider: Collider.box(30, 40)
collider: Collider.box(30, 40, true)  // 静态碰撞体

// 自定义碰撞体
collider: Collider.create({
  type: ShapeType.CIRCLE,
  radius: 15,
  isTrigger: true,    // 触发器
  isStatic: false,
  layer: 1
})

// 胶囊体
collider: Collider.capsule(
  { x: 0, y: -10 },  // p1
  { x: 0, y: 10 },   // p2
  5                   // radius
)
```

### Bounds 组件

```javascript
// 默认边界 (0-9999, 0-9999)
bounds: Bounds()

// 自定义边界
bounds: Bounds(0, 1920, 0, 1080)

// 只限制某些方向
bounds: Bounds(100, 1820, 0, 9999)  // 只限制 X 轴
```

## 向后兼容性

✅ **完全兼容**：旧代码无需修改即可继续工作  
✅ **逐步迁移**：可以慢慢将旧代码迁移到新 API  
✅ **混合使用**：新旧代码可以共存

```javascript
// 混合使用示例（完全有效）
import { Velocity, Physics } from '@components'

const entity = {
  velocity: Velocity(),           // 新 API
  collider: Physics.Circle(12),   // 旧 API
  bounds: Physics.Bounds()        // 旧 API
}
```

## 迁移建议

### 优先级

1. **高优先级**：新实体直接使用新 API
2. **中优先级**：频繁修改的旧实体逐步迁移
3. **低优先级**：稳定的旧实体保持原样

### 迁移步骤

1. ✅ 在新文件中使用新 API
2. ✅ 修改现有文件时顺便迁移
3. ✅ 不需要一次性全部迁移

### 特殊情况

#### 只需要速度，不需要碰撞
```javascript
// 粒子效果、视觉特效等
const particle = {
  position: { x: 0, y: 0 },
  velocity: Velocity(200, -100),  // 只有速度！
  sprite: Sprite.create('particle_1')
}
```

#### 只需要碰撞，不需要速度
```javascript
// 静态障碍物
const wall = {
  position: { x: 100, y: 100 },
  collider: Collider.box(50, 200, true),  // 只有碰撞！
  sprite: Sprite.create('wall')
}
```

#### 三者都需要
```javascript
// 移动的角色
const player = {
  position: { x: 0, y: 0 },
  velocity: Velocity(),
  collider: Collider.circle(12),
  bounds: Bounds(0, 1920, 0, 1080)
}
```

## FAQ

### Q: 必须立即迁移吗？
A: **不需要**。旧 API 会一直保留以实现向后兼容。

### Q: 新旧 API 可以混用吗？
A: **可以**。同一个文件中可以混合使用新旧 API。

### Q: 性能有区别吗？
A: **没有**。新旧 API 底层完全相同，只是调用方式不同。

### Q: 什么时候应该迁移？
A: **方便的时候**。在修改文件时顺便迁移是最好的时机。

### Q: 为什么 Velocity 和 Bounds 是函数，而 Collider 是对象？
A: 因为：
- `Velocity()` 和 `Bounds()` 通常使用默认值，直接调用更简洁
- `Collider` 有多种创建方式（circle/box/capsule），使用对象方法更清晰

## 总结

✅ **新代码更简洁**：`Velocity()` vs `Physics.Velocity()`  
✅ **语义更清晰**：`Collider.circle()` vs `Physics.Circle()`  
✅ **更好的独立性**：速度不依赖物理系统  
✅ **完全向后兼容**：旧代码继续工作  
✅ **灵活组合**：按需使用组件

推荐在新代码中使用新 API，旧代码可以保持原样或逐步迁移。
