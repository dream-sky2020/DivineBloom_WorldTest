import { z } from 'zod';
import { ID } from '../common.js';
import { LocalizedStringSchema } from './localization.js';

// --- 标签 (Tag) Schema ---
export const TagSchema = z.object({
    id: ID, // 唯一标识符，例如 'tag_fire', 'character_yibitian'
    name: LocalizedStringSchema, // 标签名称 (支持多语言)
    description: LocalizedStringSchema.optional(), // 标签描述 (支持多语言)
    color: z.string().optional().default('#ffffff'), // UI 显示颜色
});
