/**
 * 角色数据库 (Characters)
 * 记录角色初始状态和基本信息
 */

// 使用 Vite 的 glob 导入功能自动加载 ./characters 下的所有 .js 文件
// eager: true 确保是同步加载，保持 charactersDb 的直接可用性
const modules = import.meta.glob('./characters/*.js', { eager: true })
import { CharacterSchema, createMapValidator } from './schemas/index'

const rawCharactersDb = {}

// 聚合所有模块导出的角色数据
for (const path in modules) {
  const mod = modules[path]
  // 合并模块的默认导出到 charactersDb
  Object.assign(rawCharactersDb, mod.default || mod)
}

// 运行时校验
// 这会在应用启动时立即执行，如果有任何配置错误，控制台会立刻报错
const validateCharacters = createMapValidator(CharacterSchema, 'CharactersDb');
export const charactersDb = validateCharacters(rawCharactersDb);
