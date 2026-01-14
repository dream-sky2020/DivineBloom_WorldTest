# Effect Schema 命名规范

## 📋 总览

这个文档说明了 Effect 系统中各个字段的正确命名格式，帮助避免验证错误。

## ⚠️ 常见错误案例

### ❌ 错误：使用下划线的 Trigger
```javascript
{
  type: "recover_mp",
  trigger: "turn_start"  // ❌ 错误！
}
```

### ✅ 正确：使用驼峰命名
```javascript
{
  type: "recover_mp",
  trigger: "turnStart"   // ✅ 正确！
}
```

## 🎯 命名规则

### Effect Types（效果类型）

**规则**：大部分使用驼峰命名，部分使用下划线

| 类型 | 正确写法 | 错误写法 |
|------|---------|---------|
| 伤害 | `damage` | ~~`dmg`~~ |
| 治疗 | `heal` | ~~`healing`~~ |
| 治疗全体 | `heal_all` | ~~`healAll`~~ |
| 恢复 MP | `recoverMp` 或 `recover_mp` | ~~`recover_mana`~~ |
| 施加状态 | `applyStatus` | ~~`apply_status`~~ |
| 治疗状态 | `cureStatus` | ~~`cure_status`~~ |
| 增益 | `buff` | ~~`Buff`~~ |
| 属性提升 | `stat_boost` | ~~`statBoost`~~ |
| 属性修改 | `statMod` | ~~`stat_mod`~~ |
| 眩晕 | `stun` | ~~`Stun`~~ |
| 免疫 | `immunity` | ~~`Immunity`~~ |
| 复活 | `revive` | ~~`resurrection`~~ |
| 完全恢复 | `fullRestore` | ~~`full_restore`~~ |

### Trigger Types（触发器类型）

**规则**：战斗事件使用下划线，其他使用驼峰命名

#### 下划线命名（战斗事件）

| 触发器 | 正确写法 | 错误写法 |
|--------|---------|---------|
| 战斗开始 | `battle_start` ✅ | ~~`battleStart`~~ |
| 战斗结束 | `battle_end` ✅ | ~~`battleEnd`~~ |
| 受到伤害 | `on_damage_taken` ✅ | ~~`onDamageTaken`~~ |
| 造成伤害 | `on_damage_dealt` ✅ | ~~`onDamageDealt`~~ |
| 跳过控制 | `on_cc_skip` ✅ | ~~`onCcSkip`~~ |
| 死亡时 | `on_death` ✅ | ~~`onDeath`~~ |
| 复活时 | `on_revive` ✅ | ~~`onRevive`~~ |

#### 驼峰命名（回合和行动事件）

| 触发器 | 正确写法 | 错误写法 |
|--------|---------|---------|
| 回合开始 | `turnStart` ✅ | ~~`turn_start`~~ |
| 回合结束 | `turnEnd` ✅ | ~~`turn_end`~~ |
| 检查行动 | `checkAction` ✅ | ~~`check_action`~~ |
| 行动前 | `beforeAction` ✅ | ~~`before_action`~~ |
| 行动后 | `afterAction` ✅ | ~~`after_action`~~ |
| 被动 | `passive` ✅ | ~~`Passive`~~ |

### Scaling Types（缩放类型）

**规则**：全部使用小写或驼峰命名

| 类型 | 正确写法 | 错误写法 |
|------|---------|---------|
| 攻击力 | `atk` | ~~`attack`~~ ~~`ATK`~~ |
| 魔攻 | `mag` | ~~`magic`~~ ~~`MAG`~~ |
| 防御 | `def` | ~~`defense`~~ ~~`DEF`~~ |
| 力量 | `str` | ~~`strength`~~ ~~`STR`~~ |
| 速度 | `spd` | ~~`speed`~~ ~~`SPD`~~ |
| 最大生命 | `maxHp` | ~~`max_hp`~~ ~~`MaxHP`~~ |
| 当前生命 | `currentHp` | ~~`current_hp`~~ |
| 最大魔法 | `maxMp` | ~~`max_mp`~~ |
| 造成伤害 | `damage_dealt` | ~~`damageDealt`~~ |

### Target Types（目标类型）

**规则**：全部使用驼峰命名

