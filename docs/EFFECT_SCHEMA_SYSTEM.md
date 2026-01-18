# Effect Schema 验证系统 - 完整指南

## 📝 更新日期
2026-01-14

## 🎯 系统概述

本系统实现了完整的游戏数据验证框架，通过严格的 Schema 定义和枚举约束，确保所有 Effect 相关数据的类型安全。

## ✨ 主要改进

### 1. 修复"破碎监牢"状态免疫效果 ✅

**问题**：`status_shattered_prison`（破碎监牢）的控制免疫效果未生效

**原因**：`checkCrowdControl` 函数只检查眩晕效果，未处理免疫效果

**解决方案**：
```javascript
// src/game/battle/statusSystem.js
export const checkCrowdControl = (character) => {
    // Step 1: 优先检查免疫效果
    for (const status of character.statusEffects) {
        if (statusDef.effects.some(eff => 
            eff.trigger === 'checkAction' && eff.type === 'immunity'
        )) {
            return false; // 有免疫，不受控制
        }
    }
    
    // Step 2: 检查眩晕效果
    // ...
}
```

### 2. 创建完整的 Effect Schema 定义 ✅

**文件**：`src/data/schemas/effects.js`

**包含内容**：
- ✅ Effect Type 枚举（15+ 种类型）
- ✅ Trigger Type 枚举（12+ 种触发器）
- ✅ Scaling Type 枚举（9+ 种缩放类型）
- ✅ Target Type 枚举（7+ 种目标类型）
- ✅ Element Type 枚举（10+ 种元素类型）
- ✅ Stat Type 枚举（7种属性类型）
- ✅ 严格的 Zod Schema 验证
- ✅ 详细的错误提示

### 3. 更新资源 Schema ✅

**文件**：
- `src/data/schemas/resources/skill.js` - 使用新的 SkillEffectSchema
- `src/data/schemas/resources/status.js` - 使用新的 StatusEffectSchema
- `src/data/schemas/index.js` - 导出所有验证相关内容

### 4. 创建验证工具 ✅

#### 浏览器内验证工具

**文件**：
- `src/interface/dev/DataValidator.vue` - 数据验证 UI 组件
- `src/interface/pages/DevTools.vue` - 开发工具主界面
- `src/interface/pages/GameUI.vue` - 添加快捷键支持

**使用方法**：
1. 启动游戏 `npm run dev`
2. 按 `Ctrl + Shift + D` 打开开发工具
3. 点击"开始验证"按钮
4. 查看详细的验证结果

**特性**：
- ✅ 实时验证所有技能和状态数据
- ✅ 详细的错误提示和定位
- ✅ 成功率统计
- ✅ 美观的 UI 界面

#### 命令行验证工具

**文件**：
- `src/data/schemas/validator.js` - 核心验证逻辑
- `scripts/validate-data.js` - 命令行入口
- `package.json` - 添加 `npm run validate` 脚本

**注意**：由于 Node.js 环境不支持 Vite 别名（`@/`），命令行验证目前仅适用于浏览器环境。

### 5. 修复模块导入问题 ✅

**问题**：部分文件的导入语句缺少 `.js` 扩展名

**修复文件**：
- `src/data/skills.js`
- `src/data/status.js`
- `src/data/items.js`
- `src/data/maps.js`
- `src/data/characters.js`

### 6. 文档完善 ✅

**新增文档**：
- `src/data/schemas/README.md` - Schema 系统使用指南
- `docs/EFFECT_SCHEMA_SYSTEM.md` - 本文档（完整总结）

## 📊 Effect Schema 完整定义

### 支持的 Effect Types

