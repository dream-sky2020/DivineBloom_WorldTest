/**
 * World2D 统一外部接口 (Facade)
 * 
 * 这是 world2d 系统与外部世界的唯一交互入口
 * 所有外部组件（Vue、Stores等）都应该通过这个接口与 world2d 交互
 * 
 * 设计原则：
 * 1. 隐藏内部实现细节（ECS、Systems、Entities等）
 * 2. 提供清晰的 API 和数据格式
 * 3. 统一管理状态输入、命令执行与视图输出
 */

import { gameManager } from './GameManager'
import { world, worldRuntimeStats } from './runtime/WorldEcsRuntime'
import { ScenarioLoader } from './ScenarioLoader'
import { entityTemplateRegistry } from '@definitions/internal/EntityTemplateRegistry'
import { createLogger } from '@/utils/logger'
import { getEntityId } from '@definitions/interface/IEntity'
import {
    clearHostRuntimeState as clearHostRuntimeStateBridge,
    drainCommands as drainExternalCommands,
    enqueueCommand as enqueueExternalCommand,
    getFrameContext as getFrameContextSnapshot,
    getHostState as getHostStateSnapshot,
    getRuntimeService as getRuntimeServiceBridge,
    getRuntimeServices as getRuntimeServicesSnapshot,
    getSceneState as getSceneStateSnapshot,
    getExternalState as getExternalStateSnapshot,
    getViewState as getViewStateSnapshot,
    registerStateSource as registerExternalStateSource,
    setFrameContext as setFrameContextPatch,
    setHostState as setHostStatePatch,
    setRuntimeService as setRuntimeServiceBridge,
    setSceneState as setSceneStatePatch,
    setExternalState as setExternalStatePatch,
    setViewState as setViewStatePatch,
    unregisterStateSource as unregisterExternalStateSource
} from './bridge/ExternalBridge'
import type {
    ExternalState,
    FrameContextState,
    HostState,
    RuntimeServices,
    SceneState,
    ViewState,
    World2DCommand
} from './bridge/ExternalBridge'

export type {
    ExternalState,
    FrameContextState,
    HostState,
    RuntimeServices,
    SceneState,
    ViewState,
    World2DCommand
} from './bridge/ExternalBridge'

const logger = createLogger('World2DFacade')

/**
 * World2D 统一外部接口类
 */
class World2DFacade {
    _gameManager: typeof gameManager;

