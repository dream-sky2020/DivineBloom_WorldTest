# World2D 统一接口迁移指南

## 概述

为了解决 world2d 系统与外部接口散乱的问题，我们创建了统一的 **World2DFacade** 接口层。所有外部组件现在应该通过这个统一接口与 world2d 交互。

## 设计原则

1. **单一入口**：所有外部组件只从 `@world2d` 导入
2. **隐藏实现**：不暴露 ECS、Systems 等内部细节
3. **清晰 API**：提供语义明确的方法和数据格式
4. **渐进迁移**：保留兼容性导出，支持平滑过渡

## 新旧对比

### ❌ 旧代码（散乱的导入）

```javascript
import { gameManager } from '@world2d/GameManager'
import { world } from '@world2d/world'
import { ScenarioLoader } from '@world2d/ScenarioLoader'
import { entityTemplateRegistry } from '@world2d/entities/internal/EntityTemplateRegistry'
import { getSystem } from '@world2d/SystemRegistry'

// 直接访问内部对象
gameManager.init(canvas)
gameManager.startWorldMap()
const player = gameManager.currentScene.value.player
world.with('player').first
entityTemplateRegistry.get('player').create()
```

### ✅ 新代码（统一接口）

```javascript
import { world2d } from '@world2d'  // 唯一导入

// 使用统一 API
world2d.init(canvas)
world2d.startWorldMap()
const playerPos = world2d.getPlayerPosition()
const debugInfo = world2d.getDebugInfo()
world2d.spawnEntity('player', { x: 100, y: 100 })
```

## 核心 API

### 1. 生命周期管理

```javascript
// 初始化系统
world2d.init(canvasElement)

// 启动世界地图
await world2d.startWorldMap()

// 启动战斗
world2d.startBattle()

// 暂停/恢复
world2d.pause()
world2d.resume()

// 销毁系统
world2d.destroy()
```

### 2. 场景管理

```javascript
// 加载地图
await world2d.loadMap('demo_plains', 'default')

// 获取场景信息
const sceneInfo = world2d.getCurrentSceneInfo()
// => { mapId, mapName, entryId, hasPlayer, isEditMode }

// 序列化场景
const state = world2d.serializeCurrentScene()

// 导出场景（完整 Bundle）
const bundle = world2d.exportCurrentScene()
```

### 3. 状态查询

```javascript
// 获取系统状态
const state = world2d.getSystemState()
// => { system: 'world-map', isPaused: false, isInitialized: true }

// 获取玩家位置
const pos = world2d.getPlayerPosition()
// => { x: 100, y: 200 }

// 获取调试信息
const debug = world2d.getDebugInfo()
// => { playerX, playerY, mouseWorldX, mouseWorldY, lastInput, chasingCount, entityCount, fps }

// 获取场景实体（编辑器用）
const entities = world2d.getSceneEntities()
```

### 4. 命令执行

```javascript
// 生成实体
world2d.spawnEntity('enemy', { x: 200, y: 300, enemyType: 'goblin' })

// 移除实体
world2d.removeEntity(entityId)

// 切换编辑器模式
world2d.toggleEditMode()
```

### 5. 回调注册

```javascript
// 注册外部回调
world2d.registerCallbacks({
  onEncounter: (enemyGroup, enemyUuid) => {
    // 处理遭遇战
  },
  onInteract: (interaction) => {
    // 处理交互
  },
  onSwitchMap: (mapId) => {
    // 处理地图切换
  },
  onOpenMenu: () => {
    // 打开菜单
  },
  onOpenShop: () => {
    // 打开商店
  }
})
```

## 兼容性访问器（渐进迁移）

为了支持平滑迁移，我们保留了一些直接访问器：

