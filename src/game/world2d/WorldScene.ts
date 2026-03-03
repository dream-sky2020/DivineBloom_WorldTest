import { EntityManager } from '@definitions'
import { getSystem } from '@world2d/SystemRegistry'
import { clearWorld, floatingTextQueue, world } from '@world2d/runtime/WorldEcsRuntime'
import { GlobalEntity } from '@entities'
import { editorManager } from '../editor/core/EditorCore'
import { createLogger } from '@/utils/logger'
import { GameEngine } from './GameEngine'
import { SceneManager } from './SceneManager'
import { GameManager } from './GameManager'
import type { SystemContextBase } from '@definitions/interface/SystemContext'
import { setFrameContext, setHostState, setRuntimeService, setSceneState } from './bridge/ExternalBridge'
import { buildWorldSceneSystems, type WorldSceneSystems } from './WorldScenePipelineConfig'
import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy'
import { ISystem } from '@definitions/interface/ISystem'
import { RenderPipeline } from './render/pipeline'
import type { CameraControllerLike, RenderContext } from './render/core'

const logger = createLogger('WorldScene')

export interface StateProvider {
    gameManager?: GameManager;
    sceneManager?: SceneManager;
    worldStore?: unknown;
    [key: string]: unknown;
}

type MapDataLike = {
    id?: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
};

type PlayerLike = {
    transform?: {
        x: number;
        y: number;
    };
};

export class WorldScene {
    engine: GameEngine;
    stateProvider: StateProvider;
    mapData: MapDataLike | null;
    entryId: string;
    systems: WorldSceneSystems | null;
    lastDt: number;
    player: PlayerLike | null;
    editMode: boolean;
    isTransitioning: boolean = false;
    renderPipeline: RenderPipeline | null;

