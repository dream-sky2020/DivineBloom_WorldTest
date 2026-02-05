/**
 * 对话脚本数据库
 * 直接加载并管理对话数据，替代 SchemasManager
 */

// 加载所有对话模块
const dialogueModules: Record<string, any> = import.meta.glob('@data/dialogues/*.ts', { eager: true });

function loadDialogues(modules: Record<string, any>) {
    const db: Record<string, any> = {};
    for (const path in modules) {
        const mod = modules[path];
        // 合并默认导出的对象
        if (mod.default && typeof mod.default === 'object') {
            Object.assign(db, mod.default);
        }
        // 合并具名导出的函数
        Object.keys(mod).forEach(key => {
            if (key !== 'default' && typeof mod[key] === 'function') {
                db[key] = mod[key];
            }
        });
    }
    return db;
}

export const dialoguesDb = loadDialogues(dialogueModules);

export default dialoguesDb;
