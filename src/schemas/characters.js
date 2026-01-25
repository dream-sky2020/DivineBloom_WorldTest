import { schemasManager } from './SchemasManager.js';

/**
 * 角色数据库 (Characters)
 * 兼容旧版导出，现在由 SchemasManager 统一管理
 */
export const charactersDb = schemasManager.characters;

export default charactersDb;