    /**
     * @param {GameEngine} engine 
     * @param {object} [initialState]
     * @param {object} [mapData]
     * @param {string} [entryId]
     * @param {Object} [stateProvider]
     */
    constructor(
        engine: GameEngine,
        initialState: unknown = null,
        mapData: MapDataLike | null = null,
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
        this.renderPipeline = new RenderPipeline(this.systems.render)

        // 初始化 Environment System
        this.systems.init.forEach((sys) => {
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
        if (!this.systems || !this.renderPipeline) return
        this.renderPipeline.setPasses(this.systems.render)
        this.renderPipeline.sort()
        this.systems.render = this.renderPipeline.getPasses()
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
    onMapLoaded(mapData: MapDataLike | null) {
        if (!this.systems) return
        this.systems.init.forEach((sys) => {
            if (sys?.init) sys.init(mapData)
        })

        logger.info('Map systems reinitialized')
    }

    /**
     * 进入编辑模式
     */
    enterEditMode() {
        if (!this.systems) return
        const systems = this.systems
        this.editMode = true
        // 将编辑器渲染系统加入主管线
        systems.editor.render.forEach((sys) => {
            if (!systems.render.includes(sys)) {
                systems.render.push(sys)
            }
        })
        this._sortRenderPipeline()
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        if (!this.systems) return
        const systems = this.systems
        this.editMode = false
        // 从主管线移除编辑器渲染系统
        systems.render = systems.render.filter((s) => !systems.editor.render.includes(s))
        this._sortRenderPipeline()

        // 重置交互状态
        const editorInteraction = systems.editor.interaction[0] as
            | (ISystem & { selectedEntity?: unknown; isDragging?: boolean })
            | undefined
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
        this.systems = null
        this.renderPipeline = null

        // 3. 清理 ECS 世界 (如果这是当前唯一的场景)
        clearWorld()
    }

    /**
     * @param {number} dt 
     */
    update(dt: number) {
        if (!this.systems) return
        const systems = this.systems
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
        const isPaused = hostState?.isPaused || false;
        // 这里的 isHardPause 需要 GameEngine 支持 manualStep 标志，目前暂时没有，默认为 false
        // 如果想要支持硬暂停，可以从 gameManager 或 engine 获取
        const isHardPause = false; 

        setHostState({
            system: hostState?.system,
            isPaused: isPaused,
            isInitialized: true
        })
        const mapId = typeof this.mapData?.id === 'string' ? this.mapData.id : undefined
        setSceneState({
            mapId,
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

        // 核心：基于 ExecutionPolicy 的通用执行器
        const executeSystem = (system: ISystem) => {
            if (!system.update) return;

            const policy = system.executionPolicy;

            // 1. HardStop: 硬暂停时必须停止 (如时间流逝)
            if (policy === ExecutionPolicy.HardStop && isHardPause) {
                return;
            }

            // 2. RunningOnly: 软暂停时也停止 (如游戏逻辑)
            if (policy === ExecutionPolicy.RunningOnly && (isPaused || isHardPause || this.isTransitioning)) {
                return;
            }

            // 3. EditorOnly: 仅在编辑模式下运行
            if (policy === ExecutionPolicy.EditorOnly && !this.editMode) {
                return;
            }

            // 4. Always: 只要不是 HardStop 且被 HardPause 拦截，就运行
            // (如果没有 policy 默认为 Always，除非有特殊逻辑)
            
            // 执行系统
            system.update(dt, baseCtx);
        };

        // --- 1. 始终运行的系统 (如输入感知、渲染准备) ---
        // 注意：InputSense 即使是 Always，在逻辑上也不应该在暂停时产生 Game Play 输入，
        // 但 InputSense 本身只负责"读取硬件状态"，是否响应由 Intent 系统决定 (RunningOnly)。
        systems.always.visualRender && executeSystem(systems.always.visualRender);
        systems.always.time && executeSystem(systems.always.time);
        systems.always.inputSense && executeSystem(systems.always.inputSense);
        systems.always.execute && executeSystem(systems.always.execute); // Command 处理

        // 浮动文字队列更新 (非 System，直接调用)
        if (!isPaused && !isHardPause) {
             floatingTextQueue.update(dt);
        }

        // --- 2. 编辑器系统 ---
        // executeSystem 内部会检查 EditorOnly 和 this.editMode
        systems.editor.sense.forEach(executeSystem);
        systems.editor.interaction.forEach(executeSystem);

        // --- 3. 游戏核心逻辑 ---
        // 依次执行各个阶段，executeSystem 会自动处理 RunningOnly 过滤
        systems.logicPhaseOrder.forEach((phase) => {
            systems.logic[phase].forEach(executeSystem)
        })

        systems.logic.lifecycle.forEach(executeSystem);
        systems.logic.execution.forEach(executeSystem);

        // --- 4. 物理与相机 ---
        // 准备物理上下文 (包含 mapBounds)
        const sceneConfigEntity = world.with('sceneConfig').first;
        const mapWidth = sceneConfigEntity ? sceneConfigEntity.sceneConfig.width : (Number(this.mapData?.width) || 800);
        const mapHeight = sceneConfigEntity ? sceneConfigEntity.sceneConfig.height : (Number(this.mapData?.height) || 600);
        
        const physicsOptions = {
            ...baseCtx,
            mapBounds: { width: mapWidth, height: mapHeight }
        }
        // 更新 bounds 到全局状态
        setSceneState({ mapBounds: physicsOptions.mapBounds })
        setFrameContext({ mapBounds: physicsOptions.mapBounds })

        // 执行物理系统
        systems.logic.physics.forEach((system: ISystem) => {
             // 物理系统需要特殊的 context (包含 mapBounds)
             // 我们手动检查 policy，然后调用 update
             if (!system.update) return;
             const policy = system.executionPolicy;
             if (policy === ExecutionPolicy.RunningOnly && (isPaused || isHardPause || this.isTransitioning)) return;
             system.update(dt, physicsOptions);
        });

        // 执行相机 (Usually Always or RunningOnly)
        // Camera 需要 physicsOptions (含 mapBounds) 和 viewport
        const cameraCtx = {
            ...baseCtx,
            viewportWidth: this.engine.width,
            viewportHeight: this.engine.height,
            mapBounds: { width: mapWidth, height: mapHeight }
        };
        if (systems.always.camera) {
             // 手动调用以传递 cameraCtx
             const sys = systems.always.camera;
             // Camera is Always run, unless HardStopped (unlikely)
             if (sys.update) sys.update(dt, cameraCtx);
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

    draw(renderer: RenderContext & CameraControllerLike) {
        if (!this.renderPipeline) return
        // 同步相机状态到渲染器
        const globalEntity = world.with('globalManager').first
        if (globalEntity && globalEntity.camera) {
            renderer.setCamera(globalEntity.camera.x, globalEntity.camera.y)
        }

        // 构造渲染上下文并交由统一管线执行
        this.renderPipeline.render(renderer)
    }
}
