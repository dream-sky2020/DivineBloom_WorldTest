/**
 * 实体模板注册表
 * 
 * 统一管理所有可创建的实体类型，提供模板信息供编辑器使用
 */

import {
    NPCEntity,
    DecorationEntity,
    ObstacleEntity,
    PortalEntity,
    PortalDestinationEntity,
    EnemyEntity,
    BackgroundEntity,
    HordeEnemySpawnerEntity
} from '@entities'

/**
 * 实体模板定义
 * @typedef {Object} EntityTemplate
 * @property {string} id - 模板唯一标识
 * @property {string} name - 显示名称
 * @property {string} description - 描述
 * @property {string} icon - 图标 emoji
 * @property {string} category - 分类（gameplay, environment, system）
 * @property {Function} factory - 工厂函数
 * @property {Function} getDefaultData - 获取默认数据
 * @property {Object} schema - Zod Schema（可选）
 */

export class EntityTemplateRegistry {
    constructor() {
        this.templates = new Map()
        this._initializeTemplates()
    }

    /**
     * 初始化所有实体模板
     */
    _initializeTemplates() {
        this.register({
            id: 'background_ground',
            name: '地面',
            description: '背景地面层',
            icon: '⬛',
            category: 'environment',
            factory: BackgroundEntity.create.bind(BackgroundEntity),
            getDefaultData: (mousePos) => ({
                width: 200,
                height: 200,
                color: '#cccccc',
                tileScale: 1.0
            })
        })

        // 🎮 游戏玩法实体
        this.register({
            id: 'npc',
            name: 'NPC',
            description: '可交互的非玩家角色，支持对话和任务',
            icon: '🧑',
            category: 'gameplay',
            factory: NPCEntity.create.bind(NPCEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                name: 'NPC',
                config: {
                    dialogueId: 'welcome',
                    spriteId: 'npc_guide',
                    range: 60,
                    scale: 0.8
                }
            })
        })

        this.register({
            id: 'enemy',
            name: '敌人',
            description: '敌对生物，具有 AI 行为',
            icon: '👾',
            category: 'gameplay',
            factory: EnemyEntity.create.bind(EnemyEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                options: {
                    spriteId: 'slime_blue',
                    aiType: 'patrol',
                    visionRadius: 150
                }
            })
        })

        this.register({
            id: 'horde_enemy_spawner',
            name: '怪潮生成器',
            description: '监听波次信号并生成怪潮敌人',
            icon: '🌀',
            category: 'gameplay',
            factory: HordeEnemySpawnerEntity.create.bind(HordeEnemySpawnerEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                signal: 'wave_spawn_1',
                enemyOptions: {
                    spriteId: 'enemy_slime',
                    strategy: 'chase',
                    baseSpeed: 80,
                    visionRadius: 500,
                    maxHealth: 50
                }
            })
        })

        this.register({
            id: 'portal',
            name: '传送门',
            description: '场景切换触发器，支持地图间传送',
            icon: '🚪',
            category: 'gameplay',
            factory: PortalEntity.create.bind(PortalEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                targetMapId: 'map_village',
                targetEntryId: 'main_entrance',
                width: 40,
                height: 60
            })
        })

        this.register({
            id: 'portal_destination',
            name: '传送点',
            description: '传送门的目标位置标记',
            icon: '📍',
            category: 'gameplay',
            factory: PortalDestinationEntity.create.bind(PortalDestinationEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                id: `dest_${Date.now()}`, // 使用 id 字段（PortalDestinationEntitySchema 要求）
                name: '传送点'
            })
        })

        // 🌲 环境/装饰实体
        this.register({
            id: 'decoration',
            name: '装饰物',
            description: '静态装饰元素（可选碰撞体）',
            icon: '🎨',
            category: 'environment',
            factory: DecorationEntity.create.bind(DecorationEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                name: '装饰物',
                config: {
                    spriteId: 'tree',
                    scale: 1.0,
                    zIndex: -50
                }
            })
        })

        this.register({
            id: 'obstacle',
            name: '障碍物',
            description: '静态碰撞体，阻挡角色移动',
            icon: '🧱',
            category: 'environment',
            factory: ObstacleEntity.create.bind(ObstacleEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                name: '障碍物',
                width: 40,
                height: 40,
                shape: 'aabb'  // 修改为小写
            })
        })

        // 🎯 特殊实体模板
        this.register({
            id: 'decoration_rect',
            name: '矩形装饰',
            description: '纯色矩形装饰，适合快速原型',
            icon: '⬜',
            category: 'environment',
            factory: DecorationEntity.create.bind(DecorationEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                name: '矩形装饰',
                config: {
                    rect: {
                        width: 100,
                        height: 100,
                        color: '#3b82f6'
                    },
                    zIndex: -50
                }
            })
        })

        this.register({
            id: 'obstacle_circle',
            name: '圆形障碍',
            description: '圆形碰撞体',
            icon: '⭕',
            category: 'environment',
            factory: ObstacleEntity.create.bind(ObstacleEntity),
            getDefaultData: (mousePos) => ({
                x: mousePos?.x || 400,
                y: mousePos?.y || 300,
                name: '圆形障碍',
                radius: 30,
                shape: 'circle'  // 修改为小写
            })
        })
    }

    /**
     * 注册实体模板
     * @param {EntityTemplate} template 
     */
    register(template) {
        if (!template.id || !template.factory) {
            console.error('[EntityTemplateRegistry] Invalid template:', template)
            return
        }
        this.templates.set(template.id, template)
    }

    /**
     * 获取模板
     * @param {string} id 
     * @returns {EntityTemplate|null}
     */
    get(id) {
        return this.templates.get(id) || null
    }

    /**
     * 获取所有模板
     * @returns {EntityTemplate[]}
     */
    getAll() {
        return Array.from(this.templates.values())
    }

    /**
     * 按分类获取模板
     * @param {string} category 
     * @returns {EntityTemplate[]}
     */
    getByCategory(category) {
        return this.getAll().filter(t => t.category === category)
    }

    /**
     * 获取所有分类
     * @returns {string[]}
     */
    getCategories() {
        const categories = new Set()
        for (const template of this.templates.values()) {
            categories.add(template.category)
        }
        return Array.from(categories)
    }

    /**
     * 使用模板创建实体
     * @param {string} templateId 
     * @param {Object} customData 自定义数据（覆盖默认值）
     * @param {Object} mousePos 鼠标位置（用于放置实体）
     * @returns {Object|null} 创建的实体
     */
    createEntity(templateId, customData = {}, mousePos = null) {
        const template = this.get(templateId)
        if (!template) {
            console.error(`[EntityTemplateRegistry] Template not found: ${templateId}`)
            return null
        }

        const defaultData = template.getDefaultData(mousePos)
        const finalData = { ...defaultData, ...customData }

        try {
            return template.factory(finalData)
        } catch (error) {
            console.error(`[EntityTemplateRegistry] Failed to create entity from template ${templateId}:`, error)
            return null
        }
    }
}

// 单例导出
export const entityTemplateRegistry = new EntityTemplateRegistry()
