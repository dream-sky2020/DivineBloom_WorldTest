import { schemasManager } from './SchemasManager.js';

/**
 * 状态效果数据库 (Buffs/Debuffs)
 * 兼容旧版导出，现在由 SchemasManager 统一管理
 */
export const statusDb = schemasManager.status;

export default statusDb;
