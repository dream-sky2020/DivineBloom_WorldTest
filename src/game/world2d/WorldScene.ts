import { EntityManager } from '@definitions'
import { getSystem } from '@world2d/SystemRegistry'
import { clearWorld, floatingTextQueue, world } from '@world2d/runtime/WorldEcsRuntime'
import { GlobalEntity } from '@entities'
import { editorManager } from '../editor/core/EditorCore'
import { createLogger } from '@/utils/logger'
import { GameEngine } from './GameEngine'
import { Renderer2D } from './Renderer2D'
import { SceneManager } from './SceneManager'
import { GameManager } from './GameManager'
import type { SystemContextBase } from '@definitions/interface/SystemContext'
import { setFrameContext, setHostState, setRuntimeService, setSceneState } from './bridge/ExternalBridge'
import { buildWorldSceneSystems } from './WorldScenePipelineConfig'

const logger = createLogger('WorldScene')

export interface StateProvider {
    gameManager?: GameManager;
    sceneManager?: SceneManager;
    worldStore?: any;
    [key: string]: any;
}

export class WorldScene {
    engine: GameEngine;
    stateProvider: StateProvider;
    mapData: any;
    entryId: string;
    systems: any; // Complex system structure
    lastDt: number;
    player: any;
    editMode: boolean;
    isTransitioning: boolean = false;

    /**
     * @param {GameEngine} engine 
     * @param {object} [initialState]
     * @param {object} [mapData]
     * @param {string} [entryId]
     * @param {Object} [stateProvider]
     */
    constructor(
        engine: GameEngine,
        initialState: any = null,
        mapData: any = null,
        entryId: string = 'default',
        stateProvider: StateProvider | null = null
    ) {
        // Clear ECS world on scene init to prevent stale entities
        clearWorld()

        this.engine = engine
        this.stateProvider = stateProvider || {}

        this.mapData = mapData || {}
        this.entryId = entryId

        // 系统顺序与阶段由配置对象声明，WorldScene 只负责执行
        this.systems = buildWorldSceneSystems(getSystem)

        // 初始化 Environment System
        this.systems.init.forEach((sys: any) => {
            if (sys?.init) sys.init(this.mapData)
        })

        // 预排序渲染管线
        this._sortRenderPipeline()

        // Time delta for animation
        this.lastDt = 0.016

        // Convenience reference (populated during load)
        this.player = null

        this.editMode = false

        // Initialize Global Entities (Command Queue)
        this._initGlobalEntities()
    }

    /**
     * 对渲染管线按 LAYER 排序
     */
    _sortRenderPipeline() {
        this.systems.render.sort((a: any, b: any) => (a?.LAYER || 0) - (b?.LAYER || 0))
    }

    _initGlobalEntities() {
        const existing = world.with('globalManager').first
        if (!existing) {
            GlobalEntity.create({
                inputState: { lastPressed: {} },
                timer: { totalTime: 0, running: true }
            })
        }
    }

    /**
     * Map Loaded Callback
     */
    onMapLoaded(mapData: any) {
        this.systems.init.forEach((sys: any) => {
            if (sys?.init) sys.init(mapData)
        })

        logger.info('Map systems reinitialized')
    }

    /**
     * 进入编辑模式
     */
    enterEditMode() {
        this.editMode = true
        // 将编辑器渲染系统加入主管线
        this.systems.editor.render.forEach((sys: any) => {
            if (!this.systems.render.includes(sys)) {
                this.systems.render.push(sys)
            }
        })
        this._sortRenderPipeline()
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        this.editMode = false
        // 从主管线移除编辑器渲染系统
        this.systems.render = this.systems.render.filter((s: any) => !this.systems.editor.render.includes(s))

        // 重置交互状态
        const editorInteraction = this.systems.editor.interaction[0]
        if (editorInteraction) {
            editorInteraction.selectedEntity = null
            editorInteraction.isDragging = false
        }
        editorManager.selectedEntity = null
    }

    /**
     * Serialize the current scene state (entities)
     */
    serialize() {
        const entitiesData = []
        for (const entity of world) {
            if (entity.globalManager) continue;
            const item = EntityManager.serialize(entity)
            if (item) {
                entitiesData.push(item)
            }
        }
        return {
            isInitialized: true,
            entities: entitiesData
        }
    }

    /**
     * 销毁场景，释放资源防止内存泄漏
     */
    destroy() {
        logger.info('Destroying scene...')

        // 1. 清理引用
        this.player = null
        // @ts-ignore
        this.engine = null
        // @ts-ignore
        this.stateProvider = null
        this.mapData = null

        // 2. 清理系统
        this.systems.logic = null
        this.systems.render = null
        this.systems.editor = null
        this.systems = null

        // 3. 清理 ECS 世界 (如果这是当前唯一的场景)
        clearWorld()
    }