| 类型 | 正确写法 | 错误写法 |
|------|---------|---------|
| 自己 | `self` | ~~`Self`~~ |
| 敌人 | `enemy` | ~~`Enemy`~~ |
| 友方 | `ally` | ~~`Ally`~~ |
| 所有敌人 | `allEnemies` | ~~`all_enemies`~~ |
| 所有友方 | `allAllies` | ~~`all_allies`~~ |
| 随机敌人 | `randomEnemy` | ~~`random_enemy`~~ |
| 随机友方 | `randomAlly` | ~~`random_ally`~~ |

### Element Types（元素类型）

**规则**：全部使用 `elements.` 前缀

| 类型 | 正确写法 | 错误写法 |
|------|---------|---------|
| 物理 | `elements.physical` | ~~`physical`~~ |
| 火 | `elements.fire` | ~~`fire`~~ |
| 水 | `elements.water` | ~~`water`~~ |
| 冰 | `elements.ice` | ~~`ice`~~ |
| 风 | `elements.wind` | ~~`wind`~~ |
| 雷 | `elements.lightning` | ~~`lightning`~~ |
| 光 | `elements.light` | ~~`light`~~ |
| 暗 | `elements.dark` | ~~`dark`~~ |

### Stat Types（属性类型）

**规则**：全部使用小写简写

| 类型 | 正确写法 | 错误写法 |
|------|---------|---------|
| 生命 | `hp` | ~~`HP`~~ ~~`health`~~ |
| 魔法 | `mp` | ~~`MP`~~ ~~`mana`~~ |
| 攻击 | `atk` | ~~`ATK`~~ ~~`attack`~~ |
| 防御 | `def` | ~~`DEF`~~ ~~`defense`~~ |
| 魔攻 | `mag` | ~~`MAG`~~ ~~`magic`~~ |
| 速度 | `spd` | ~~`SPD`~~ ~~`speed`~~ |
| 力量 | `str` | ~~`STR`~~ ~~`strength`~~ |

## 🔍 快速检查清单

在编写新的 Effect 时，请检查：

- [ ] `type` 字段：检查是否使用了正确的效果类型名称
- [ ] `trigger` 字段：
  - [ ] 战斗事件（`battle_*`, `on_*`）使用下划线
  - [ ] 回合/行动事件（`turn*`, `*Action`）使用驼峰
- [ ] `scaling` 字段：使用小写简写（`atk`, `mag`, `maxHp`等）
- [ ] `element` 字段：必须有 `elements.` 前缀
- [ ] `target` 字段：使用驼峰命名
- [ ] `stat` 字段：使用小写简写

## 🛠️ 验证工具

使用开发工具中的数据验证器来检查：

1. 按 `Ctrl + Shift + D` 打开开发工具
2. 点击"开始验证"
3. 查看详细的错误信息和字段名称

## 📝 常见验证错误

### 错误 1：Trigger 命名错误

```javascript
// ❌ 错误
{
  type: "recover_mp",
  trigger: "turn_start"  // 应该是 turnStart
}

// ✅ 正确
{
  type: "recover_mp",
  trigger: "turnStart"
}
```

### 错误 2：元素类型缺少前缀

```javascript
// ❌ 错误
{
  type: "damage",
  element: "fire"  // 应该是 elements.fire
}

// ✅ 正确
{
  type: "damage",
  element: "elements.fire"
}
```

### 错误 3：Scaling 命名错误

```javascript
// ❌ 错误
{
  type: "damage",
  scaling: "attack"  // 应该是 atk
}

// ✅ 正确
{
  type: "damage",
  scaling: "atk"
}
```

### 错误 4：Target 命名错误

```javascript
// ❌ 错误
{
  type: "heal",
  target: "all_allies"  // 应该是 allAllies
}

// ✅ 正确
{
  type: "heal",
  target: "allAllies"
}
```

## 🎯 最佳实践

1. **参考现有代码**：查看 `src/data/schemas/effects.js` 中的枚举定义
2. **使用验证工具**：每次修改后运行验证
3. **保持一致性**：遵循项目的命名规范
4. **查看错误信息**：验证错误会告诉你期望的值

## 📚 相关文档

- [Effect Schema System](../../../docs/EFFECT_SCHEMA_SYSTEM.md)
- [Schema README](./README.md)
- [Effects 枚举定义](./effects.js)

---

**最后更新**: 2026-01-14  
**版本**: v1.0.0