```javascript
EffectType = {
    // 伤害与治疗
    DAMAGE: 'damage',
    HEAL: 'heal',
    HEAL_ALL: 'heal_all',
    RECOVER_MP: 'recoverMp',
    
    // 状态管理
    APPLY_STATUS: 'applyStatus',
    CURE_STATUS: 'cureStatus',
    
    // 增益与减益
    BUFF: 'buff',
    STAT_BOOST: 'stat_boost',
    STAT_MOD: 'statMod',
    
    // 控制与免疫
    STUN: 'stun',
    IMMUNITY: 'immunity',  // ⭐ 新增：用于破碎监牢等免控效果
    
    // 特殊效果
    REVIVE: 'revive',
    FULL_RESTORE: 'fullRestore',
    PLAGUE_RAIN: 'plague_rain',
}
```

### 支持的 Trigger Types

```javascript
TriggerType = {
    // 战斗事件
    BATTLE_START: 'battle_start',
    BATTLE_END: 'battle_end',
    
    // 回合事件
    TURN_START: 'turnStart',
    TURN_END: 'turnEnd',
    
    // 行动事件
    CHECK_ACTION: 'checkAction',    // ⭐ 用于控制和免疫检测
    BEFORE_ACTION: 'beforeAction',
    AFTER_ACTION: 'afterAction',
    
    // 伤害事件
    ON_DAMAGE_TAKEN: 'on_damage_taken',
    ON_DAMAGE_DEALT: 'on_damage_dealt',
    
    // 特殊事件
    ON_CC_SKIP: 'on_cc_skip',
    ON_DEATH: 'on_death',
    ON_REVIVE: 'on_revive',
    
    // 被动
    PASSIVE: 'passive',
}
```

### 支持的 Scaling Types

```javascript
ScalingType = {
    ATK: 'atk',
    MAG: 'mag',
    DEF: 'def',
    STR: 'str',
    SPD: 'spd',
    MAX_HP: 'maxHp',
    CURRENT_HP: 'currentHp',
    MAX_MP: 'maxMp',
    CURRENT_MP: 'currentMp',
    DAMAGE_DEALT: 'damage_dealt',  // 基于造成的伤害
    MISSING_HP: 'missing_hp',
}
```

### 支持的 Target Types

```javascript
TargetType = {
    SELF: 'self',
    ENEMY: 'enemy',
    ALLY: 'ally',
    ALL_ENEMIES: 'allEnemies',
    ALL_ALLIES: 'allAllies',
    RANDOM_ENEMY: 'randomEnemy',
    RANDOM_ALLY: 'randomAlly',
}
```

### 支持的 Element Types

```javascript
ElementType = {
    PHYSICAL: 'elements.physical',
    FIRE: 'elements.fire',
    WATER: 'elements.water',
    ICE: 'elements.ice',      // ⭐ 新增
    WIND: 'elements.wind',
    EARTH: 'elements.earth',
    LIGHTNING: 'elements.lightning',
    LIGHT: 'elements.light',
    DARK: 'elements.dark',
    NONE: 'elements.none',
}
```

## 🔍 使用示例

### 正确的 Effect 定义

```javascript
// 技能效果 - 火球术
{
  type: 'damage',
  scaling: 'mag',
  value: 1.5,
  element: 'elements.fire',
  minOffset: -0.1,
  maxOffset: 0.1
}

// 状态效果 - 破碎监牢（免疫控制）
{
  trigger: 'checkAction',
  type: 'immunity',
  status: 'stun'
}

// 状态效果 - 眩晕
{
  trigger: 'checkAction',
  type: 'stun',
  chance: 0.5
}
```

### 错误示例及修正

#### 错误 1：使用未定义的类型
```javascript
// ❌ 错误
{
  type: 'attack',  // 不存在此类型
  scaling: 'attack'
}

// ✅ 正确
{
  type: 'damage',
  scaling: 'atk'
}
```

#### 错误 2：元素类型格式错误
```javascript
// ❌ 错误
{
  element: 'fire'  // 缺少 elements 前缀
}

// ✅ 正确
{
  element: 'elements.fire'
}
```

#### 错误 3：使用未定义的字段
```javascript
// ❌ 错误（严格模式不允许）
{
  type: 'damage',
  customField: 123  // 未在 Schema 中定义
}

// ✅ 正确
{
  type: 'damage',
  value: 123
}
```

