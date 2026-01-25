import { schemasManager } from './SchemasManager.js';

/**
 * 静态物品数据库
 * 兼容旧版导出，现在由 SchemasManager 统一管理
 */
export const itemsDb = schemasManager.items;

export default itemsDb;
