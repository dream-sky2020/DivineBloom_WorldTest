/**
 * World2D 统一入口
 * 
 * 外部组件只允许通过 world2d Facade 访问系统能力
 * 
 * 推荐用法：
 *   import { world2d } from '@world2d'
 *   import world2d from '@world2d'  // 默认导出
 */

// 主接口导出
export { world2d, default } from './World2DFacade'
