#!/usr/bin/env node
/**
 * 数据验证脚本
 * 运行: node scripts/validate-data.js
 * 或: npm run validate-data
 */

import { validateAllGameData } from '../src/data/schemas/validator.js';

console.log('🚀 启动数据验证工具...\n');

validateAllGameData({ throwOnError: false })
    .then((results) => {
        const hasErrors = 
            (results.skills?.errors.length || 0) + 
            (results.statuses?.errors.length || 0) > 0;
        
        if (hasErrors) {
            console.log('\n⚠️  发现数据错误，请查看上方详细信息');
            process.exit(1);
        } else {
            console.log('\n✅ 所有数据验证通过！');
            process.exit(0);
        }
    })
    .catch((e) => {
        console.error('\n💥 验证过程异常终止:');
        console.error(e);
        process.exit(1);
    });
