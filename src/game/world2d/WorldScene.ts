import { EntityManager } from '@definitions'
import { getSystem } from '@world2d/SystemRegistry'
import { clearWorld, floatingTextQueue, world } from '@world2d/world'
import { GlobalEntity } from '@entities'
import { editorManager } from '../editor/core/EditorCore'
import { createLogger } from '@/utils/logger'
import { GameEngine } from './GameEngine'
import { Renderer2D } from './Renderer2D'
import { SceneManager } from './SceneManager'
import { GameManager } from './GameManager'

const logger = createLogger('WorldScene')

export interface StateProvider {
    gameManager?: GameManager;
    sceneManager?: SceneManager;
    worldStore?: any;
    [key: string]: any;
}

export class WorldScene {
    engine: GameEngine;
    onEncounter: ((enemyGroup: any, enemyUuid: any) => void) | null;
    onSwitchMap: ((targetMapId: string) => void) | null;
    onInteract: ((interaction: any) => void) | null;
    onOpenMenu: (() => void) | null;
    onOpenShop: (() => void) | null;
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
     * @param {Function} [onEncounter]
     * @param {object} [initialState]
     * @param {object} [mapData]
     * @param {string} [entryId]
     * @param {Function} [onSwitchMap]
     * @param {Function} [onInteract]
     * @param {Function} [onOpenMenu]
     * @param {Function} [onOpenShop]
     * @param {Object} [stateProvider]
     */
    constructor(
        engine: GameEngine, 
        onEncounter: ((enemyGroup: any, enemyUuid: any) => void) | null = null, 
        initialState: any = null, 
        mapData: any = null, 
        entryId: string = 'default', 
        onSwitchMap: ((targetMapId: string) => void) | null = null, 
        onInteract: ((interaction: any) => void) | null = null, 
        onOpenMenu: (() => void) | null = null, 
        onOpenShop: (() => void) | null = null, 
        stateProvider: StateProvider | null = null
    ) {
        // Clear ECS world on scene init to prevent stale entities
        clearWorld()

        this.engine = engine
        this.onEncounter = onEncounter
        this.onSwitchMap = onSwitchMap
        this.onInteract = onInteract
        this.onOpenMenu = onOpenMenu
        this.onOpenShop = onOpenShop
        this.stateProvider = stateProvider || {}

        this.mapData = mapData || {}
        this.entryId = entryId

        // 初始化 Environment System
        const detectAreaRender = getSystem('detect-area-render');
        if (detectAreaRender && detectAreaRender.init) detectAreaRender.init(this.mapData)

        const portalDebugRender = getSystem('portal-debug-render');
        if (portalDebugRender && portalDebugRender.init) portalDebugRender.init(this.mapData)

        const aiSense = getSystem('ai-sense');
        if (aiSense && aiSense.init) aiSense.init(this.mapData)

        // 🎯 系统注册表化 (System Registry)
        this.systems = {
            // 逻辑阶段 (Logic Phases)
            logic: {
                sense: [
                    getSystem('damage-detect-sense'),
                    getSystem('portal-detect-sense'),
                    getSystem('weapon-sense'),
                    getSystem('ai-sense'),
                    getSystem('mouse-position-sense')
                ],
                intent: [
                    getSystem('player-intent'),
                    getSystem('weapon-intent'),
                    getSystem('portal-intent'),
                    getSystem('enemy-ai-intent')
                ],
                decision: [
                    getSystem('wave-emitter'),
                    getSystem('trigger')
                ],
                control: [
                    getSystem('player-control'),
                    getSystem('portal-control'),
                    getSystem('enemy-control'),
                    getSystem('follow'),
                    getSystem('weapon-control'),
                    getSystem('damage-process'),
                    getSystem('damage-apply')
                ],
                physics: [
                    getSystem('movement'),
                    getSystem('bound'),
                    getSystem('sync-transform'),
                    getSystem('collision'),
                    getSystem('sync-transform')
                ],
                lifecycle: [
                    getSystem('health-cleanup'),
                    getSystem('lifetime')
                ],
                execution: [
                    getSystem('execute')
                ]
            },
            // 渲染管线 (Render Pipeline)
            render: [
                // getSystem('background-render'),      // Layer 10 (Merged into VisualRenderSystem)
                getSystem('ai-patrol-debug-render'), // Layer 12
                getSystem('ai-vision-render'),       // Layer 15
                getSystem('visual-render'),          // Layer 20
                getSystem('status-render'),          // Layer 30
                getSystem('floating-text-render'),   // Layer 40
                getSystem('physics-debug-render'),   // Layer 110
                getSystem('detect-area-render'),     // Layer 100 (Debug)
                getSystem('portal-debug-render'),    // Layer 105 (Portal Debug)
                getSystem('weapon-debug-render')     // Layer 115 (Weapon Debug)
            ],
            // 编辑器阶段 (Editor Phases)
            editor: {
                sense: [
                    getSystem('input-sense'),
                    getSystem('mouse-position-sense')
                ],
                interaction: [
                    getSystem('editor-interaction')
                ],
                render: [
                    getSystem('editor-grid-render'),
                    getSystem('editor-highlight-render')
                ]
            }
        }

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
        const detectAreaRender = getSystem('detect-area-render');
        if (detectAreaRender && detectAreaRender.init) detectAreaRender.init(mapData);

        const portalDebugRender = getSystem('portal-debug-render');
        if (portalDebugRender && portalDebugRender.init) portalDebugRender.init(mapData);

        const aiSense = getSystem('ai-sense');
        if (aiSense && aiSense.init) aiSense.init(mapData);
        
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
        const editorInteraction = getSystem('editor-interaction')
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

        // 1. 始终运行的系统 (动画、时间等)
        getSystem('visual-render').update(dt)
        getSystem('time').update(dt)
        floatingTextQueue.update(dt)

        // 2. 编辑器模式逻辑
        if (this.editMode) {
            // 编辑器感官 (Input + Mouse)
            this.systems.editor.sense.forEach((s: any) => s.update(dt, this.engine.input || this.engine))
            // 编辑器交互 (Drag/Select)
            this.systems.editor.interaction.forEach((s: any) => s.update(dt, this.engine, this.stateProvider.gameManager))
        }

        // 3. 编辑器命令处理 (始终执行，不受暂停影响)
        // 这样可以确保编辑器的删除、保存等操作能够立即响应
        getSystem('execute').update(dt, {
            onEncounter: this.onEncounter,
            onSwitchMap: null,
            onInteract: this.onInteract,
            onOpenMenu: this.onOpenMenu,
            onOpenShop: this.onOpenShop,
            gameManager: this.stateProvider.gameManager // 传入 gameManager
        }, this.mapData)

        // 4. 基础游戏逻辑 (受暂停影响)
        const isPaused = this.stateProvider.gameManager && this.stateProvider.gameManager.state.isPaused

        if (!isPaused && !this.isTransitioning) {
            // 如果不在编辑模式，才更新常规输入感知
            if (!this.editMode) {
                getSystem('input-sense').update(dt, this.engine.input)
            }

            // 核心逻辑阶段驱动
            const phases = ['sense', 'intent', 'decision', 'control']
            phases.forEach(phase => {
                this.systems.logic[phase].forEach((system: any) => {
                    // MousePositionSenseSystem 需要 engine 对象而不仅仅是 input
                    if (system === getSystem('mouse-position-sense')) {
                        system.update(dt, this.engine)
                    } else {
                        system.update(dt)
                    }
                })
            })

            // 生命周期管理阶段
            this.systems.logic.lifecycle.forEach((system: any) => system.update(dt))

            // 物理阶段 (优先从 SceneConfig 组件读取动态数据)
            const sceneConfigEntity = world.with('sceneConfig').first;
            const mapWidth = sceneConfigEntity ? sceneConfigEntity.sceneConfig.width : (this.mapData.width || 800);
            const mapHeight = sceneConfigEntity ? sceneConfigEntity.sceneConfig.height : (this.mapData.height || 600);

            const physicsOptions = {
                mapBounds: { width: mapWidth, height: mapHeight }
            }
            this.systems.logic.physics.forEach((system: any) => system.update(dt, physicsOptions))

            // 5. 更新相机 (在物理和逻辑之后)
            getSystem('camera').update(dt, {
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
