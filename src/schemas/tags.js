import { schemasManager } from './SchemasManager.js';

/**
 * 标签数据库 (Tags)
 * 兼容旧版导出，现在由 SchemasManager 统一管理
 */
export const tagsDb = schemasManager.tags;

// 同时也提供单例引用，方便后续迁移
export default tagsDb;
