import { z } from 'zod';
import { ValidationConfig, isStrictMode, LocalizationConfig } from './config.js';
import { createLogger } from '@/utils/logger.js';

const log = createLogger('VALIDATION');

// --- 通用定义 ---
export const ID = z.union([z.string(), z.number()]);

/**
 * 实体注册表 (Entity Registry)
 * 用于在 Schema 校验时检查引用的实体（技能、状态、物品、角色）是否存在，并防止 ID 重复
 */
export const EntityRegistry = {
    _collections: {
        tags: new Set(),
        skills: new Set(),
        items: new Set(),
        status: new Set(),
        characters: new Set()
    },

    /**
     * 校验问题记录 (Issues)
     * 用于 UI 展示，记录重复 ID 或其他非 Zod 校验问题
     */
    _issues: [],

    /**
     * 注册实体 ID
     * @param {string} type - 集合类型 ('skills', 'items', 'status', 'characters', 'tags')
     * @param {string|number|Array} ids 
     */
    register(type, ids) {
        if (!this._collections[type]) {
            log.warn(`尝试注册到未知的集合类型: ${type}`);
            return;
        }

        const idArray = Array.isArray(ids) ? ids : [ids];
        idArray.forEach(id => {
            if (this._collections[type].has(id)) {
                const errorMsg = `发现重复的 ID [${type}]: "${id}"`;
                log.error(`🚨 ${errorMsg}。请确保每个实体的 ID 是唯一的。`);

                // 记录问题供 UI 展示
                this._issues.push({
                    type: 'duplicate_id',
                    collection: type,
                    id,
                    message: errorMsg,
                    severity: 'error'
                });

                if (isStrictMode()) {
                    throw new Error(errorMsg);
                }
            }
            this._collections[type].add(id);
        });
    },

    /**
     * 记录翻译缺失 (Translation Gap)
     * @param {Object} info 
     */
    recordTranslationGap(info) {
        const pathArray = Array.isArray(info.path) ? info.path : [];
        const pathStr = pathArray.length > 0 ? pathArray.join('.') : 'root';
        const missingArray = Array.isArray(info.missing) ? info.missing : [];
        const entityId = info.id || 'unknown';

        this._issues.push({
            type: 'translation_gap',
            severity: info.severity || 'warning',
            id: entityId,
            path: pathStr,
            missing: missingArray,
            message: `实体 [${entityId}] 的路径 [${pathStr}] 缺少语言: ${missingArray.join(', ')}`
        });
    },

    /**
     * 检查实体是否存在
     * @param {string} type 
     * @param {string|number} id 
     * @returns {boolean}
     */
    has(type, id) {
        const exists = this._collections[type] && this._collections[type].has(id);
        if (!exists && id !== undefined && id !== null) {
            // 注意：这里不在 has 中直接记录 issue，因为 refine 会负责产生错误消息
            // has 只是一个查询接口
        }
        return exists;
    },

    /**
     * 获取所有校验问题
     */
    getIssues() {
        return this._issues;
    },

    /**
     * 清空校验问题
     */
    clearIssues() {
        this._issues = [];
    },

    /**
     * 获取所有已注册 ID
     * @param {string} type 
     */
    getAll(type) {
        return Array.from(this._collections[type] || []);
    }
};

/**
 * 兼容旧版的 TagRegistry 接口
 */
export const TagRegistry = {
    register: (ids) => EntityRegistry.register('tags', ids),
    has: (id) => EntityRegistry.has('tags', id),
    getAll: () => EntityRegistry.getAll('tags')
};

/**
 * 创建通用的实体引用校验器生成器
 */
const createReferenceInternal = (type, defaultError) => (errorMessage = defaultError) => {
    return ID.superRefine((id, ctx) => {
        if (!EntityRegistry.has(type, id)) {
            const displayId = (id && typeof id === 'object') ? JSON.stringify(id) : id;
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${errorMessage}: "${displayId}"`,
                fatal: true
            });
        }
    });
};

const createReferencesInternal = (type, defaultError) => (errorMessage = defaultError) => {
    return z.array(ID.nullable()).superRefine((ids, ctx) => {
        if (!Array.isArray(ids)) return;

        const missing = ids.filter(id => id !== null && !EntityRegistry.has(type, id));
        if (missing.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${errorMessage}: ${missing.join(', ')}`,
                fatal: true
            });
        }
    });
};

// --- 具体的引用校验器 ---

// 标签引用
export const createTagReference = createReferenceInternal('tags', "引用了不存在的标签");
export const createTagsReference = createReferencesInternal('tags', "包含了不存在的标签");

// 技能引用
export const createSkillReference = createReferenceInternal('skills', "引用了不存在的技能 ID");
export const createSkillsReference = createReferencesInternal('skills', "包含了不存在的技能 ID");

// 状态引用
export const createStatusReference = createReferenceInternal('status', "引用了不存在的状态 ID");
export const createStatusListReference = createReferencesInternal('status', "包含了不存在的状态 ID");

// 物品引用
export const createItemReference = createReferenceInternal('items', "引用了不存在的物品 ID");
export const createItemsReference = createReferencesInternal('items', "包含了不存在的物品 ID");

// 角色引用
export const createCharacterReference = createReferenceInternal('characters', "引用了不存在的角色 ID");
export const createCharactersReference = createReferencesInternal('characters', "包含了不存在的角色 ID");

// 基础属性 Schema
export const StatsSchema = z.object({
    hp: z.number().optional(),
    mp: z.number().optional(),
    atk: z.number().optional(),
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
            log.error(`🚨 Schema Validation Error in [${name}]:`);
            log.error(e.format ? e.format() : e);
            throw new Error(`Data Validation Failed: ${name}`);
        } else {
            // 宽松模式：只显示警告
            log.warn(`⚠️ Schema Validation Warning in [${name}]:`);
            if (ValidationConfig.showDetailedErrors && e.errors && e.errors.length > 0) {
                log.warn('Errors:', e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '));
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
                log.error(`🚨 Schema Validation Error in [${collectionName} -> ${key}]:`);
                log.error(e.format ? e.format() : e);
                throw new Error(`Data Validation Failed: ${collectionName}[${key}]`);
            } else {
                // 宽松模式：只显示警告
                log.warn(`⚠️ Schema Validation Warning in [${collectionName} -> ${key}]:`);
                if (ValidationConfig.showDetailedErrors && e.errors && e.errors.length > 0) {
                    log.warn('Errors:', e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '));
                }
                // 即使验证失败，也使用原始数据
                validCollection[key] = item;
            }
        }
    });

    if (errorCount > 0 && !isStrictMode()) {
        log.warn(`⚠️ ${collectionName}: ${errorCount} item(s) failed validation but will continue to work.`);
        log.warn('💡 Use Dev Tools (Ctrl+Shift+D) to see detailed validation results and fix issues.');
    }

    return validCollection;
}
