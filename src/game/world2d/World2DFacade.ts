/**
 * World2D 统一外部接口 (Facade)
 * 
 * 这是 world2d 系统与外部世界的唯一交互入口
 * 所有外部组件（Vue、Stores等）都应该通过这个接口与 world2d 交互
 * 
 * 设计原则：
 * 1. 隐藏内部实现细节（ECS、Systems、Entities等）
 * 2. 提供清晰的 API 和数据格式
 * 3. 统一管理内外部回调注册
 */

import { gameManager } from './GameManager'
import { world } from './world'
import { ScenarioLoader } from './ScenarioLoader'
import { entityTemplateRegistry } from '@definitions/internal/EntityTemplateRegistry'
import { createLogger } from '@/utils/logger'

const logger = createLogger('World2DFacade')

export interface Callbacks {
    onEncounter?: (enemyGroup: any, enemyUuid: any) => void;
    onInteract?: (interaction: any) => void;
    onSwitchMap?: (targetMapId: string) => void;
    onOpenMenu?: () => void;
    onOpenShop?: () => void;
    onStateChange?: () => void;
    [key: string]: any;
}

/**
 * World2D 统一外部接口类
 */
class World2DFacade {
    _gameManager: typeof gameManager;
    _callbacks: Callbacks;

    constructor() {
        // 内部管理器引用（不暴露给外部）
        this._gameManager = gameManager
        this._callbacks = {
            onEncounter: undefined,
            onInteract: undefined,
            onSwitchMap: undefined,
            onOpenMenu: undefined,
            onOpenShop: undefined,
            onStateChange: undefined
        }
    }

    // ==================== 生命周期管理 ====================

    /**
     * 初始化 World2D 系统
     * @param {HTMLCanvasElement} canvas - 渲染画布
     * @returns {void}
     */
    init(canvas: HTMLCanvasElement) {
        logger.info('Initializing World2D system')
        this._gameManager.init(canvas)
    }

    /**
     * 启动世界地图模式
     * @returns {Promise<void>}
     */
    async startWorldMap() {
        logger.info('Starting world map mode')
        await this._gameManager.startWorldMap()
    }

    /**
     * 启动战斗模式
     * @returns {void}
     */
    startBattle() {
        logger.info('Starting battle mode')
        this._gameManager.startBattle()
    }

    /**
     * 暂停游戏
     * @returns {void}
     */
    pause() {
        this._gameManager.pause()
    }

    /**
     * 恢复游戏
     * @returns {void}
     */
    resume() {
        this._gameManager.resume()
    }

    /**
     * 销毁 World2D 系统，释放所有资源
     * @returns {void}
     */
    destroy() {
        logger.info('Destroying World2D system')
        this._gameManager.destroy()
    }

    // ==================== 场景管理 ====================

    /**
     * 加载指定地图
     * @param {string} mapId - 地图 ID
     * @param {string} [entryId='default'] - 入口点 ID
     * @returns {Promise<void>}
     */
    async loadMap(mapId: string, entryId: string = 'default') {
        logger.info(`Loading map: ${mapId}, entry: ${entryId}`)
        await this._gameManager.loadMap(mapId, entryId)
    }

    /**
     * 获取当前场景信息
     * @returns {Object|null} 场景信息 DTO
     */
    getCurrentSceneInfo() {
        const scene = this._gameManager.currentScene.value
        if (!scene) return null

        return {
            mapId: scene.mapData?.id || 'unknown',
            mapName: scene.mapData?.name || 'Unknown Map',
            entryId: scene.entryId,
            hasPlayer: !!scene.player,
            isEditMode: scene.editMode
        }
    }

    /**
     * 序列化当前场景状态
     * @returns {Object|null} 场景状态数据
     */
    serializeCurrentScene() {
        const scene = this._gameManager.currentScene.value
        if (!scene) return null

        return scene.serialize()
    }

    /**
     * 导出当前场景为完整 Bundle
     * @returns {Object|null} 场景 Bundle 数据
     */
    exportCurrentScene() {
        const scene = this._gameManager.currentScene.value
        const engine = this._gameManager.engine
        if (!scene || !engine) return null

        const mapId = scene.mapData?.id || 'unknown'
        return ScenarioLoader.exportScene(engine, mapId)
    }

    // ==================== 状态查询 ====================

    /**
     * 获取当前系统状态
     * @returns {Object} 系统状态 DTO
     */
    getSystemState() {
        return {
            system: this._gameManager.state.system,
            isPaused: this._gameManager.state.isPaused,
            isInitialized: !!this._gameManager.engine
        }
    }

    /**
     * 获取玩家位置信息
     * @returns {Object|null} { x, y } 或 null
     */
    getPlayerPosition() {
        const scene = this._gameManager.currentScene.value
        if (!scene || !scene.player || !scene.player.transform) {
            return null
        }

        return {
            x: scene.player.transform.x,
            y: scene.player.transform.y
        }
    }

