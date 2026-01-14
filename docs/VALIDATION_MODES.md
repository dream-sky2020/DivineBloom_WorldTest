# Schema 验证模式说明

## 📋 概述

游戏数据验证系统支持两种模式：**宽松模式（Lenient）** 和 **严格模式（Strict）**。

## 🎯 验证模式对比

| 特性 | 宽松模式 (Lenient) | 严格模式 (Strict) |
|------|-------------------|------------------|
| **默认模式** | ✅ 是 | ❌ 否 |
| **验证失败** | 显示警告 ⚠️ | 抛出错误 🚨 |
| **应用运行** | 继续运行 ✅ | 停止运行 ❌ |
| **数据处理** | 使用原始数据 | 拒绝加载 |
| **适用场景** | 开发调试 | 生产部署 |
| **控制台输出** | 黄色警告 | 红色错误 |

## 🛠️ 宽松模式（Lenient Mode）- 推荐用于开发

### 特点

✅ **不中断开发流程**
```
验证失败 → 显示警告 → 继续运行 → 你可以测试功能
```

⚠️ **友好的警告提示**
```javascript
⚠️ Schema Validation Warning in [SkillsDb -> skill_fireball]:
Errors: effects.0.element: Expected elements.fire but got fire
💡 Use Dev Tools (Ctrl+Shift+D) to see detailed validation results.
```

🔍 **专门的验证工具**
- 按 `Ctrl+Shift+D` 打开开发工具
- 查看完整的验证报告
- 逐个修复数据问题

### 使用场景

1. **开发新功能**：先让功能跑起来，再修数据格式
2. **快速原型**：不用担心数据完美，专注逻辑
3. **渐进式修复**：一次修一个，不急
4. **调试测试**：需要看到实际运行效果

### 示例输出

```
⚠️ Schema Validation Warning in [SkillsDb -> skill_passive_mana_regen]:
Errors: effects.0.trigger: Expected turnStart but got turn_start
⚠️ SkillsDb: 1 item(s) failed validation but will continue to work.
💡 Use Dev Tools (Ctrl+Shift+D) to see detailed validation results and fix issues.
```

## 🚨 严格模式（Strict Mode）- 用于生产环境

### 特点

❌ **零容忍策略**
```
验证失败 → 抛出错误 → 停止运行 → 强制修复
```

🚨 **严格的错误提示**
```javascript
🚨 Schema Validation Error in [SkillsDb -> skill_fireball]:
[详细的错误堆栈]
Error: Data Validation Failed: SkillsDb[skill_fireball]
```

🔒 **确保数据完整性**
- 所有数据必须符合 Schema
- 不允许有任何格式错误
- 保证生产环境的稳定性

### 使用场景

1. **准备发布**：确保所有数据正确
2. **CI/CD 流程**：自动化测试时使用
3. **数据审核**：检查数据完整性
4. **生产部署**：确保线上稳定

### 示例输出

```
🚨 Schema Validation Error in [SkillsDb -> skill_passive_mana_regen]:
{
  errors: [
    {
      path: ['effects', 0, 'trigger'],
      message: 'Expected turnStart but got turn_start'
    }
  ]
}
Error: Data Validation Failed: SkillsDb[skill_passive_mana_regen]
    at createMapValidator (common.js:42)
    ...
```

## ⚙️ 配置方法

### 方法一：修改配置文件（推荐）

编辑 `src/data/schemas/config.js`：

```javascript
export const ValidationConfig = {
    // 修改这里
    mode: 'lenient', // 'lenient' | 'strict'
    
    showDetailedErrors: true,
    showSuccessLogs: false,
    showStartupHint: true,
};
```

### 方法二：运行时切换

在浏览器控制台或代码中：

```javascript
import { setValidationMode } from '@/data/schemas/config.js';

// 切换到严格模式
setValidationMode('strict');

// 切换到宽松模式
setValidationMode('lenient');
```

