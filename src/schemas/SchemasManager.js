/**
 * 游戏数据 Schema 总管 (SchemasManager)
 * 核心职责：
 * 1. 按照严格的依赖顺序初始化所有静态游戏数据
 * 2. 统一管理实体注册表 (EntityRegistry)
 * 3. 打破模块间的循环引用
 * 4. 提供全局唯一的数据访问入口
 */

import { EntityRegistry, createMapValidator, createValidator } from './common.js';
import { TagSchema } from './resources/tag.js';
import { ItemSchema } from './resources/item.js';
import { StatusSchema } from './resources/status.js';
import { SkillSchema } from './resources/skill.js';
import { CharacterSchema } from './resources/character.js';
import { MapSchema } from './resources/map.js';
import { LocaleRootSchema } from './locales.js';
import { AssetManifest } from './assets.js';
import { Visuals } from './visuals.js';

// 导出所有 Zod 定义，使 SchemasManager 成为单一入口
export * from './registry.js';

class SchemasManager {
    constructor() {
        this._initialized = false;
        this._databases = {
            tags: {},
            items: {},
            status: {},
            skills: {},
            characters: {},
            dialogues: {},
            assets: AssetManifest,
            visuals: Visuals,
            locales: {},
            maps: {
                village: () => import('@data/maps/village').then(m => m.village),
                forest: () => import('@data/maps/forest').then(m => m.forest),
                demo_plains: () => import('@data/maps/demo_plains').then(m => m.demo_plains)
            }
        };

        // 验证器映射
        this._validators = {
            tags: createMapValidator(TagSchema, 'TagsDb'),
            items: createMapValidator(ItemSchema, 'ItemsDb'),
            status: createMapValidator(StatusSchema, 'StatusDb'),
            skills: createMapValidator(SkillSchema, 'SkillsDb'),
            characters: createMapValidator(CharacterSchema, 'CharactersDb'),
            map: createValidator(MapSchema, 'MapData'),
            locales: createValidator(LocaleRootSchema, 'Locales')
        };
    }

    /**
     * 初始化所有静态数据
     * 强制执行正确的依赖注册顺序以防止校验失败
     */
    init() {
        if (this._initialized) return;

        console.log('🚀 [SchemasManager] 正在执行全量数据初始化与校验...');

        // 1. 扫描所有原始数据模块 (Vite Glob)
        const tagModules = import.meta.glob('@data/tags/*.js', { eager: true });
        const statusModules = import.meta.glob('@data/status/*.js', { eager: true });
        const itemModules = import.meta.glob('@data/items/*.js', { eager: true });
        const skillModules = import.meta.glob('@data/skills/*.js', { eager: true });
        const charModules = import.meta.glob('@data/characters/*.js', { eager: true });
        const dialogueModules = import.meta.glob('@data/dialogues/*.js', { eager: true });

        // 2. 按顺序执行初始化（解决引用依赖）

        // --- 阶段 1: 标签 (Tags) ---
        this._databases.tags = this._mergeModules(tagModules);
        EntityRegistry.register('tags', Object.keys(this._databases.tags));
        this._databases.tags = this._validators.tags(this._databases.tags);

        // --- 阶段 2: 状态 (Status) ---
        this._databases.status = this._mergeModules(statusModules);
        EntityRegistry.register('status', Object.keys(this._databases.status));
        this._databases.status = this._validators.status(this._databases.status);

        // --- 阶段 3: 物品 (Items) ---
        this._databases.items = this._mergeModules(itemModules);
        EntityRegistry.register('items', Object.keys(this._databases.items));
        this._databases.items = this._validators.items(this._databases.items);

        // --- 阶段 4: 技能 (Skills) ---
        this._databases.skills = this._mergeModules(skillModules);
        EntityRegistry.register('skills', Object.keys(this._databases.skills));
        this._databases.skills = this._validators.skills(this._databases.skills);

        // --- 阶段 5: 角色 (Characters) ---
        this._databases.characters = this._mergeModules(charModules);
        EntityRegistry.register('characters', Object.keys(this._databases.characters));
        this._databases.characters = this._validators.characters(this._databases.characters);

        // --- 阶段 6: 对话 (Dialogues) ---
        this._databases.dialogues = this._loadDialogues(dialogueModules);

        this._initialized = true;
        console.log('✅ [SchemasManager] 数据管理系统初始化成功');
    }

    /**
     * 内部辅助：合并 Glob 导入的模块
     */
    _mergeModules(modules) {
        const data = {};
        for (const path in modules) {
            const mod = modules[path];
            Object.assign(data, mod.default || mod);
        }
        return data;
    }

    /**
     * 内部辅助：加载对话脚本（包含命名导出处理）
     */
    _loadDialogues(modules) {
        const db = {};
        for (const path in modules) {
            const mod = modules[path];
            if (mod.default && typeof mod.default === 'object') {
                Object.assign(db, mod.default);
            }
            Object.keys(mod).forEach(key => {
                if (key !== 'default' && typeof mod[key] === 'function') {
                    db[key] = mod[key];
                }
            });
        }
        return db;
    }

    /**
     * 获取数据前的延迟初始化检查
     */
    _ensureInit() {
        if (!this._initialized) {
            this.init();
        }
    }

    // --- 公共数据访问接口 ---

    get tags() { this._ensureInit(); return this._databases.tags; }
    get status() { this._ensureInit(); return this._databases.status; }
    get items() { this._ensureInit(); return this._databases.items; }
    get skills() { this._ensureInit(); return this._databases.skills; }
    get characters() { this._ensureInit(); return this._databases.characters; }
    get dialogues() { this._ensureInit(); return this._databases.dialogues; }
    get visuals() { this._ensureInit(); return this._databases.visuals; }
    get assets() { this._ensureInit(); return this._databases.assets; }
    get mapIds() { return Object.keys(this._databases.maps); }
    get mapLoaders() { return this._databases.maps; }

    // --- 单体查询快捷方法 ---
    getTag(id) { return this.tags[id]; }
    getStatus(id) { return this.status[id]; }
    getItem(id) { return this.items[id]; }
    getSkill(id) { return this.skills[id]; }
    getCharacter(id) { return this.characters[id]; }
    getDialogue(id) { return this.dialogues[id]; }
    getVisual(id) { return this.visuals[id] || this.visuals['default']; }

    /**
     * 地图数据采用异步延迟加载
     */
    async getMapData(mapId) {
        // 由于地图数据通常很大，保持其异步加载特性
        const loader = this._databases.maps[mapId];
        if (!loader) {
            console.warn(`[SchemasManager] Map ID not found: ${mapId}`);
            return null;
        }

        const data = await loader();
        return this._validators.map.parse(data);
    }
}

// 导出单例
export const schemasManager = new SchemasManager();
