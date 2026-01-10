import { z } from 'zod';

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
        console.error(`🚨 Schema Validation Error in [${name}]:`);
        console.error(e.format ? e.format() : e);
        // 在开发环境下，我们希望尽早暴露问题
        throw new Error(`Data Validation Failed: ${name}`);
    }
};

export const createMapValidator = (schema, collectionName) => (collection) => {
    const validCollection = {};
    Object.entries(collection).forEach(([key, item]) => {
        try {
            validCollection[key] = schema.parse(item);
        } catch (e) {
            console.error(`🚨 Schema Validation Error in [${collectionName} -> ${key}]:`);
            console.error(e.format ? e.format() : e);
            throw new Error(`Data Validation Failed: ${collectionName}[${key}]`);
        }
    });
    return validCollection;
}

