import { clearWorld, world } from '@/game/ecs/world'
import { MovementSystem } from '@/game/ecs/systems/physics/MovementSystem'
import { InputSystem } from '@/game/ecs/systems/input/InputSystem'
import { PlayerControlSystem } from '@/game/ecs/systems/control/PlayerControlSystem'
import { ConstraintSystem } from '@/game/ecs/systems/physics/ConstraintSystem'
import { VisualRenderSystem } from '@/game/ecs/systems/render/VisualRenderSystem'
import { VisionRenderSystem } from '@/game/ecs/systems/render/VisionRenderSystem'
import { StatusRenderSystem } from '@/game/ecs/systems/render/StatusRenderSystem'
import { EnemyAISystem } from '@/game/ecs/systems/ai/EnemyAISystem'
import { ActionSystem } from '@/game/ecs/systems/event/ActionSystem'
import { EnvironmentRenderSystem } from '@/game/ecs/systems/render/EnvironmentRenderSystem'
import { DetectionAreaRenderSystem } from '@/game/ecs/systems/render/DetectionAreaRenderSystem'
import { TriggerSystem } from '@/game/ecs/systems/event/TriggerSystem'
import { getAssetPath } from '@/data/assets'
import { Visuals } from '@/data/visuals'
import { ScenarioLoader } from '@/game/utils/ScenarioLoader'
import { EntityManager } from '@/game/entities/EntityManager'

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
     */
    constructor(engine, onEncounter, initialState = null, mapData = null, entryId = 'default', onSwitchMap = null, onInteract = null) {
        // Clear ECS world on scene init to prevent stale entities
        clearWorld()

        this.engine = engine
        this.onEncounter = onEncounter
        this.onSwitchMap = onSwitchMap
        this.onInteract = onInteract

        this.mapData = mapData || {}
        this.entryId = entryId

        // 初始化 Environment System
        EnvironmentRenderSystem.init(this.mapData)
        DetectionAreaRenderSystem.init(this.mapData)
        
        // Time delta for animation
        this.lastDt = 0.016
        this.isLoaded = false

        // Convenience reference (populated during load)
        this.player = null

        if (initialState && initialState.isInitialized) {
            this.restore(initialState)
        } else {
            this._initScenario()
        }
    }

    _initScenario() {
        const { player } = ScenarioLoader.load(this.engine, this.mapData, this.entryId)
        this.player = player

        // [NEW] Use EntityManager to create Portal Entities
        if (this.mapData.portals) {
            for (const p of this.mapData.portals) {
                EntityManager.createPortal({
                    x: p.x,
                    y: p.y,
                    width: p.w,
                    height: p.h,
                    targetMapId: p.targetMapId,
                    targetEntryId: p.targetEntryId
                })
            }
        }
    }

    // Getter for backward compatibility and debug UI
    get gameEntities() {
        return Array.from(world)
    }

    serialize() {
        const entitiesToSave = []
        for (const entity of world) {
            if (entity.type && entity.type !== 'portal') { // Don't save static portals
                entitiesToSave.push({
                    type: entity.type,
                    data: EntityManager.serialize(entity)
                })
            }
        }

        return {
            isInitialized: true,
            entities: entitiesToSave
        }
    }

    restore(state) {
        clearWorld()
        const { player } = ScenarioLoader.restore(this.engine, state)
        this.player = player

        // Re-create portals using EntityManager
        if (this.mapData.portals) {
            for (const p of this.mapData.portals) {
                EntityManager.createPortal({
                    x: p.x,
                    y: p.y,
                    width: p.w,
                    height: p.h,
                    targetMapId: p.targetMapId,
                    targetEntryId: p.targetEntryId
                })
            }
        }
    }

    async load() {
        const requiredVisuals = new Set()
        requiredVisuals.add('default')

        const visualEntities = world.with('visual')
        for (const e of visualEntities) {
            requiredVisuals.add(e.visual.id)
        }

        if (this.mapData.backgroundId) {
            const bgPath = getAssetPath(this.mapData.backgroundId)
            if (bgPath) {
                await this.engine.assets.loadTexture(this.mapData.backgroundId)
            }
        }

        console.log('Preloading visuals:', Array.from(requiredVisuals))
        await this.engine.assets.preloadVisuals(Array.from(requiredVisuals), Visuals)

        this.isLoaded = true
    }

    /**
     * @param {number} dt 
     */
    update(dt) {
        if (!this.isLoaded) return
        this.lastDt = dt

        // Update Systems
        EnvironmentRenderSystem.update(dt, this.engine)
        VisualRenderSystem.update(dt)
        InputSystem.update(dt, this.engine.input)
        PlayerControlSystem.update(dt)
        EnemyAISystem.update(dt)
        MovementSystem.update(dt)
        ConstraintSystem.update(dt)

        // [NEW] Trigger System (Logic)
        TriggerSystem.update(dt)

        // [NEW] Action System (Execution)
        ActionSystem.update({
            onEncounter: this.onEncounter,
            onSwitchMap: this.onSwitchMap,
            onInteract: this.onInteract
        })

        this.engine.renderer.setCamera(0, 0)
    }

    /**
     * @param {Renderer2D} renderer 
     */
    draw(renderer) {
        // Layer 0: Background
        EnvironmentRenderSystem.draw(renderer, this.engine)

        // Debug Layer: Detection Areas (Draw below entities or above background)
        DetectionAreaRenderSystem.draw(renderer)

        if (!this.isLoaded) return

        // Layer 1: Vision / Effects
        VisionRenderSystem.draw(renderer)

        // Layer 2: Entities (Sorted)
        VisualRenderSystem.draw(renderer)

        // Layer 3: Status UI
        StatusRenderSystem.draw(renderer)
    }
}