    /**
     * @param {number} dt 
     */
    update(dt: number) {
        this.lastDt = dt
        const gameManager = this.stateProvider.gameManager
        const sceneManager = this.stateProvider.sceneManager
        const worldStore = this.stateProvider.worldStore
        const baseCtx: SystemContextBase = {
            engine: this.engine,
            input: this.engine.input,
            renderer: this.engine.renderer,
            gameManager,
            sceneManager,
            worldStore,
            mapData: this.mapData
        }
        const hostState = gameManager?.state
        setHostState({
            system: hostState?.system,
            isPaused: hostState?.isPaused,
            isInitialized: true
        })
        setSceneState({
            mapId: this.mapData?.id,
            entryId: this.entryId,
            editMode: this.editMode,
            isTransitioning: this.isTransitioning,
            mapData: this.mapData
        })
        setFrameContext({
            dt,
            timestamp: Date.now(),
            engine: this.engine,
            input: this.engine.input,
            renderer: this.engine.renderer,
            viewport: { width: this.engine.width, height: this.engine.height },
            gameManager,
            sceneManager,
            worldStore,
            mapData: this.mapData
        })
        setRuntimeService('gameManager', gameManager)
        setRuntimeService('sceneManager', sceneManager)
        setRuntimeService('worldStore', worldStore)

        // 1. 始终运行的系统 (动画、时间等)
        this.systems.always.visualRender?.update(dt, baseCtx)
        this.systems.always.time?.update(dt, baseCtx)
        floatingTextQueue.update(dt)

        // 2. 编辑器模式逻辑
        if (this.editMode) {
            // 编辑器感官 (Input + Mouse)
            this.systems.editor.sense.forEach((s: any) => s.update(dt, baseCtx))
            // 编辑器交互 (Drag/Select)
            this.systems.editor.interaction.forEach((s: any) => s.update(dt, baseCtx))
        }

        // 3. 编辑器命令处理 (始终执行，不受暂停影响)
        // 这样可以确保编辑器的删除、保存等操作能够立即响应
        this.systems.always.execute?.update(dt, baseCtx)

        // 4. 基础游戏逻辑 (受暂停影响)
        const isPaused = this.stateProvider.gameManager && this.stateProvider.gameManager.state.isPaused

        if (!isPaused && !this.isTransitioning) {
            // 如果不在编辑模式，才更新常规输入感知
            if (!this.editMode) {
                this.systems.always.inputSense?.update(dt, baseCtx)
            }

            // 核心逻辑阶段驱动
            this.systems.logicPhaseOrder.forEach((phase: any) => {
                this.systems.logic[phase].forEach((system: any) => {
                    system.update(dt, baseCtx)
                })
            })

            // 生命周期管理阶段
            this.systems.logic.lifecycle.forEach((system: any) => system.update(dt, baseCtx))

            // 物理阶段 (优先从 SceneConfig 组件读取动态数据)
            const sceneConfigEntity = world.with('sceneConfig').first;
            const mapWidth = sceneConfigEntity ? sceneConfigEntity.sceneConfig.width : (this.mapData.width || 800);
            const mapHeight = sceneConfigEntity ? sceneConfigEntity.sceneConfig.height : (this.mapData.height || 600);

            const physicsOptions = {
                ...baseCtx,
                mapBounds: { width: mapWidth, height: mapHeight }
            }
            setSceneState({ mapBounds: physicsOptions.mapBounds })
            setFrameContext({ mapBounds: physicsOptions.mapBounds })
            this.systems.logic.physics.forEach((system: any) => system.update(dt, physicsOptions))

            // 5. 更新相机 (在物理和逻辑之后)
            this.systems.always.camera?.update(dt, {
                ...baseCtx,
                viewportWidth: this.engine.width,
                viewportHeight: this.engine.height,
                mapBounds: { width: mapWidth, height: mapHeight }
            })
        }

        // 6. 场景管理 (始终运行以处理切换请求)
        this._updateSceneManagement()
    }

    /**
     * 处理场景切换和管理器更新
     */
    _updateSceneManagement() {
        if (this.stateProvider.sceneManager) {
            const transitionEntity = world.with('sceneTransition').first
            if (transitionEntity) {
                const request = transitionEntity.sceneTransition
                this.stateProvider.sceneManager.requestSwitchMap(request.mapId, request.entryId)
                world.removeComponent(transitionEntity, 'sceneTransition')
            }
            this.stateProvider.sceneManager.update()
        }
    }

    /**
     * @param {Renderer2D} renderer 
     */
    draw(renderer: Renderer2D) {
        // 同步相机状态到渲染器
        const globalEntity = world.with('globalManager').first
        if (globalEntity && globalEntity.camera) {
            renderer.setCamera(globalEntity.camera.x, globalEntity.camera.y)
        }

        // 自动渲染管线驱动
        for (const system of this.systems.render) {
            if (system.draw) {
                system.draw(renderer)
            }
        }
    }
}