    constructor() {
        // 内部管理器引用（不暴露给外部）
        this._gameManager = gameManager
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
        setRuntimeServiceBridge('gameManager', this._gameManager)
        setHostStatePatch({
            isInitialized: true,
            system: this._gameManager.state.system,
            isPaused: this._gameManager.state.isPaused
        })
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
        clearHostRuntimeStateBridge()
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

    /**
     * 导出整个项目（编辑器/工具链）
     */
    async exportProject(worldStates: Record<string, any>, mapLoaders: Record<string, any> = {}) {
        const engine = this._gameManager.engine
        if (!engine) return null
        const currentScene = this.exportCurrentScene()
        return {
            header: {
                version: '1.0.0',
                exportTime: new Date().toISOString()
            },
            mapLoaders,
            worldStates,
            currentScene
        }
    }

    /**
     * 导入项目（编辑器/工具链）
     */
    importProject(bundle: any) {
        if (!bundle || typeof bundle !== 'object') return {}
        if (bundle.worldStates && typeof bundle.worldStates === 'object') {
            return bundle.worldStates
        }
        if (bundle.maps && typeof bundle.maps === 'object') {
            return bundle.maps
        }
        return {}
    }

    // ==================== 状态查询 ====================

    /**
     * 获取当前系统状态
     * @returns {Object} 系统状态 DTO
     */
    getSystemState() {
        const state = {
            system: this._gameManager.state.system,
            isPaused: this._gameManager.state.isPaused,
            isInitialized: !!this._gameManager.engine
        }
        setHostStatePatch(state)
        return state
    }

    // ==================== 状态源与命令通道 ====================

    /**
     * 注册外部状态源（UI/Store）
     */
    registerStateSource(sourceId: string, getter: () => Partial<ExternalState> | null | undefined) {
        registerExternalStateSource(sourceId, getter)
    }

    /**
     * 注销外部状态源
     */
    unregisterStateSource(sourceId: string) {
        unregisterExternalStateSource(sourceId)
    }

    /**
     * 直接写入外部输入态（增量）
     */
    setExternalState(patch: Partial<ExternalState>) {
        setExternalStatePatch(patch)
    }

    /**
     * 获取聚合后的输入态快照（内部系统读取）
     */
    getExternalState() {
        return getExternalStateSnapshot()
    }

    /**
     * 写入强动作命令（外部入口）
     */
    enqueueCommand(cmd: World2DCommand) {
        enqueueExternalCommand(cmd)
    }

    /**
     * 消费命令队列（内部系统调用）
     */
    drainCommands(maxPerFrame: number = Number.POSITIVE_INFINITY) {
        return drainExternalCommands(maxPerFrame)
    }

    /**
     * 获取只读视图态（UI 展示）
     */
    getViewState() {
        return getViewStateSnapshot()
    }

    /**
     * 仅内部系统更新视图态（迁移期保持 public）
     */
    setViewState(patch: Partial<ViewState>) {
        setViewStatePatch(patch)
    }

    /**
     * 更新宿主运行态（system/pause/flags）
     */
    setHostState(patch: Partial<HostState>) {
        setHostStatePatch(patch)
    }

    /**
     * 获取宿主运行态快照
     */
    getHostState() {
        return getHostStateSnapshot()
    }

    /**
     * 更新场景运行态（map/edit/transition 等）
     */
    setSceneState(patch: Partial<SceneState>) {
        setSceneStatePatch(patch)
    }

    /**
     * 获取场景运行态快照
     */
    getSceneState() {
        return getSceneStateSnapshot()
    }

    /**
     * 更新每帧上下文快照（引擎/视口/mapBounds 等）
     */
    setFrameContext(patch: Partial<FrameContextState>) {
        setFrameContextPatch(patch)
    }

    /**
     * 获取每帧上下文快照
     */
    getFrameContext() {
        return getFrameContextSnapshot()
    }

    /**
     * 注册运行时服务引用
     */
    setRuntimeService<K extends keyof RuntimeServices>(name: K, value: RuntimeServices[K]) {
        setRuntimeServiceBridge(name, value)
    }

    /**
     * 获取运行时服务引用
     */
    getRuntimeService<K extends keyof RuntimeServices>(name: K) {
        return getRuntimeServiceBridge(name)
    }

    /**
     * 获取所有运行时服务快照
     */
    getRuntimeServices() {
        return getRuntimeServicesSnapshot()
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

        return {
            playerX: playerPos?.x || 0,
            playerY: playerPos?.y || 0,
            mouseWorldX: mousePos.worldX,
            mouseWorldY: mousePos.worldY,
            lastInput: engine?.input?.lastInput || '',
            chasingCount: worldRuntimeStats.chasingEnemyCount || 0,
            entityCount: (world as any)?.entities?.length || 0,
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
            entities.push({
                id: getEntityId(entity),
                name: entity.name,
                globalManager: !!entity.globalManager,
                type: entity.sprite?.texture || entity.physics?.shape || 'unknown',
                // @ts-ignore
                position: entity.position ? { ...entity.position } : null,
                inspector: entity.inspector ? { ...entity.inspector } : null,
                // 不暴露完整的 entity 对象，只暴露必要信息
            })
        }
        return entities
    }

    /**
     * 获取编辑器实体引用（迁移期封装）
     */
    getEditorEntities() {
        return [...world]
    }

    /**
     * 通过 id 获取实体（迁移期封装）
     */
    getEntityById(entityId: string | number) {
        for (const entity of world) {
            const id = getEntityId(entity)
            if (id !== '' && id == entityId) return entity
        }
        return null
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
     * @param {string | number} entityId - 实体 ID
     * @returns {boolean} 是否成功
     */
    removeEntity(entityId: string | number) {
        try {
            for (const entity of world) {
                const id = getEntityId(entity)
                if (id !== '' && id == entityId) {
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

    /**
     * 获取可创建实体模板（编辑器）
     */
    getEntityTemplates() {
        return entityTemplateRegistry.getAll()
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

}

// 创建单例实例
export const world2d = new World2DFacade()

// ==================== 默认导出 ====================
export default world2d
