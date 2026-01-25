import { schemasManager } from './SchemasManager.js';

/**
 * 对话脚本数据库
 * 兼容旧版导出，现在由 SchemasManager 统一管理
 */
export const dialoguesDb = schemasManager.dialogues;

export default dialoguesDb;