### 方法三：环境变量（未来支持）

```bash
# 开发环境
VITE_VALIDATION_MODE=lenient npm run dev

# 生产环境
VITE_VALIDATION_MODE=strict npm run build
```

## 📊 配置选项详解

```javascript
export const ValidationConfig = {
    /**
     * 验证模式
     * 'lenient': 宽松 - 警告但继续运行（开发用）
     * 'strict': 严格 - 错误就停止（生产用）
     */
    mode: 'lenient',
    
    /**
     * 是否显示详细错误信息
     * true: 显示每个字段的错误
     * false: 只显示有错误的项目名称
     */
    showDetailedErrors: true,
    
    /**
     * 是否显示验证成功的日志
     * true: 每个成功的验证都会输出
     * false: 只显示错误/警告（推荐）
     */
    showSuccessLogs: false,
    
    /**
     * 是否在启动时显示验证提示
     * true: 显示欢迎信息和使用提示
     * false: 静默启动
     */
    showStartupHint: true,
};
```

## 🎯 推荐的开发流程

### 阶段一：快速开发（宽松模式）

```javascript
// config.js
mode: 'lenient'
```

1. 专注于功能实现
2. 看到警告但不修复
3. 快速迭代和测试
4. 功能完成后再统一修复

### 阶段二：数据修复（宽松模式 + 验证工具）

```javascript
// 打开开发工具
Ctrl + Shift + D
```

1. 点击"开始验证"
2. 查看所有错误列表
3. 逐个修复数据问题
4. 重新验证确认

### 阶段三：最终检查（严格模式）

```javascript
// config.js
mode: 'strict'
```

1. 切换到严格模式
2. 刷新页面
3. 确保没有任何错误
4. 准备发布

### 阶段四：生产部署（严格模式）

```bash
# 构建前确保严格模式
VITE_VALIDATION_MODE=strict npm run build
```

## 💡 最佳实践

### DO ✅

1. **开发时使用宽松模式**
   - 让你专注于逻辑，不被数据格式打断

2. **定期运行验证工具**
   - 每天开发结束前，打开 Dev Tools 检查一次

3. **发布前切换到严格模式**
   - 确保所有数据都符合规范

4. **保持控制台干净**
   - 看到警告就记录下来，有空就修

5. **使用命名规范文档**
   - 参考 `NAMING_CONVENTIONS.md`

### DON'T ❌

1. **不要忽略所有警告**
   - 虽然不会崩溃，但数据错误可能导致运行时问题

2. **不要在生产环境用宽松模式**
   - 可能导致不可预测的行为

3. **不要在严格模式下开发新功能**
   - 会频繁中断，降低效率

4. **不要依赖宽松模式掩盖问题**
   - 最终还是要修复数据

## 🔍 故障排除

### 问题：看不到警告信息

**检查**：
1. 浏览器控制台是否打开
2. 控制台过滤器是否显示"警告"
3. `showDetailedErrors` 是否为 `true`

### 问题：警告太多，看不清

**解决**：
1. 使用 Dev Tools 查看结构化报告
2. 临时设置 `showDetailedErrors: false`
3. 使用控制台过滤功能

### 问题：不确定用哪个模式

**决策树**：
```
正在开发新功能？
├─ 是 → 宽松模式
└─ 否 → 准备发布？
    ├─ 是 → 严格模式
    └─ 否 → 日常维护？
        ├─ 是 → 宽松模式
        └─ 否 → 数据审核？
            └─ 是 → 严格模式
```

## 📚 相关文档

- [Schema README](../src/data/schemas/README.md) - 验证系统概述
- [Naming Conventions](../src/data/schemas/NAMING_CONVENTIONS.md) - 命名规范
- [Effect Schema System](./EFFECT_SCHEMA_SYSTEM.md) - 完整文档

---

**最后更新**: 2026-01-14  
**版本**: v1.0.0  
**推荐模式**: Lenient（开发）/ Strict（生产）
