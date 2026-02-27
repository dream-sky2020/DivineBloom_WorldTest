# 点击进化游戏：UI 信号（Commands）定义规范

本文档定义了 UI 层（Vue）向游戏引擎（ECS）投递的所有可能信号。遵循 `UIInputBuffer.push({ type, payload })` 模式。

## 1. 核心交互 (Core Interaction)
用于主界面的点击、收集和进化操作。

| 信号类型 (Type) | 负载 (Payload) | 说明 | 对应系统接收 |
| :--- | :--- | :--- | :--- |
| `CMD_MAIN_CLICK` | `{ x, y, power }` | 玩家点击主实体或屏幕 | `EvolutionSystem` |
| `CMD_REQUEST_EVOLUTION` | `{ targetFormId }` | 玩家请求进化到下一阶段 | `EvolutionSystem` |
| `CMD_SELECT_EVOLUTION_PATH` | `{ pathId }` | 在分支进化中做出选择 | `EvolutionSystem` |
| `CMD_COLLECT_RESOURCE` | `{ entityId, type }` | 手动收集掉落的资源（如罐头、破布） | `InventorySystem` |

## 2. 背包系统 (Backpack System)
管理玩家拥有的物品、素材和装备。

| 信号类型 (Type) | 负载 (Payload) | 说明 | 对应系统接收 |
| :--- | :--- | :--- | :--- |
| `CMD_OPEN_PANEL` | `"backpack"` | 打开背包界面 | `UIIntentSystem` |
| `CMD_CLOSE_PANEL` | `"backpack"` | 关闭背包界面 | `UIIntentSystem` |
| `CMD_USE_ITEM` | `{ itemId, slotIndex }` | 使用指定位置的物品 | `ItemExecuteSystem` |
| `CMD_DISCARD_ITEM` | `{ slotIndex, count }` | 丢弃或销毁物品 | `InventorySystem` |
| `CMD_SORT_INVENTORY` | `{ criteria: 'rarity'\|'type' }` | 整理背包排列顺序 | `InventorySystem` |
| `CMD_EQUIP_ITEM` | `{ itemId, part }` | 装备某个进化组件或外壳 | `EvolutionSystem` |

## 3. 图鉴系统 (Archive/Illustrated Handbook)
展示已解锁的形态、敌人和物品背景故事。

| 信号类型 (Type) | 负载 (Payload) | 说明 | 对应系统接收 |
| :--- | :--- | :--- | :--- |
| `CMD_OPEN_PANEL` | `"archive"` | 打开图鉴/档案馆 | `UIIntentSystem` |
| `CMD_VIEW_ARCHIVE_DETAIL` | `{ entryId }` | 查看特定条目的详细背景故事 | `ArchiveSystem` |
| `CMD_FILTER_ARCHIVE` | `{ category: 'creature'\|'item' }` | 切换图鉴分类 | `ArchiveSystem` |
| `CMD_CLAIM_COLLECTION_REWARD` | `{ collectionId }` | 领取收集进度达标奖励 | `RewardSystem` |

## 4. 升级与自动化 (Upgrades & Automation)
点击进化类游戏的核心数值成长部分。

| 信号类型 (Type) | 负载 (Payload) | 说明 | 对应系统接收 |
| :--- | :--- | :--- | :--- |
| `CMD_UPGRADE_STAT` | `{ statName: 'clickPower'\|'autoRate' }` | 消耗资源提升基础属性 | `StatSystem` |
| `CMD_BUY_AUTOMATOR` | `{ automatorId }` | 购买/升级自动点击器或收集器 | `AutomationSystem` |
| `CMD_TOGGLE_AUTOMATOR` | `{ id, enabled }` | 开启或关闭特定的自动功能 | `AutomationSystem` |

## 5. 系统与设置 (Settings & System)
处理非游戏逻辑的全局控制。

| 信号类型 (Type) | 负载 (Payload) | 说明 | 对应系统接收 |
| :--- | :--- | :--- | :--- |
| `CMD_SET_VOLUME` | `{ channel: 'bgm'\|'sfx', value: 0-1 }` | 调整音量 | `AudioSystem` |
| `CMD_CHANGE_LANGUAGE` | `{ lang: 'zh-CN'\|'en-US' }` | 切换界面语言 | `UISyncSystem` |
| `CMD_SAVE_GAME` | `{ slotIndex, isAuto }` | 请求手动存档 | `PersistenceSystem` |
| `CMD_LOAD_GAME` | `{ slotIndex }` | 请求读档 | `PersistenceSystem` |
| `CMD_RESET_PROGRESS` | `{ confirm: boolean }` | 转生（Prestige）或重置进度 | `EvolutionSystem` |

## 6. 剧情与对话 (Dialogue & Narrative)
处理背景故事中的交互。

| 信号类型 (Type) | 负载 (Payload) | 说明 | 对应系统接收 |
| :--- | :--- | :--- | :--- |
| `CMD_NEXT_DIALOGUE` | `null` | 点击继续对话 | `DialogueSystem` |
| `CMD_SELECT_DIALOGUE_OPTION` | `{ optionId }` | 选择对话分支 | `DialogueSystem` |
| `CMD_SKIP_CUTSCENE` | `null` | 跳过剧情动画 | `CutsceneSystem` |

## 7. 宠物系统 (Pet System)
处理宠物的互动、养成与进化。

| 信号类型 (Type) | 负载 (Payload) | 说明 | 对应系统接收 |
| :--- | :--- | :--- | :--- |
| `CMD_OPEN_PANEL` | `"pet"` | 打开宠物管理面板 | `UIIntentSystem` |
| `CMD_PET_FEED` | `{ petId, foodItemId }` | 给指定宠物喂食，增加饱食度或经验 | `PetSystem` |
| `CMD_PET_INTERACT` | `{ petId, action: 'touch'\|'play' }` | 与宠物互动（抚摸/玩耍），增加好感度 | `PetSystem` |
| `CMD_PET_REQUEST_EVOLUTION` | `{ petId }` | 当条件满足时，触发宠物进化 | `PetSystem` |
| `CMD_SET_ACTIVE_PET` | `{ petId }` | 设置当前跟随/出战的宠物 | `PetSystem` |

---

### 信号处理流程建议：
1. **Vue UI** 捕获用户事件，调用 `UIInputBuffer.push(cmd)`。
2. **UISenseSystem** 在每一帧开始时清空 Buffer 并写入 `UISenseComponent`。
3. **UIIntentSystem** 检查当前状态（如：是否在动画中、是否资源充足），将合法的 Command 转化为 `UIIntentComponent`。
4. **具体业务 System**（如 `EvolutionSystem`）监听对应的 Intent，执行属性修改或状态切换。
5. **UISyncSystem** 在帧末尾将最新的 `UIState` 同步回 Vue Store。
