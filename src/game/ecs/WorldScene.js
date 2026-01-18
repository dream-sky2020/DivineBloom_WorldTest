import { EntityManager } from '@/game/ecs/entities/EntityManager'
import { BackgroundRenderSystem } from '@/game/ecs/systems/render/BackgroundRenderSystem'
import { VisualRenderSystem } from '@/game/ecs/systems/render/VisualRenderSystem'
import { AIVisionRenderSystem } from '@/game/ecs/systems/render/AIVisionRenderSystem'
import { StatusRenderSystem } from '@/game/ecs/systems/render/StatusRenderSystem'
import { DetectAreaRenderSystem } from '@/game/ecs/systems/render/DetectAreaRenderSystem'
import { InputSenseSystem } from '@/game/ecs/systems/sense/InputSenseSystem'
// import { ExternalSenseSystem } from '@/game/ecs/systems/sense/ExternalSenseSystem' (Removed)
import { AISenseSystem } from '@/game/ecs/systems/sense/AISenseSystem'
import { PlayerIntentSystem } from '@/game/ecs/systems/intent/PlayerIntentSystem'
import { PlayerControlSystem } from '@/game/ecs/systems/control/PlayerControlSystem'
import { EnemyAIIntentSystem } from '@/game/ecs/systems/intent/EnemyAIIntentSystem'
import { EnemyControlSystem } from '@/game/ecs/systems/control/EnemyControlSystem'
import { MovementSystem } from '@/game/ecs/systems/physics/MovementSystem'
import { DetectAreaSystem } from '@/game/ecs/systems/detect/DetectAreaSystem'
import { DetectInputSystem } from '@/game/ecs/systems/detect/DetectInputSystem'
import { TriggerSystem } from '@/game/ecs/systems/event/TriggerSystem'
import { ExecuteSystem } from '@/game/ecs/systems/execute/ExecuteSystem'
import { clearWorld, world } from '@/game/ecs/world'
import { MapSaveStateSchema } from '@/data/schemas/save'
import { GlobalEntity } from '@/game/ecs/entities/definitions/GlobalEntity'
import { EditorGridRenderSystem } from '@/game/ecs/systems/render/EditorGridRenderSystem'
import { EditorInteractionSystem } from '@/game/ecs/systems/editor/EditorInteractionSystem'
import { EditorHighlightRenderSystem } from '@/game/ecs/systems/editor/EditorHighlightRenderSystem'

/**
 * @typedef {import('@/game/ecs/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/ecs/GameEngine').Renderer2D} Renderer2D
 */

export class WorldScene {
    /**
     * @param {GameEngine} engine 
     * @param {Function} [onEncounter]
     * @param {object} [initialState]
     * @param {object} [mapData]
     * @param {string} [entryId]
     * @param {Function} [onSwitchMap]
     * @param {Function} [onInteract]
     * @param {Function} [onOpenMenu]
     * @param {Object} [stateProvider]
     */
    constructor(engine, onEncounter, initialState = null, mapData = null, entryId = 'default', onSwitchMap = null, onInteract = null, onOpenMenu = null, stateProvider = null) {
        // Clear ECS world on scene init to prevent stale entities
        clearWorld()

        this.engine = engine
        this.onEncounter = onEncounter
        this.onSwitchMap = onSwitchMap
        this.onInteract = onInteract
        this.onOpenMenu = onOpenMenu
        this.stateProvider = stateProvider || {}

        this.mapData = mapData || {}
        this.entryId = entryId

        // 初始化 Environment System
        DetectAreaRenderSystem.init(this.mapData)

        // --- Render Pipeline Setup ---
        // 注册所有渲染系统，draw() 时会自动按 LAYER 排序执行
        this.renderPipeline = [
            BackgroundRenderSystem, // Layer 10
            AIVisionRenderSystem,   // Layer 15
            VisualRenderSystem,     // Layer 20
            StatusRenderSystem,     // Layer 30
            DetectAreaRenderSystem  // Layer 100 (Debug)
        ]

        // 预排序
        this.renderPipeline.sort((a, b) => (a.LAYER || 0) - (b.LAYER || 0))

        // Time delta for animation
        this.lastDt = 0.016

        // Convenience reference (populated during load)
        this.player = null

        this.editMode = false

        // Initialize Global Entities (Command Queue)
        this._initGlobalEntities()

        // 注意：实体创建现在由 SceneLifecycle.prepareScene() 统一处理
        // 构造函数只负责初始化场景配置，不创建游戏实体
    }

    _initGlobalEntities() {
        // Create the global manager entity if it doesn't exist
        // Note: GlobalEntity.create handles duplicate checks internally but checking here is safer/clearer
        const existing = world.with('globalManager').first
        if (!existing) {
            GlobalEntity.create()
        }
    }