    /**
     * 获取调试信息（用于开发工具）
     * @returns {Object} 调试信息 DTO
     */
    getDebugInfo() {
        const scene = this._gameManager.currentScene.value
        const engine = this._gameManager.engine
        const playerPos = this.getPlayerPosition()

        // 获取全局实体的鼠标位置
        const globalEntity = world.with('globalManager', 'mousePosition').first
        // @ts-ignore
        const mousePos = globalEntity?.mousePosition || { worldX: 0, worldY: 0 }

        // 统计追击中的敌人
        let chasingCount = 0
        if (scene) {
            for (const entity of world) {
                if (entity.aiState && entity.aiState.state === 'chase') {
                    chasingCount++
                }
            }
        }

        return {
            playerX: playerPos?.x || 0,
            playerY: playerPos?.y || 0,
            mouseWorldX: mousePos.worldX,
            mouseWorldY: mousePos.worldY,
            lastInput: engine?.input?.lastInput || '',
            chasingCount,
            entityCount: world ? [...world].length : 0,
            // @ts-ignore
            fps: engine?.lastDt ? Math.round(1 / engine.lastDt) : 0
        }
    }

    /**
     * 获取场景中的所有实体（编辑器用）
     * @returns {Array} 实体列表 DTO
     */
    getSceneEntities() {
        const entities = []
        for (const entity of world) {
            if (entity.globalManager) continue // 排除全局实体

            entities.push({
                id: entity.__id,
                type: entity.sprite?.texture || entity.physics?.shape || 'unknown',
                // @ts-ignore
                position: entity.position ? { ...entity.position } : null,
                inspector: entity.inspector ? { ...entity.inspector } : null,
                // 不暴露完整的 entity 对象，只暴露必要信息
            })
        }
        return entities
    }

    // ==================== 命令执行 ====================

    /**
     * 在场景中生成实体
     * @param {string} templateId - 实体模板 ID
     * @param {Object} options - 生成选项
     * @returns {boolean} 是否成功
     */
    spawnEntity(templateId: string, options: any) {
        try {
            const entity = entityTemplateRegistry.createEntity(templateId, options)
            if (!entity) {
                logger.warn(`Entity template not found or failed: ${templateId}`)
                return false
            }

            logger.info(`Spawned entity: ${templateId}`, options)
            return true
        } catch (error) {
            logger.error(`Failed to spawn entity: ${templateId}`, error)
            return false
        }
    }

    /**
     * 从场景中移除实体
     * @param {number} entityId - 实体 ID
     * @returns {boolean} 是否成功
     */
    removeEntity(entityId: number) {
        try {
            for (const entity of world) {
                if (entity.__id === entityId) {
                    world.remove(entity)
                    logger.info(`Removed entity: ${entityId}`)
                    return true
                }
            }
            logger.warn(`Entity not found: ${entityId}`)
            return false
        } catch (error) {
            logger.error(`Failed to remove entity: ${entityId}`, error)
            return false
        }
    }

    /**
     * 切换编辑器模式
     * @returns {void}
     */
    toggleEditMode() {
        this._gameManager.toggleEditMode()
    }

    // ==================== 回调注册 ====================

    /**
     * 注册外部回调函数
     * @param {Object} callbacks - 回调函数集合
     */
    registerCallbacks(callbacks: Callbacks) {
        logger.info('Registering external callbacks')
        Object.assign(this._callbacks, callbacks)

        // 将回调传递给 GameManager（通过依赖注入）
        // GameManager 会在创建 WorldScene 时使用这些回调
        if (callbacks.onEncounter) {
            this._gameManager._onEncounter = callbacks.onEncounter.bind(this._gameManager)
        }
        if (callbacks.onInteract) {
            this._gameManager._onInteract = callbacks.onInteract.bind(this._gameManager)
        }
    }

    /**
     * 触发回调（内部系统使用）
     * @private
     */
    _triggerCallback(type: string, ...args: any[]) {
        const callback = this._callbacks[type]
        if (callback && typeof callback === 'function') {
            callback(...args)
        }
    }

    // ==================== 直接访问器（仅用于渐进式迁移） ====================

    /**
     * 获取响应式的当前场景引用（Vue 组件使用）
     * @deprecated 请逐步迁移到使用 API 方法
     * @returns {import('vue').Ref}
     */
    get currentScene() {
        return this._gameManager.currentScene
    }

    /**
     * 获取响应式的系统状态（Vue 组件使用）
     * @deprecated 请逐步迁移到使用 getSystemState()
     * @returns {Object}
     */
    get state() {
        return this._gameManager.state
    }

    /**
     * 获取引擎实例（调试用）
     * @deprecated 请逐步迁移到使用 API 方法
     * @returns {import('./GameEngine').GameEngine}
     */
    get engine() {
        return this._gameManager.engine
    }

    /**
     * 获取编辑器状态（编辑器 UI 使用）
     * @deprecated 请逐步迁移到使用专门的编辑器 API
     * @returns {Object}
     */
    get editor() {
        return this._gameManager.editor
    }

    // ==================== 兼容层：实体模板注册表访问 ====================

    /**
     * 获取实体模板注册表（编辑器用）
     * @deprecated 请使用 spawnEntity() 方法
     * @returns {Object}
     */
    getEntityTemplateRegistry() {
        return entityTemplateRegistry
    }

    /**
     * 获取 ECS World 实例（编辑器/调试用）
     * @deprecated 仅用于渐进式迁移，请尽快迁移到 API 方法
     * @returns {import('miniplex').World}
     */
    getWorld() {
        return world
    }

    /**
     * 获取场景加载器（存档系统用）
     * @deprecated 请使用 exportCurrentScene() 和 serializeCurrentScene()
     * @returns {Object}
     */
    getScenarioLoader() {
        return ScenarioLoader
    }
}

// 创建单例实例
export const world2d = new World2DFacade()

// ==================== 默认导出 ====================
export default world2d
