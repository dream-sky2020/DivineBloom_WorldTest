import { schemasManager } from './SchemasManager.js';

/**
 * 技能数据库
 * 兼容旧版导出，现在由 SchemasManager 统一管理
 */
export const skillsDb = schemasManager.skills;

export default skillsDb;
