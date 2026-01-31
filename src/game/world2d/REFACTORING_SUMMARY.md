# World2D 统一接口重构总结

## 重构目标

解决 world2d 系统与外部接口散乱的问题，通过创建统一的 Facade 接口层实现：
- ✅ 清晰的内外边界
- ✅ 隐藏内部实现细节（ECS、Systems、Entities）
- ✅ 统一的 API 和数据格式
- ✅ 渐进式迁移路径

## 架构改进

### 重构前（散乱）

```
外部组件 (Vue, Stores)
    ↓ 直接导入各种内部模块
    ├─ GameManager
    ├─ world (ECS)
    ├─ ScenarioLoader
    ├─ entityTemplateRegistry
    ├─ getSystem
    └─ 各种 Component 定义

问题：
❌ 接口散乱，边界不清
❌ 内部实现暴露给外部
❌ 难以维护和重构
❌ 外部需要了解内部细节
```

### 重构后（统一）

```
外部组件 (Vue, Stores)
    ↓ 只通过统一接口
┌─────────────────────────┐
│   World2DFacade         │ ← 唯一接入口
│  ─────────────────────  │
│  • 生命周期管理          │
│  • 场景管理              │
│  • 状态查询              │
│  • 命令执行              │
│  • 回调注册              │
└─────────────────────────┘
    ↓ 内部隔离
┌─────────────────────────┐
│   World2D 内部系统       │
│  ─────────────────────  │
│  • GameManager          │
│  • ECS World            │
│  • Systems              │
│  • Entities             │
└─────────────────────────┘

优势：
✅ 单一入口，接口清晰
✅ 内部实现完全隔离
✅ 易于维护和测试
✅ 外部无需了解内部细节
```

## 新增文件

### 1. `World2DFacade.js` - 统一接口实现

**核心职责：**
- 封装 GameManager 的所有功能
- 提供语义化的 API 方法
- 转换内部数据为 DTO 格式
- 管理内外部回调注册

**主要 API 分类：**
```javascript
// 生命周期
world2d.init(canvas)
world2d.startWorldMap()
world2d.startBattle()
world2d.pause() / resume()
world2d.destroy()

// 场景管理
world2d.loadMap(mapId, entryId)
world2d.getCurrentSceneInfo()
world2d.serializeCurrentScene()
world2d.exportCurrentScene()

// 状态查询
world2d.getSystemState()
world2d.getPlayerPosition()
world2d.getDebugInfo()
world2d.getSceneEntities()

// 命令执行
world2d.spawnEntity(templateId, options)
world2d.removeEntity(entityId)
world2d.toggleEditMode()

// 回调注册
world2d.registerCallbacks({ onEncounter, onInteract, ... })
```

**兼容性访问器（渐进迁移）：**
```javascript
// Vue 响应式引用
world2d.currentScene
world2d.state
world2d.engine
world2d.editor

// 编辑器/调试特殊场景
world2d.getWorld()
world2d.getEntityTemplateRegistry()
world2d.getScenarioLoader()
```

### 2. `index.js` - 统一导出入口

**职责：**
- 主导出：world2d 实例（默认导出）
- 兼容性导出：gameManager, world, ScenarioLoader 等（带 @deprecated 标记）
- 清晰的迁移路径说明

## 已迁移文件清单

### ✅ 控制器层 (1 个文件)
- `src/game/interface/WorldMapController.js`
  - 使用 `world2d.getDebugInfo()` 替代直接访问 world
  - 使用 `world2d.startWorldMap()` 替代 gameManager

### ✅ 数据层 (2 个文件)
- `src/stores/world2d.js`
  - 使用 `world2d.exportCurrentScene()` 替代 ScenarioLoader
- `src/stores/battle.js`
  - 统一从 @world2d 导入（保留 world 用于 ECS 操作）

### ✅ UI 组件层 (3 个文件)
- `src/interface/pages/GameUI.vue`
  - 替换所有 gameManager 为 world2d
  - 使用 `world2d.exportCurrentScene()` 导出场景
  - 编辑器上下文菜单使用兼容接口获取 world 和 registry
  
- `src/interface/dev/CommandConsole.vue`
  - 统一使用 world2d API
  - 保留 world 用于命令行直接操作（特殊场景）
  
- `src/interface/pages/systems/DevToolsSystem.vue`
  - 替换所有 gameManager 为 world2d
  - 使用 `world2d.exportCurrentScene()` 简化导出逻辑

### ✅ 编辑器面板 (3 个文件)
- `src/interface/editor/panels/HierarchyPanel.vue`
  - 使用 `world2d.getWorld()` 获取 ECS（编辑器特殊场景）
  - 使用 `world2d.exportCurrentScene()` 导出场景
  
- `src/interface/editor/panels/InspectorPanel.vue`
  - 使用 `world2d.getWorld()` 操作实体
  
