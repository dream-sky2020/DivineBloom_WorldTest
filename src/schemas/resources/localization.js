import { z } from 'zod';
import { LocalizationConfig } from '../config.js';
import { EntityRegistry } from '../common.js';

/**
 * 多语言字符串 Schema (具备审计功能)
 * 定义了多语言文本的标准结构并自动进行翻译缺失审计
 */
export const LocalizedStringSchema = z.object({
    zh: z.string().min(1, "中文翻译不能为空"),
    'zh-TW': z.string().optional(),
    en: z.string().optional(),
    ja: z.string().optional(),
    ko: z.string().optional()
}).superRefine((data, ctx) => {
    if (!LocalizationConfig.enableAudit) return;

    // 检查核心必须语言 (Error)
    const missingRequired = LocalizationConfig.requiredLanguages.filter(lang => !data[lang]);
    if (missingRequired.length > 0) {
        EntityRegistry.recordTranslationGap({
            path: ctx.path,
            missing: missingRequired,
            severity: 'error'
        });
    }

    // 检查扩展可选语言 (Warning)
    const missingOptional = LocalizationConfig.optionalLanguages.filter(lang => !data[lang]);
    if (missingOptional.length > 0) {
        EntityRegistry.recordTranslationGap({
            path: ctx.path,
            missing: missingOptional,
            severity: 'warning'
        });
    }
});
