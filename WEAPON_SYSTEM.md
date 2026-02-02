# 武器系统实现文档

## 📋 概述

基于 ECS 架构，采用**方案 1 + 方案 2 结合**的设计：
- **Weapon 组件**：存储武器数据（伤害、射速、冷却等）
- **WeaponIntent 组件**：存储射击意图（是否开火、瞄准方向）
- **WeaponSystem**：处理武器逻辑（冷却、生成子弹）
- **PlayerIntentSystem**：捕获输入并转换为射击意图

## 🏗️ 架构设计

### 数据流

```
输入设备 (J键)
    ↓
InputSenseSystem (rawInput.buttons.attack = true)
    ↓
PlayerIntentSystem (weaponIntent.wantsToFire = true)
    ↓
WeaponSystem (检查冷却 → 生成子弹)
    ↓
BulletEntity (velocity 组件驱动移动)
```

### 系统执行顺序

```
1. InputSenseSystem      (sense 阶段)
2. PlayerIntentSystem    (intent 阶段)
3. PlayerControlSystem   (control 阶段)
4. WeaponSystem         (control 阶段) ← 新增
5. MovementSystem       (physics 阶段)
6. CollisionSystem      (physics 阶段)
```

## 📁 文件清单

### 新增文件

1. **组件**
   - `src/game/world2d/definitions/components/Weapon.js`
   - `src/game/world2d/definitions/components/WeaponIntent.js`

2. **系统**
   - `src/game/world2d/systems/control/WeaponSystem.js`

### 修改文件

1. **组件导出**
   - `src/game/world2d/definitions/components/index.js`

2. **实体定义**
   - `src/game/world2d/definitions/entities/PlayerEntity.js`
   - `src/game/world2d/definitions/entities/BulletEntity.js` (已添加 velocity 组件)

3. **系统**
   - `src/game/world2d/systems/intent/PlayerIntentSystem.js`
   - `src/game/world2d/systems/sense/InputSenseSystem.js`

4. **注册**
   - `src/game/world2d/SystemRegistry.js`
   - `src/game/world2d/WorldScene.js`

## 🎮 使用方法

### 1. 为实体添加武器

```javascript
import { Weapon, WeaponIntent } from '@components'

const entity = {
  position: { x: 100, y: 100 },
  
  // 添加武器组件
  weapon: Weapon({
    weaponType: 'pistol',
    damage: 15,
    fireRate: 0.3,          // 每秒 3.33 发
    bulletSpeed: 600,
    bulletColor: '#FF0000',
    bulletRadius: 3
  }),
  
  // 添加武器意图（用于接收射击指令）
  weaponIntent: WeaponIntent()
}
```

### 2. 通过代码控制射击

```javascript
// 手动触发射击
entity.weaponIntent.wantsToFire = true
entity.weaponIntent.aimDirection = { x: 1, y: 0 }  // 向右射击

// 停止射击
entity.weaponIntent.wantsToFire = false
```

### 3. 玩家输入射击

玩家按下 **J 键** 或 **K 键** 即可射击，方向为当前移动方向。

### 4. AI 射击（待实现）

```javascript
// 在 EnemyAIIntentSystem 中添加
if (shouldAttack(entity, target)) {
  entity.weaponIntent.wantsToFire = true
  entity.weaponIntent.aimDirection = calculateDirection(entity, target)
}
```

## ⚙️ 组件详解

### Weapon 组件

```javascript
{
  weaponType: 'pistol',      // 武器类型（字符串标识）
  fireRate: 0.5,             // 射速（秒/发）
  damage: 10,                // 伤害值
  bulletSpeed: 500,          // 子弹速度（像素/秒）
  bulletColor: '#FFFF00',    // 子弹颜色
  bulletRadius: 2,           // 子弹半径
  
  // 运行时状态
  cooldown: 0,               // 当前冷却时间（自动管理）
  isFiring: false,           // 是否正在射击（自动管理）
  fireDirection: { x: 1, y: 0 }  // 射击方向（自动管理）
}
```

### WeaponIntent 组件

```javascript
{
  wantsToFire: false,              // 是否想要开火
  aimDirection: { x: 1, y: 0 },    // 瞄准方向（归一化）
  aimAngle: 0                      // 瞄准角度（弧度，可选）
}
```

## 🔧 配置示例

### 不同武器类型

