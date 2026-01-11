import { EntityManager } from '@/game/entities/EntityManager'
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
import { ConstraintSystem } from '@/game/ecs/systems/physics/ConstraintSystem'
import { DetectAreaSystem } from '@/game/ecs/systems/detect/DetectAreaSystem'
import { DetectInputSystem } from '@/game/ecs/systems/detect/DetectInputSystem'
import { TriggerSystem } from '@/game/ecs/systems/event/TriggerSystem'
import { ExecuteSystem } from '@/game/ecs/systems/execute/ExecuteSystem'
import { ScenarioLoader } from '@/game/utils/ScenarioLoader'
import { Visuals } from '@/game/entities/components/Visuals'
import { Visuals as VisualDefs } from '@/data/visuals'
import Enemies from '@/data/characters/enemies'
import { clearWorld, world } from '@/game/ecs/world'
import { SceneSystem } from '@/game/ecs/systems/SceneSystem'
import { MapSaveStateSchema } from '@/data/schemas/save'
import { GlobalEntity } from '@/game/entities/definitions/GlobalEntity'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
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
     * @param {Object} [stateProvider]
     */
    constructor(engine, onEncounter, initialState = null, mapData = null, entryId = 'default', onSwitchMap = null, onInteract = null, stateProvider = null) {
        // Clear ECS world on scene init to prevent stale entities
        clearWorld()

        this.engine = engine
        this.onEncounter = onEncounter
        this.onSwitchMap = onSwitchMap
        this.onInteract = onInteract
        this.stateProvider = stateProvider || {}

        this.mapData = mapData || {}
        this.entryId = entryId

        // 初始化 Environment System
        DetectAreaRenderSystem.init(this.mapData)

        // --- Render Pipeline Setup ---
        // 注册所有渲染系统，draw() 时会自动按 LAYER 排序执行
        // 如果要添加新的渲染系统，只需在这里注册，并在系统内定义 LAYER 即可
        this.renderPipeline = [
            BackgroundRenderSystem, // Layer 10
            AIVisionRenderSystem,   // Layer 15
            VisualRenderSystem,     // Layer 20
            StatusRenderSystem,     // Layer 30
            DetectAreaRenderSystem  // Layer 100 (Debug)
        ]

        // 预排序（虽然通常是静态的，但排序一次无妨）
        this.renderPipeline.sort((a, b) => (a.LAYER || 0) - (b.LAYER || 0))

        // Time delta for animation
        this.lastDt = 0.016
        this.isLoaded = false

        // Convenience reference (populated during load)
        this.player = null

        // Initialize Global Entities (Command Queue)
        this._initGlobalEntities()

        if (initialState && initialState.isInitialized) {
            this.restore(initialState)
        } else {
            this._initScenario()
        }
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
     * @param {object} mapData 
     */
    onMapLoaded(mapData) {
        // Re-initialize systems that depend on map data
        // EnvironmentRenderSystem removed
        DetectAreaRenderSystem.init(mapData)
    }

    _initScenario() {
        const { player } = ScenarioLoader.load(this.engine, this.mapData, this.entryId)
        this.player = player
        this.isLoaded = true
    }

    restore(state) {
        // Validate state before restoring
        try {
            MapSaveStateSchema.parse(state)
        } catch (e) {
            console.error('🚨 [WorldScene] Restore State Validation Failed:', e)
            // If validation fails, fallback to fresh initialization
            this._initScenario()
            return
        }

        // Restore from state logic
        const { player } = ScenarioLoader.restore(this.engine, state, this.mapData)
        this.player = player
        this.isLoaded = true
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
     * Preload assets if needed
     */
    async load() {
        // Collect all assets needed by map
        const requiredVisuals = new Set()

        // Add player assets
        requiredVisuals.add('hero')

        // Add map assets (npcs defined in map)
        if (this.mapData.npcs) {
            this.mapData.npcs.forEach(npc => {
                if (npc.spriteId) requiredVisuals.add(npc.spriteId)
            })
        }

        // Add map assets (enemies)
        if (this.mapData.spawners) {
            this.mapData.spawners.forEach(spawner => {
                if (spawner.enemyIds && spawner.enemyIds.length > 0) {
                    const leaderId = spawner.enemyIds[0]
                    const leaderDef = Enemies[leaderId]
                    if (leaderDef && leaderDef.spriteId) {
                        requiredVisuals.add(leaderDef.spriteId)
                    }
                }
            })
        }

        // Add portal assets
        if (this.mapData.portals && this.mapData.portals.length > 0) {
            requiredVisuals.add('portal_default')
        }

        // Wait for assets
        await this.engine.assets.preloadVisuals(Array.from(requiredVisuals), VisualDefs)

        this.isLoaded = true
    }

    /**
     * @param {number} dt 
     */
    update(dt) {
        if (!this.isLoaded) return
        this.lastDt = dt

        // Always update Render Systems (maybe freeze animations if desired, but for now keep them running)
        VisualRenderSystem.update(dt)

        // Only update Game Logic if not transitioning
        if (!this.isTransitioning) {
            InputSenseSystem.update(dt, this.engine.input)

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
            ConstraintSystem.update(dt)

            // 6. 执行 (Execute)
            ExecuteSystem.update({
                onEncounter: this.onEncounter,
                onSwitchMap: null, // SceneSystem handles this now
                onInteract: this.onInteract
            })
        }

        // 7. Scene Management (Always run to handle transitions)
        SceneSystem.update(this.engine, {
            worldStore: this.stateProvider.worldStore, // Need to pass store
            currentScene: this,
            // Still pass callbacks for legacy or manager usage if needed
            onEncounter: this.onEncounter,
            onSwitchMap: this.onSwitchMap // Used to update Vue UI
        })
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
