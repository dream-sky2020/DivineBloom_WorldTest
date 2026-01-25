/**
 * 数据验证工具
 * 用于验证所有游戏数据是否符合 Schema 定义
 */

import { validateEffects } from './effects.js';
import { SkillSchema } from './resources/skill.js';
import { StatusSchema } from './resources/status.js';
import { ItemSchema } from './resources/item.js';
import { CharacterSchema } from './resources/character.js';
import { EntityRegistry } from './common.js';

// ============================================
// 🔍 验证辅助函数
// ============================================

const validateCollection = (collection, schema, typeName) => {
    const errors = [];
    let validCount = 0;

    Object.entries(collection).forEach(([id, item]) => {
        // 先记录之前的 issue 数量
        const beforeCount = EntityRegistry.getIssues().length;

        try {
            schema.parse(item);
            validCount++;
        } catch (e) {
            // ... 处理普通错误 ...
            errors.push({
                id,
                name: item.name?.zh || id,
                error: e,
                path: e.errors ? e.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })) : [{ path: 'root', message: e.message }]
            });
        }

        // 无论是否报错，都检查这一轮是否有新的翻译缺失产生的 issue
        const afterIssues = EntityRegistry.getIssues();
        for (let i = beforeCount; i < afterIssues.length; i++) {
            const issue = afterIssues[i];
            if (issue.type === 'translation_gap' && issue.id === 'unknown') {
                issue.id = id;
                issue.message = issue.message.replace('实体 [unknown]', `实体 [${id}]`);
            }
        }
    });

    return {
        total: Object.keys(collection).length,
        valid: validCount,
        errors
    };
};

/**
 * 验证技能数据库
 */
export const validateSkillsDb = (skillsDb) => validateCollection(skillsDb, SkillSchema, 'Skill');

/**
 * 验证状态数据库
 */
export const validateStatusDb = (statusDb) => validateCollection(statusDb, StatusSchema, 'Status');

/**
 * 验证物品数据库
 */
export const validateItemsDb = (itemsDb) => validateCollection(itemsDb, ItemSchema, 'Item');

/**
 * 验证角色数据库
 */
export const validateCharactersDb = (charactersDb) => validateCollection(charactersDb, CharacterSchema, 'Character');

/**
 * 验证所有游戏数据
 */
export const validateAllGameData = async () => {
    const results = {
        skills: null,
        statuses: null,
        items: null,
        characters: null,
        registry: null,
        timestamp: new Date().toISOString()
    };

    try {
        // 清空之前的注册表问题，准备重新验证
        EntityRegistry.clearIssues();

        // 使用 SchemasManager 执行全量重新验证
        const { schemasManager } = await import('./SchemasManager.js');
        
        // 强制重新初始化（可选，如果需要刷新数据）
        // schemasManager.init(); 

        // 执行验证并获取结果
        results.skills = validateSkillsDb(schemasManager.skills);
        results.statuses = validateStatusDb(schemasManager.status);
        results.items = validateItemsDb(schemasManager.items);
        results.characters = validateCharactersDb(schemasManager.characters);

        // 获取注册表错误（重复 ID 等）
        results.registry = {
            issues: EntityRegistry.getIssues()
        };

    } catch (e) {
        console.error('💥 验证过程出现异常:', e);
    }

    return results;
};


// ============================================
// 🛠️ 命令行工具
// ============================================

// 如果直接运行此脚本，执行验证（仅在 Node.js 环境）
// 检查是否在 Node.js 环境中（浏览器环境没有 process 对象）
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
    validateAllGameData({ throwOnError: false })
        .then(() => {
            console.log('\n✅ 验证完成');
            process.exit(0);
        })
        .catch((e) => {
            console.error('\n❌ 验证失败', e);
            process.exit(1);
        });
}
