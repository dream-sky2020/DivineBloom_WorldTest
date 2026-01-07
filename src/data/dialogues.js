/**
 * 对话脚本数据库
 * 
 * 自动加载 ./dialogues 下的所有 .js 文件
 * 每个文件应导出具体的 Generator 函数，Key 通常是函数名或在文件中指定
 */

const modules = import.meta.glob('./dialogues/*.js', { eager: true });

export const dialoguesDb = {};

for (const path in modules) {
    const mod = modules[path];

    // 1. 尝试合并 default export (如果默认导出是一个对象包含多个脚本)
    if (mod.default && typeof mod.default === 'object') {
        Object.assign(dialoguesDb, mod.default);
    }

    // 2. 尝试合并 named exports (如果直接导出了函数)
    // 过滤掉 'default' 键，因为上面已经处理过，或者如果它不是对象
    Object.keys(mod).forEach(key => {
        if (key !== 'default' && typeof mod[key] === 'function') {
            // 假设导出名就是对话ID，例如 export function* elderDialogue() {} -> ID: elderDialogue
            // 或者可以在这里做一些名称转换
            dialoguesDb[key] = mod[key];
        }
    });
}

