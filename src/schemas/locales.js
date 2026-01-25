import { z } from 'zod';
import { createValidator } from './common.js';
import { LocalizedStringSchema } from './resources/localization.js';

/**
 * 递归校验 Locale 数据结构
 * 翻译文件通常是嵌套的对象，叶子节点必须符合 LocalizedStringSchema (包含 zh, en 等)
 */

// 基础语言键值对校验
const supportedLocales = ['en', 'zh', 'zh-TW', 'ja', 'ko'];

const LocaleNodeSchema = z.lazy(() =>
    z.union([
        // 情况 1: 这是一个翻译叶子节点 (LocalizedStringSchema)
        LocalizedStringSchema,
        // 情况 2: 这是一个嵌套分类 (嵌套对象)
        z.record(z.string(), LocaleNodeSchema)
    ])
);

/**
 * 翻译文件根 Schema
 */
export const LocaleRootSchema = z.record(z.string(), LocaleNodeSchema);

/**
 * Locale 数据验证器
 */
export const validateLocales = createValidator(LocaleRootSchema, 'Locales');
