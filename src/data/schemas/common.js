import { z } from 'zod';
import { ValidationConfig, isStrictMode } from './config.js';

// --- 通用定义 ---
export const ID = z.union([z.string(), z.number()]);

// 多语言字符串 Schema
export const LocalizedStringSchema = z.object({
    zh: z.string(),
    'zh-TW': z.string().optional(),
    en: z.string().optional(), // 暂时设为可选，以防部分数据缺失
    ja: z.string().optional(),
    ko: z.string().optional()
});

// 基础属性 Schema
export const StatsSchema = z.object({
    hp: z.number().optional(),
    mp: z.number().optional(),
    str: z.number().optional(),
    def: z.number().optional(),
    mag: z.number().optional(),
    spd: z.number().optional()
});

// 验证函数生成器
export const createValidator = (schema, name) => (data) => {
    try {
        return schema.parse(data);
    } catch (e) {
        if (isStrictMode()) {
            // 严格模式：抛出错误
            console.error(`🚨 Schema Validation Error in [${name}]:`);
            console.error(e.format ? e.format() : e);
            throw new Error(`Data Validation Failed: ${name}`);
        } else {
            // 宽松模式：只显示警告
            console.warn(`⚠️ Schema Validation Warning in [${name}]:`);
            if (ValidationConfig.showDetailedErrors && e.errors && e.errors.length > 0) {
                console.warn('Errors:', e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '));
            }
            // 返回原始数据，让应用继续运行
            return data;
        }
    }
};

export const createMapValidator = (schema, collectionName) => (collection) => {
    const validCollection = {};
    let errorCount = 0;

    Object.entries(collection).forEach(([key, item]) => {
        try {
            validCollection[key] = schema.parse(item);
        } catch (e) {
            errorCount++;

            if (isStrictMode()) {
                // 严格模式：抛出错误
                console.error(`🚨 Schema Validation Error in [${collectionName} -> ${key}]:`);
                console.error(e.format ? e.format() : e);
                throw new Error(`Data Validation Failed: ${collectionName}[${key}]`);
            } else {
                // 宽松模式：只显示警告
                console.warn(`⚠️ Schema Validation Warning in [${collectionName} -> ${key}]:`);
                if (ValidationConfig.showDetailedErrors && e.errors && e.errors.length > 0) {
                    console.warn('Errors:', e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '));
                }
                // 即使验证失败，也使用原始数据
                validCollection[key] = item;
            }
        }
    });

    if (errorCount > 0 && !isStrictMode()) {
        console.warn(`⚠️ ${collectionName}: ${errorCount} item(s) failed validation but will continue to work.`);
        console.warn('💡 Use Dev Tools (Ctrl+Shift+D) to see detailed validation results and fix issues.');
    }

    return validCollection;
}

