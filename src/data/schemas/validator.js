/**
 * 数据验证工具
 * 用于验证所有游戏数据是否符合 Schema 定义
 */

import { validateEffects } from './effects.js';
import { SkillSchema } from './resources/skill.js';
import { StatusSchema } from './resources/status.js';

// ============================================
// 🔍 验证函数
// ============================================

/**
 * 验证技能数据库
 */
export const validateSkillsDb = (skillsDb, throwOnError = false) => {
    const errors = [];
    const warnings = [];
    let validCount = 0;

    console.log('🔍 开始验证技能数据库...');

    Object.entries(skillsDb).forEach(([skillId, skill]) => {
        try {
            // 验证基本结构
            SkillSchema.parse(skill);

            // 验证 effects
            if (skill.effects && skill.effects.length > 0) {
                validateEffects(skill.effects, `Skill[${skillId}]`);
            }

            validCount++;
        } catch (e) {
            const errorMsg = `❌ Skill[${skillId}]: ${skill.name?.zh || skillId}`;
            errors.push({ id: skillId, name: skill.name?.zh, error: e });
            console.error(errorMsg);

            if (e.errors) {
                e.errors.forEach(err => {
                    console.error(`   → ${err.path.join('.')}: ${err.message}`);
                });
            } else {
                console.error(`   → ${e.message}`);
            }
        }
    });

    const totalCount = Object.keys(skillsDb).length;

    console.log('\n📊 技能验证结果:');
    console.log(`   ✅ 通过: ${validCount}/${totalCount}`);
    console.log(`   ❌ 失败: ${errors.length}`);

    if (errors.length > 0 && throwOnError) {
        throw new Error(`技能数据验证失败: ${errors.length} 个错误`);
    }

    return { valid: validCount, errors, warnings, total: totalCount };
};

/**
 * 验证状态数据库
 */
export const validateStatusDb = (statusDb, throwOnError = false) => {
    const errors = [];
    const warnings = [];
    let validCount = 0;

    console.log('🔍 开始验证状态数据库...');

    Object.entries(statusDb).forEach(([statusId, status]) => {
        try {
            // 验证基本结构
            StatusSchema.parse(status);

            // 验证 effects
            if (status.effects && status.effects.length > 0) {
                validateEffects(status.effects, `Status[${statusId}]`);
            }

            validCount++;
        } catch (e) {
            const errorMsg = `❌ Status[${statusId}]: ${status.name?.zh || statusId}`;
            errors.push({ id: statusId, name: status.name?.zh, error: e });
            console.error(errorMsg);

            if (e.errors) {
                e.errors.forEach(err => {
                    console.error(`   → ${err.path.join('.')}: ${err.message}`);
                });
            } else {
                console.error(`   → ${e.message}`);
            }
        }
    });

    const totalCount = Object.keys(statusDb).length;

    console.log('\n📊 状态验证结果:');
    console.log(`   ✅ 通过: ${validCount}/${totalCount}`);
    console.log(`   ❌ 失败: ${errors.length}`);

    if (errors.length > 0 && throwOnError) {
        throw new Error(`状态数据验证失败: ${errors.length} 个错误`);
    }

    return { valid: validCount, errors, warnings, total: totalCount };
};

/**
 * 验证所有游戏数据
 */
export const validateAllGameData = async (options = {}) => {
    const { throwOnError = false } = options;

    console.log('🎮 开始验证所有游戏数据...\n');
    console.log('='.repeat(50));

    const results = {
        skills: null,
        statuses: null,
        timestamp: new Date().toISOString()
    };

    try {
        // 动态导入数据（避免循环依赖）
        // 注意：这些导入需要在支持 Vite 别名的环境中运行（如浏览器或 Vite dev server）
        // 如果在 Node.js 中运行，可能需要配置路径解析
        const { skillsDb } = await import('../skills.js');
        const { statusDb } = await import('../status.js');

        // 验证技能
        results.skills = validateSkillsDb(skillsDb, throwOnError);
        console.log('='.repeat(50));

        // 验证状态
        results.statuses = validateStatusDb(statusDb, throwOnError);
        console.log('='.repeat(50));

        // 总结
        const totalValid = results.skills.valid + results.statuses.valid;
        const totalErrors = results.skills.errors.length + results.statuses.errors.length;
        const totalCount = results.skills.total + results.statuses.total;

        console.log('\n✨ 总体验证结果:');
        console.log(`   📝 总数: ${totalCount}`);
        console.log(`   ✅ 通过: ${totalValid}`);
        console.log(`   ❌ 失败: ${totalErrors}`);
        console.log(`   📊 成功率: ${((totalValid / totalCount) * 100).toFixed(2)}%`);

        if (totalErrors === 0) {
            console.log('\n🎉 恭喜！所有数据验证通过！');
        } else {
            console.log('\n⚠️  发现错误，请修复后重试。');
        }

    } catch (e) {
        console.error('\n💥 验证过程中出现错误:');
        console.error(e);

        if (throwOnError) {
            throw e;
        }
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
