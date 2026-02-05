# 场景定义 + 系统选择（草案）

本目录用于存放 **场景定义**。场景定义负责：
- 描述场景的元信息与实体数据
- 指定该场景使用哪些系统（可动态选择系统组合）
- 约定序列化/反序列化流程

## 字段草案

- `id`: 场景唯一标识
- `name`: 场景显示名
- `version`: 场景版本（用于迁移）
- `systems`: 系统编排（按阶段划分）
  - `core`: 核心系统列表
  - `logic`: 逻辑阶段系统列表
  - `render`: 渲染系统列表
  - `editor`: 编辑器系统列表（可选）
- `bundle`: 标准场景数据包
  - `header`: 版本 + 场景配置
  - `entities`: 实体序列化数据数组
- `onBeforeLoad/onAfterLoad`: 场景加载前后钩子
- `onBeforeSerialize/onAfterSerialize`: 序列化钩子

## 接口草案

参见 `definitions/interface/IScene.ts`：
- `SceneSystemGraph`
- `SceneBundle`
- `IScene`

## 流程图（ASCII）

```
          ┌─────────────────────────┐
          │      SceneDefinition    │
          │   (id, systems, bundle) │
          └────────────┬────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │   SceneLifecycle.prepare │
          │  - preload assets        │
          │  - ScenarioLoader.load   │
          └────────────┬────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │        WorldScene       │
          │  - apply systems graph  │
          │  - run update/draw       │
          └────────────┬────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │     serialize/export    │
          │  - EntitySerializer     │
          │  - SceneMigration       │
          └─────────────────────────┘
```

## 说明

- `systems` 让场景像“实体组合组件”一样组合系统。
- 不同游戏模式可用不同系统图（如战斗、探索、生存）。