## 🛠️ 开发工作流

### 添加新的 Effect 类型

1. 在 `effects.js` 中添加枚举定义：
```javascript
export const EffectType = {
  // ... 现有类型
  NEW_TYPE: 'newType',
};
```

2. （可选）在 `EffectSchema` 中添加特定字段约束

3. 在 `effectSystem.js` 中实现效果逻辑

4. 运行验证确保所有数据符合新 Schema

### 添加新的触发器

1. 在 `effects.js` 中添加触发器类型：
```javascript
export const TriggerType = {
  // ... 现有触发器
  NEW_TRIGGER: 'new_trigger',
};
```

2. 在相应的战斗系统文件中实现触发逻辑

3. 更新文档说明触发时机

## 📈 验证结果统计

运行 `npm run dev` 后按 `Ctrl+Shift+D` 打开开发工具，可以看到：

- ✅ 技能总数
- ✅ 状态总数
- ✅ 验证通过数量
- ✅ 验证失败数量
- ✅ 成功率百分比
- ✅ 详细错误列表

## 🎨 UI 特性

### 开发工具界面

- 🎯 现代化设计
- 📊 实时统计图表
- 🔍 详细错误定位
- ✨ 友好的错误提示
- ⚡ 快捷键支持

### 快捷键

- `Ctrl + Shift + D` - 打开/关闭开发工具
- `Esc` - 关闭开发工具

## 🔧 技术栈

- **Zod** - Schema 验证库
- **Vue 3** - UI 框架
- **Vite** - 构建工具
- **JavaScript ES6+** - 编程语言

## 📦 文件结构

```
src/
├── data/
│   ├── schemas/
│   │   ├── effects.js          ⭐ 核心：Effect 枚举和 Schema
│   │   ├── validator.js        ⭐ 验证工具
│   │   ├── resources/
│   │   │   ├── skill.js        ✏️ 更新：使用新 Schema
│   │   │   └── status.js       ✏️ 更新：使用新 Schema
│   │   ├── index.js            ✏️ 更新：导出新内容
│   │   └── README.md           ⭐ 新增：使用文档
│   ├── skills.js               ✏️ 修复：导入路径
│   └── status.js               ✏️ 修复：导入路径
├── components/
│   ├── dev/
│   │   └── DataValidator.vue   ⭐ 新增：验证 UI
│   └── pages/
│       ├── DevTools.vue        ⭐ 新增：开发工具
│       └── GameUI.vue          ✏️ 更新：添加快捷键
└── game/
    └── battle/
        └── statusSystem.js     ✏️ 修复：免疫效果

scripts/
└── validate-data.js            ⭐ 新增：命令行验证

docs/
└── EFFECT_SCHEMA_SYSTEM.md     ⭐ 新增：本文档
```

## ⚠️ 注意事项

1. **严格模式**：Schema 使用 `.strict()` 模式，不允许未定义的字段
2. **枚举值**：所有枚举值必须严格匹配，区分大小写
3. **导入路径**：使用 ES6 模块时必须包含 `.js` 扩展名
4. **浏览器验证**：由于别名问题，建议使用浏览器内验证工具

## 🚀 下一步计划

- [ ] 添加物品（Item）Schema 验证
- [ ] 添加角色（Character）Schema 验证
- [ ] 添加地图（Map）Schema 验证
- [ ] 实现自动修复建议
- [ ] 添加性能分析工具
- [ ] 支持自定义验证规则
- [ ] 生成 TypeScript 类型定义

## 🤝 贡献指南

1. 添加新枚举值时，确保在 `effects.js` 中定义
2. 更新 Schema 后，运行验证确保兼容性
3. 添加新功能时，同步更新文档
4. 提交前确保所有验证通过

## 📞 支持

如有问题或建议，请查看：
- `src/data/schemas/README.md` - 详细使用文档
- 开发工具界面的"说明"标签页
- 项目主 README

---

**最后更新**：2026-01-14  
**版本**：v1.0.0  
**状态**：✅ 已完成并测试
