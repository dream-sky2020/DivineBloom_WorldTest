/**
 * 静态物品数据库
 * ID 规则: 
 * 1000-1999: 消耗品 (Consumables)
 * 2000-2999: 武器 (Weapons)
 * 3000-3999: 防具 (Armor)
 * 4000-4999: 饰品 (Accessories)
 * 9000-9999: 关键道具 (Key Items)
 */

// 使用 Vite 的 glob 导入功能自动加载 ./items 下的所有 .js 文件
// eager: true 确保是同步加载，保持 itemsDb 的直接可用性
const modules = import.meta.glob('./items/*.js', { eager: true })
import { ItemSchema, createMapValidator } from './schemas/index'

const rawItemsDb = {}

// 聚合所有模块导出的物品数据
for (const path in modules) {
  const mod = modules[path]
  // 合并模块的默认导出到 itemsDb
  Object.assign(rawItemsDb, mod.default || mod)
}

// 运行时校验
// 任何物品配置错误都会导致游戏启动中断并抛出详细错误
const validateItems = createMapValidator(ItemSchema, 'ItemsDb');
export const itemsDb = validateItems(rawItemsDb);
