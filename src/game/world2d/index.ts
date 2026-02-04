/**
 * World2D 统一入口
 * 
 * 外部组件应该只从这个文件导入，而不是直接访问内部模块
 * 
 * 推荐用法：
 *   import { world2d } from '@world2d'
 *   import world2d from '@world2d'  // 默认导出
 * 
 * 兼容用法（渐进式迁移）：
 *   import { gameManager, world, ScenarioLoader } from '@world2d'
 */

// 主接口导出
export { world2d, default } from './World2DFacade'

// ==================== 兼容性导出（计划在未来版本移除） ====================
// 这些导出是为了支持旧代码的平滑迁移
// 新代码应该只使用 world2d 实例的方法

/**
 * @deprecated 请使用 world2d 实例方法
 * 迁移示例：
 *   旧：gameManager.init(canvas)
 *   新：world2d.init(canvas)
 */
export { gameManager } from './GameManager'

/**
 * @deprecated 请使用 world2d API 方法
 * 迁移示例：
 *   旧：直接操作 world
 *   新：使用 world2d.getDebugInfo(), world2d.spawnEntity() 等
 */
export { world, clearWorld, eventQueue, actionQueue } from './world'

/**
 * @deprecated 请使用 world2d.exportCurrentScene() 等方法
 */
export { ScenarioLoader } from './ScenarioLoader'

/**
 * @deprecated 请使用 world2d.spawnEntity() 方法
 */
export { entityTemplateRegistry } from './definitions/internal/EntityTemplateRegistry'

/**
 * @deprecated 仅供系统内部使用，外部不应访问
 */
export { getSystem } from './SystemRegistry'

/**
 * @deprecated 仅供特殊情况使用（如编辑器深度集成）
 */
export { EntityManager } from './definitions/EntityManager'

// ==================== 组件导出（编辑器和高级用途） ====================
// 这些仅用于特殊场景（如编辑器直接操作 ECS）

/**
 * ECS 组件（编辑器用）
 * @deprecated 外部不应直接操作组件，请使用 world2d API
 */
export * from '@components'

// ==================== 未来计划 ====================
// 版本 1.0: 创建 World2DFacade ✅
// 版本 1.1: 迁移所有外部组件使用 world2d 实例
// 版本 2.0: 移除所有 @deprecated 导出，只保留 world2d 实例
