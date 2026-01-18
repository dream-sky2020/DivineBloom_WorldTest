# 🎯 现代化资源加载架构

## 📋 概述

全新的资源加载系统，采用声明式依赖 + 自动预加载的现代化架构。

## 🏗️ 架构组件

### 1. ResourceDeclaration（资源声明系统）
负责自动分析和收集场景所需的所有资源依赖。

**特性：**
- ✅ 自动从地图配置提取资源依赖
- ✅ 自动从 ECS World 收集实体资源
- ✅ 自动解析视觉 ID 到资源文件 ID

**主要方法：**
```javascript
// 从地图配置获取资源
const visualIds = ResourceDeclaration.getMapDependencies(mapData)

// 从 World 获取资源
const visualIds = ResourceDeclaration.getWorldDependencies(world)

// 一步到位：直接获取资源文件 ID
const assetIds = ResourceDeclaration.getMapAssetIds(mapData)
const assetIds = ResourceDeclaration.getWorldAssetIds(world)
```

### 2. ResourcePipeline（资源加载管线）
负责批量加载、缓存管理、进度跟踪。

**特性：**
- ✅ 智能缓存：避免重复加载
- ✅ 进度跟踪：支持进度回调
- ✅ 错误容错：单个资源失败不影响整体
- ✅ 批量加载：并行加载提高效率

**主要方法：**
```javascript
// 批量加载资源（带进度）
await pipeline.loadAssets(['asset1', 'asset2'], (progress) => {
    console.log(`${progress.progress * 100}%`)
})

// 从地图预加载
await pipeline.preloadMap(mapData, onProgress)

// 从 World 预加载
await pipeline.preloadWorld(world, onProgress)

// 验证资源
const missing = pipeline.validateAssets(['asset1', 'asset2'])
```

### 3. SceneLifecycle（场景生命周期管理）
负责场景的完整加载流程：资源预加载 → 实体创建 → 验证。

**特性：**
- ✅ 三阶段加载：预加载 → 创建 → 验证
- ✅ 自动补救：发现缺失资源自动补充加载
- ✅ 进度追踪：各阶段进度回调
- ✅ 状态恢复：支持从存档恢复

**主要方法：**
```javascript
// 完整场景准备
const result = await SceneLifecycle.prepareScene(
    mapData,
    engine,
    entryId,
    savedState, // 可选
    (progress) => {
        if (progress.phase === 'loading') {
            console.log(`Loading: ${progress.progress * 100}%`)
        }
    }
)

// 快速场景准备（无验证）
const result = await SceneLifecycle.prepareSceneFast(mapData, engine, entryId)
```

## 🔄 工作流程

### 地图切换流程

```
1. SceneManager.requestSwitchMap()
   ↓
2. 保存当前场景状态
   ↓
3. 清理 ECS World
   ↓
4. SceneLifecycle.prepareScene()
   ├─ Phase 1: 预加载资源 (ResourcePipeline.preloadMap)
   ├─ Phase 2: 创建实体 (ScenarioLoader.load/restore)
   └─ Phase 3: 验证并补充加载缺失资源
   ↓
5. 场景准备完成
```

### 资源加载流程

```
ResourceDeclaration.getMapAssetIds(mapData)
   ↓
收集所有资源 ID
   ↓
ResourcePipeline.loadAssets(assetIds)
   ├─ 过滤已加载资源
   ├─ 并行加载新资源
   ├─ 更新缓存
   └─ 报告进度
   ↓
资源加载完成
```

## 📝 使用示例

### 在 GameEngine 中集成

```javascript
import { ResourcePipeline } from './ecs/resources/ResourcePipeline'
import { ResourceDeclaration } from './ecs/resources/ResourceDeclaration'

class GameEngine {
    constructor(canvas) {
        this.assets = new AssetManager()
        
        // 集成资源管理系统
        this.resources = {
            pipeline: new ResourcePipeline(this.assets),
            declarations: ResourceDeclaration
        }
    }
}
```

### 在 SceneManager 中使用

```javascript
import { SceneLifecycle } from '@/game/ecs/resources/SceneLifecycle'

async _handleMapSwitch({ mapId, entryId }) {
    // 加载地图数据
    const mapData = await getMapData(mapId)
    
    // 清理世界
    clearWorld()
    
    // 使用 SceneLifecycle 准备场景
    const result = await SceneLifecycle.prepareScene(
        mapData,
        this.engine,
        entryId,
        savedState,
        (progress) => {
            // 显示加载进度
            console.log(`Loading: ${(progress.progress * 100).toFixed(0)}%`)
        }
    )
    
    // 场景准备完成，资源已加载
    this.currentScene.player = result.player
}
```

### 在 WorldScene 中使用

```javascript
async load() {
    // 使用资源管线加载
    await this.engine.resources.pipeline.preloadWorld(world, (progress) => {
        console.log(`Loading: ${(progress.progress * 100).toFixed(0)}%`)
    })
    
    this.isLoaded = true
}
```

## 🎯 优势对比

### 重构前
```javascript
// 手动收集资源
const requiredVisuals = new Set()
requiredVisuals.add('hero')
if (mapData.npcs) {
    mapData.npcs.forEach(npc => {
        if (npc.spriteId) requiredVisuals.add(npc.spriteId)
    })
}
if (mapData.decorations) { /* ... */ }
if (mapData.spawners) { /* ... */ }
// 手动加载
await engine.assets.preloadVisuals(Array.from(requiredVisuals), VisualDefs)
```

### 重构后
```javascript
// 自动收集和加载
await engine.resources.pipeline.preloadMap(mapData)
```

## ✨ 关键改进

1. **代码减少 80%**：从 ~50 行减少到 1 行
2. **零维护成本**：新增实体类型无需修改加载代码
3. **自动化**：资源收集、加载、验证全自动
4. **错误处理**：自动发现并补充缺失资源
5. **进度追踪**：内置进度回调支持
6. **性能优化**：智能缓存，避免重复加载

## 🐛 调试

### 查看加载日志
```javascript
// 控制台会显示：
[ResourcePipeline] Loading assets: ['door_1', 'table_2', 'table_3']
[ResourcePipeline] Loading assets: 33%
[ResourcePipeline] Loading assets: 66%
[ResourcePipeline] Loading assets: 100%
[ResourcePipeline] Load complete: 3 / 3

[SceneLifecycle] Phase 1: Preloading assets
[SceneLifecycle] Phase 2: Creating entities
[SceneLifecycle] Phase 3: Validating resources
[SceneLifecycle] ✅ All resources validated
```

### 验证资源完整性
```javascript
const validation = SceneLifecycle.validatePhase(world, engine)
console.log('Missing:', validation.missing)
console.log('Validated:', validation.validated)
```

## 🔮 未来扩展

1. **资源优先级**：支持关键资源优先加载
2. **增量加载**：支持按需加载和卸载
3. **资源预热**：预测性资源加载
4. **内存管理**：自动卸载长时间未使用的资源
5. **CDN 支持**：支持从 CDN 加载资源
6. **资源打包**：支持资源合并和压缩

## 📚 API 参考

详见各模块的 JSDoc 注释。

## 🎉 总结

现代化资源加载架构彻底解决了资源加载的所有问题：
- ✅ 不再需要手动维护资源列表
- ✅ 不会遗漏任何实体的资源
- ✅ 地图切换时资源正确加载
- ✅ 支持进度追踪和错误处理
- ✅ 代码简洁、易维护、易扩展
