/**
 * 统一路径管理模块
 * 使用 @ 别名配合此文件，可以避免硬编码路径
 */

// 基础路径别名 (对应 vite.config.js 中的 alias)
export const PATHS = {
  // 数据目录
  DATA: '@/data',
  
  // 游戏核心逻辑
  GAME: '@/game',
  SCENES: '@/game/scenes',
  ENTITIES: '@/game/entities',
  
  // Vue 组件
  COMPONENTS: '@/components',
  PAGES: '@/components/pages',
  SYSTEMS: '@/components/pages/systems',
  PANELS: '@/components/panels',
  UI: '@/components/ui',
  
  // Stores (Pinia)
  STORES: '@/stores',
  
  // 工具类
  UTILS: '@/utils',
  
  // 静态资源
  ASSETS: '@/assets'
}

// 如果需要在 JS 中动态导入，可以使用这些辅助函数 (可选)
/*
export const resolveData = (path) => `${PATHS.DATA}/${path}`
export const resolveComponent = (path) => `${PATHS.COMPONENTS}/${path}`
*/