```javascript
// 手枪：快速、低伤害
weapon: Weapon({
  weaponType: 'pistol',
  damage: 10,
  fireRate: 0.3,
  bulletSpeed: 500,
  bulletColor: '#FFFF00'
})

// 霰弹枪：慢速、高伤害（需要扩展 WeaponSystem 支持多发子弹）
weapon: Weapon({
  weaponType: 'shotgun',
  damage: 5,
  fireRate: 1.0,
  bulletSpeed: 400,
  bulletColor: '#FF8800'
})

// 机关枪：超快、低伤害
weapon: Weapon({
  weaponType: 'machinegun',
  damage: 5,
  fireRate: 0.1,
  bulletSpeed: 600,
  bulletColor: '#FF0000'
})

// 激光枪：极快、中等伤害
weapon: Weapon({
  weaponType: 'laser',
  damage: 15,
  fireRate: 0.2,
  bulletSpeed: 1000,
  bulletColor: '#00FFFF'
})
```

## 🎯 高级功能（待实现）

### 1. 多发散射（霰弹枪）

修改 `WeaponSystem.fireBullet()` 方法：

```javascript
fireBullet(shooter) {
  const { weapon } = shooter
  
  if (weapon.weaponType === 'shotgun') {
    // 发射 5 发子弹，散射角度 ±15°
    for (let i = 0; i < 5; i++) {
      const angle = -15 + (i * 7.5) // -15°, -7.5°, 0°, 7.5°, 15°
      const dir = rotateVector(weapon.fireDirection, angle)
      this.createBullet(shooter, dir)
    }
  } else {
    this.createBullet(shooter, weapon.fireDirection)
  }
}
```

### 2. 瞄准鼠标位置

在 `PlayerIntentSystem` 中：

```javascript
// 使用鼠标位置计算瞄准方向
if (entity.mousePosition && entity.weaponIntent) {
  const dx = entity.mousePosition.x - entity.position.x
  const dy = entity.mousePosition.y - entity.position.y
  const length = Math.sqrt(dx * dx + dy * dy)
  
  if (length > 0) {
    entity.weaponIntent.aimDirection.x = dx / length
    entity.weaponIntent.aimDirection.y = dy / length
  }
}
```

### 3. 弹药系统

扩展 `Weapon` 组件：

```javascript
weapon: Weapon({
  ...config,
  ammoMax: 30,         // 弹匣容量
  ammoCurrent: 30,     // 当前弹药
  reloadTime: 2.0,     // 换弹时间
  isReloading: false   // 是否正在换弹
})
```

### 4. 武器切换

添加武器槽系统：

```javascript
weapons: [
  Weapon({ weaponType: 'pistol', ... }),
  Weapon({ weaponType: 'shotgun', ... })
],
activeWeaponIndex: 0
```

## 🐛 调试

### 查看射击日志

WeaponSystem 已启用调试日志：

```javascript
logger.debug(`Entity ${entity.id} fired! Next shot in ${weapon.fireRate}s`)
```

### 检查组件状态

在浏览器控制台：

```javascript
// 获取玩家实体
const player = world.entities.find(e => e.player)

// 查看武器状态
console.log('Weapon:', player.weapon)
console.log('WeaponIntent:', player.weaponIntent)
console.log('Cooldown:', player.weapon.cooldown)
```

## 📊 性能优化

### 批量处理

WeaponSystem 使用 `world.with()` 查询，自动批量处理所有武器实体：

```javascript
const weaponEntities = world.with('weapon', 'position')
// 只遍历有武器的实体，性能高效
```

### 避免重复创建

子弹通过 `BulletEntity.create()` 创建，使用对象池可以进一步优化：

```javascript
// 未来优化：对象池
const bulletPool = []
function getBullet() {
  return bulletPool.pop() || BulletEntity.create()
}
```

## ✅ 测试清单

- [x] 玩家按 J/K 键可以射击
- [x] 子弹朝移动方向发射
- [x] 射速冷却正常工作
- [x] 子弹有正确的速度
- [x] 子弹颜色可配置
- [ ] AI 可以射击（待实现）
- [ ] 不同武器类型（待实现）
- [ ] 弹药系统（待实现）

## 🎉 完成

武器系统已完全集成到你的 ECS 架构中！

- **组件化设计**：数据与逻辑分离
- **易于扩展**：添加新武器只需配置
- **性能优良**：批量处理，查询高效
- **符合 ECS 理念**：遵循现有架构模式

按下 **J 键** 开始射击吧！🔫