- `src/interface/editor/panels/SceneSwitcherPanel.vue`
  - 使用 `world2d.loadMap()` 切换地图
  - 使用 `world2d.getScenarioLoader()` 处理项目级导入导出

### ✅ 编辑器服务 (1 个文件)
- `src/game/editor/services/EntitySpawner.js`
  - 使用 `world2d.getWorld()` 和 `world2d.getEntityTemplateRegistry()`

## 迁移模式总结

### 模式 1: 简单替换（大部分文件）

```javascript
// 旧代码
import { gameManager } from '@world2d/GameManager'
gameManager.init(canvas)
gameManager.state.system

// 新代码
import { world2d } from '@world2d'
world2d.init(canvas)
world2d.state.system
```

### 模式 2: 使用新 API（推荐）

```javascript
// 旧代码
const mapId = gameManager.currentScene.value?.mapData?.id || 'unknown'
const bundle = ScenarioLoader.exportScene(gameManager.engine, mapId)

// 新代码
const bundle = world2d.exportCurrentScene()
```

### 模式 3: 编辑器特殊场景

```javascript
// 旧代码
import { world } from '@world2d/world'
import { entityTemplateRegistry } from '@world2d/entities/internal/EntityTemplateRegistry'

// 新代码
import { world2d } from '@world2d'
const world = world2d.getWorld()
const entityTemplateRegistry = world2d.getEntityTemplateRegistry()
```

## 未迁移的文件

### World2D 内部文件（不需要迁移）
所有 `src/game/world2d/` 下的内部文件（systems, entities, resources 等）保持不变，它们内部可以继续直接导入。

### Schema 定义（不需要迁移）
- `src/schemas/registry.js` - 数据定义层，从 world2d 导入 Schema 是合理的

## 兼容性策略

### 第一阶段：创建 Facade + 兼容性导出（✅ 当前）
- 新增 World2DFacade
- 保留所有旧的导出（带 @deprecated 标记）
- 逐步迁移外部文件

### 第二阶段：完全迁移（计划中）
- 迁移所有外部组件使用 world2d 实例
- 更新文档和示例

### 第三阶段：移除兼容性（未来）
- 移除 @deprecated 导出
- 只保留 world2d 实例接口
- 完全隔离内部实现

## 代码质量改进

### 1. 更清晰的职责划分
```
✅ 外部组件：只关心"做什么"，不关心"怎么做"
✅ World2D：封装所有"怎么做"的细节
✅ 内部系统：专注于具体实现
```

### 2. 更好的可测试性
```javascript
// 可以轻松 mock world2d 接口
const mockWorld2d = {
  init: vi.fn(),
  getPlayerPosition: vi.fn(() => ({ x: 100, y: 200 })),
  // ...
}
```

### 3. 更易于重构
```
内部实现变更（如替换 ECS 库）不会影响外部代码
只需要保持 Facade API 不变即可
```

### 4. 更好的类型安全
```javascript
// Facade 方法都有明确的参数和返回值类型
// 返回的是 DTO 对象，而不是内部 Entity
{
  playerX: number,
  playerY: number,
  // ...
}
```

## 性能影响

✅ **几乎无性能影响**
- Facade 只是简单的方法转发
- 无额外的数据转换开销（除非需要 DTO）
- 响应式引用直接透传

## 向后兼容性

✅ **完全向后兼容**
- 保留所有旧的导出
- 现有代码不会立即失效
- 可以渐进式迁移

## 文档更新

- ✅ `MIGRATION_GUIDE.md` - 详细的迁移指南
- ✅ `REFACTORING_SUMMARY.md` - 本文档
- 📝 TODO: API 文档（JSDoc 注释已添加）
- 📝 TODO: 单元测试

## 后续工作

### 短期（v1.1）
- [ ] 迁移剩余的外部组件（如果有）
- [ ] 添加单元测试覆盖
- [ ] 完善 JSDoc 文档
- [ ] 添加 TypeScript 类型定义（可选）

### 中期（v1.5）
- [ ] 收集使用反馈
- [ ] 优化 API 设计
- [ ] 添加事件系统（替代部分回调）

### 长期（v2.0）
- [ ] 移除所有 @deprecated 导出
- [ ] 完全隔离内部实现
- [ ] 考虑将 Facade 改为 TypeScript

## 总结

这次重构成功地解决了 world2d 系统接口散乱的问题：

✅ **架构改进**：从散乱的直接导入变成统一的 Facade 接口
✅ **代码质量**：更清晰的职责、更好的封装、更易于测试
✅ **平滑迁移**：兼容性导出确保现有代码继续工作
✅ **未来可扩展**：为进一步的重构和优化打下基础

**重构影响范围：**
- 新增文件：2 个（Facade + index）
- 迁移文件：10 个（控制器、stores、组件、面板、服务）
- 内部文件：0 个改动（完全向后兼容）

**代码行数变化：**
- 新增：~400 行（Facade 实现）
- 简化：~50 行（使用新 API 简化了复杂逻辑）
- 净增加：~350 行（合理的封装开销）