```javascript
// ⚠️ 这些是兼容性接口，新代码不应使用

// Vue 响应式引用
world2d.currentScene  // => Ref<WorldScene>
world2d.state         // => { system, isPaused }
world2d.engine        // => GameEngine
world2d.editor        // => EditorState

// 特殊场景（编辑器/调试）
world2d.getWorld()                  // => ECS World
world2d.getEntityTemplateRegistry() // => EntityTemplateRegistry
world2d.getScenarioLoader()         // => ScenarioLoader
```

## 迁移步骤

### 1. 简单替换

大多数文件只需要简单替换导入：

```diff
- import { gameManager } from '@world2d/GameManager'
+ import { world2d } from '@world2d'

- gameManager.init(canvas)
+ world2d.init(canvas)

- gameManager.state.system
+ world2d.state.system
```

### 2. 使用新 API

对于复杂操作，使用新的 API 方法：

```diff
- const mapId = gameManager.currentScene.value?.mapData?.id || 'unknown'
- const bundle = ScenarioLoader.exportScene(gameManager.engine, mapId)
+ const bundle = world2d.exportCurrentScene()
```

### 3. 编辑器特殊场景

编辑器需要深度集成，可以使用兼容接口：

```javascript
import { world2d } from '@world2d'

// 获取内部对象（仅编辑器）
const world = world2d.getWorld()
const entityTemplateRegistry = world2d.getEntityTemplateRegistry()

// 直接操作 ECS（谨慎使用）
for (const entity of world) {
  // ...
}
```

## 已迁移文件列表

### 核心系统
- ✅ `src/game/world2d/World2DFacade.js` - 新增统一接口
- ✅ `src/game/world2d/index.js` - 统一入口

### 控制器
- ✅ `src/game/interface/WorldMapController.js`

### Stores
- ✅ `src/stores/world2d.js`
- ✅ `src/stores/battle.js`

### Vue 组件
- ✅ `src/interface/pages/GameUI.vue`
- ✅ `src/interface/dev/CommandConsole.vue`
- ✅ `src/interface/pages/systems/DevToolsSystem.vue`

### 编辑器面板
- ✅ `src/interface/editor/panels/HierarchyPanel.vue`
- ✅ `src/interface/editor/panels/InspectorPanel.vue`
- ✅ `src/interface/editor/panels/SceneSwitcherPanel.vue`

## 未来计划

### 版本 1.0（当前）
- ✅ 创建 World2DFacade
- ✅ 迁移主要外部组件
- ✅ 保留兼容性导出

### 版本 1.1（下一步）
- [ ] 迁移所有剩余外部组件
- [ ] 完善 API 文档
- [ ] 添加单元测试

### 版本 2.0（未来）
- [ ] 移除所有兼容性导出
- [ ] 完全隔离内部实现
- [ ] 只保留 world2d 实例接口

## 注意事项

1. **不要混用**：在同一个文件中，尽量不要同时使用新旧接口
2. **编辑器例外**：编辑器组件可以使用 `getWorld()` 等兼容接口
3. **逐步迁移**：可以一个文件一个文件地迁移，不必一次性全部改完
4. **保持测试**：每次迁移后确保功能正常

## 常见问题

### Q: 为什么不直接移除旧接口？
A: 为了支持平滑迁移，避免一次性改动太大。兼容性接口会在未来版本中移除。

### Q: 编辑器为什么可以直接访问 ECS？
A: 编辑器需要深度集成，直接操作实体是合理的。但其他业务组件不应该这样做。

### Q: 如何处理复杂的 Store 交互？
A: 使用回调注册机制（`registerCallbacks`），而不是直接导入 world2d 内部对象。

### Q: 性能会有影响吗？
A: Facade 模式只是简单的方法转发，几乎没有性能开销。

## 总结

通过统一接口，我们实现了：
- ✅ 清晰的内外边界
- ✅ 易于维护的代码结构
- ✅ 更好的封装性
- ✅ 平滑的迁移路径

**推荐做法**：新代码只从 `@world2d` 导入，只使用 `world2d` 实例的方法。