    /**
     * Map Loaded Callback (Called by SceneManager when switching maps)
     * 注意：现在资源加载由 SceneLifecycle 在 SceneManager 中统一处理
     * 这个方法只负责初始化系统
     * @param {object} mapData 
     */
    onMapLoaded(mapData) {
        // Re-initialize systems that depend on map data
        DetectAreaRenderSystem.init(mapData)
        console.log('[WorldScene] Map systems reinitialized')
    }

    /**
     * 进入编辑模式
     */
    enterEditMode() {
        this.editMode = true
        if (!this.renderPipeline.includes(EditorGridRenderSystem)) {
            this.renderPipeline.push(EditorGridRenderSystem)
            this.renderPipeline.push(EditorHighlightRenderSystem)
            this.renderPipeline.sort((a, b) => (a.LAYER || 0) - (b.LAYER || 0))
        }
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        this.editMode = false

        // 清理渲染系统
        const systemsToRemove = [EditorGridRenderSystem, EditorHighlightRenderSystem]
        this.renderPipeline = this.renderPipeline.filter(s => !systemsToRemove.includes(s))

        // 重置交互状态
        EditorInteractionSystem.selectedEntity = null
        EditorInteractionSystem.isDragging = false
        if (this.stateProvider.gameManager) {
            this.stateProvider.gameManager.editor.selectedEntity = null // Reset reactive state
        }
    }

    /**
     * Serialize the current scene state (entities)
     * Used by WorldStore to persist state when switching maps
     */
    serialize() {
        const entitiesData = []

        // Iterate all entities in the world
        for (const entity of world) {
            // Exclude global manager from map-specific serialization
            if (entity.globalManager) continue;

            // 只序列化动态实体，不包含静态配置（静态配置由 ScenarioLoader 重建）
            // EntityManager.serialize 已经返回了 { type, data } 格式
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
     * @param {number} dt 
     */
    update(dt) {
        this.lastDt = dt

        // Always update Render Systems (animations)
        VisualRenderSystem.update(dt)

        // 编辑器交互系统始终运行（无论是否暂停，只要在编辑模式下）
        if (this.editMode) {
            InputSenseSystem.update(dt, this.engine.input)
            EditorInteractionSystem.update(dt, this.engine, this.stateProvider.gameManager)
        }

        // 如果 GameManager 处于暂停状态，则跳过后续游戏 logic 更新
        if (this.stateProvider.gameManager && this.stateProvider.gameManager.state.isPaused) return

        // Only update Game Logic if not transitioning
        if (!this.isTransitioning) {
            // 如果不在编辑模式下，才更新常规输入感知（防止与编辑器冲突）
            if (!this.editMode) {
                InputSenseSystem.update(dt, this.engine.input)
            }

            // 0. 全局外部事件感知 - 已移除，功能由 AISenseSystem 接管
            // ExternalSenseSystem.update(dt, { scene: this })

            // 1. 感知 (Sense/Detect)
            AISenseSystem.update(dt)
            DetectAreaSystem.update(dt)
            DetectInputSystem.update(dt)

            // 2. 意图 (Intent)
            PlayerIntentSystem.update(dt)
            EnemyAIIntentSystem.update(dt)

            // 3. 决策 (Trigger Logic)
            TriggerSystem.update(dt)

            // 4. 控制 (Control)
            PlayerControlSystem.update(dt)
            EnemyControlSystem.update(dt)

            // 5. 物理 (Physics)
            MovementSystem.update(dt)

            // 6. 执行 (Execute)
            ExecuteSystem.update({
                onEncounter: this.onEncounter,
                onSwitchMap: null, // SceneManager handles this now
                onInteract: this.onInteract,
                onOpenMenu: this.onOpenMenu
            })
        }

        // 7. Scene Management (Always run to handle transitions)
        // 直接处理 ECS 场景切换请求和场景管理器更新
        if (this.stateProvider.sceneManager) {
            // 1. 处理 ECS 组件触发的场景切换请求
            const transitionEntity = world.with('sceneTransition').first
            if (transitionEntity) {
                const request = transitionEntity.sceneTransition
                this.stateProvider.sceneManager.requestSwitchMap(request.mapId, request.entryId)
                world.removeComponent(transitionEntity, 'sceneTransition')
            }

            // 2. 更新场景管理器（执行待处理的切换）
            this.stateProvider.sceneManager.update()
        }
    }

    /**
     * @param {Renderer2D} renderer 
     */
    draw(renderer) {
        // 自动渲染管线
        // 按 Z-Index (LAYER) 顺序执行
        for (const system of this.renderPipeline) {
            if (system.draw) {
                system.draw(renderer)
            }
        }
    }
}
