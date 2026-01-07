import { Player } from '@/game/entities/Player'
import { MapEnemy } from '@/game/entities/MapEnemy'
import { clearWorld, world } from '@/game/ecs/world'
import { MovementSystem } from '@/game/ecs/systems/MovementSystem'
import { InputSystem } from '@/game/ecs/systems/InputSystem'
import { ConstraintSystem } from '@/game/ecs/systems/ConstraintSystem'
import { RenderSystem } from '@/game/ecs/systems/RenderSystem'
import { EnemyAISystem } from '@/game/ecs/systems/EnemyAISystem'
import { InteractionSystem } from '@/game/ecs/systems/InteractionSystem'
// import { maps } from '@/data/maps' // No longer needed directly here

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
 */

export class MainScene {
  /**
   * @param {GameEngine} engine 
   * @param {Function} [onEncounter] - Callback when player encounters enemy
   * @param {object} [initialState] - Saved state to restore
   * @param {object} [mapData] - Loaded map data object (NOT ID string)
   * @param {string} [entryId] - Entry point ID (e.g. 'default', 'from_village')
   * @param {Function} [onSwitchMap] - Callback when player enters portal
   */
  constructor(engine, onEncounter, initialState = null, mapData = null, entryId = 'default', onSwitchMap = null) {
    // Clear ECS world on scene init to prevent stale entities
    clearWorld()

    this.engine = engine
    this.onEncounter = onEncounter
    this.onSwitchMap = onSwitchMap
    this.player = new Player(engine)

    // Load Map Data
    this.currentMap = mapData || {} // Fallback empty
    this.entryId = entryId

    // Map Enemies
    this.mapEnemies = []

    // Static Cache Layer
    this.staticLayer = null
    this.lastCacheWidth = 0
    this.lastCacheHeight = 0

    if (initialState && initialState.isInitialized) {
      this.restore(initialState)
    } else {
      this._initMap()
    }

    // 统一实体列表
    this.entities = [this.player, ...this.mapEnemies]

    this.isLoaded = false
  }

  _initMap() {
    // Set Player Spawn from Entry Point
    let spawn = this.currentMap.spawnPoint
    if (this.currentMap.entryPoints && this.currentMap.entryPoints[this.entryId]) {
      spawn = this.currentMap.entryPoints[this.entryId]
    }

    if (spawn) {
      this.player.pos.x = spawn.x
      this.player.pos.y = spawn.y
    }
    this._spawnEnemies()
  }

  serialize() {
    return {
      isInitialized: true,
      playerPos: this.player.toData(),
      enemies: this.mapEnemies.map(e => e.toData())
    }
  }

  restore(state) {
    // Restore Player
    if (state.playerPos) {
      this.player.restore(state.playerPos)
    }

    // Restore Enemies
    if (state.enemies) {
      // Cleanup existing entities
      this.mapEnemies.forEach(e => e.destroy && e.destroy())

      this.mapEnemies = state.enemies.map(data =>
        MapEnemy.fromData(this.engine, data, { player: this.player })
      )
    }

    // Rebuild entities list if needed (constructor does it too, but good for safety if called later)
    this.entities = [this.player, ...this.mapEnemies]
  }

  _spawnEnemies() {
    // Cleanup existing entities to prevent ECS leaks
    this.mapEnemies.forEach(e => e.destroy && e.destroy())
    this.mapEnemies = []
    if (!this.currentMap || !this.currentMap.spawners) return

    this.currentMap.spawners.forEach(spawner => {
      for (let i = 0; i < spawner.count; i++) {
        let x = 0, y = 0
        if (spawner.area) {
          x = spawner.area.x + Math.random() * spawner.area.w
          y = spawner.area.y + Math.random() * spawner.area.h
        } else {
          x = 300
          y = 300
        }

        const group = spawner.enemyIds.map(id => ({ id }))

        const enemy = new MapEnemy(this.engine, x, y, group, {
          player: this.player,
          ...spawner.options,
          minYRatio: this.currentMap.constraints?.minYRatio
        })
        this.mapEnemies.push(enemy)
      }
    })
  }

  async load() {
    // 统一加载资源
    const sheetUrl = this._buildTinySpriteSheetDataURL()
    await this.engine.textures.load('sheet', sheetUrl)

    // Pre-render background
    this._refreshStaticLayer()

    this.isLoaded = true
  }

  /**
   * @param {number} dt 
   */
  update(dt) {
    if (!this.isLoaded) return

    // 1. Check Resize & Update Bounds
    if (this.lastCacheWidth !== this.engine.width || this.lastCacheHeight !== this.engine.height) {
      this._handleResize()
    }

    // Run ECS Systems
    InputSystem.update(dt, this.engine.input)
    EnemyAISystem.update(dt)
    MovementSystem.update(dt)
    ConstraintSystem.update(dt)

    // Check Collisions / Interactions
    InteractionSystem.update({
      onEncounter: this.onEncounter,
      onSwitchMap: this.onSwitchMap,
      portals: this.currentMap.portals
    })

    // 摄像机跟随玩家 (简单示例)
    // this.engine.renderer.setCamera(this.player.pos.x - 400, 0)
    this.engine.renderer.setCamera(0, 0)
  }

  _handleResize() {
    const { width, height } = this.engine
    if (width === 0 || height === 0) return

    // Update bounds for all entities that need it
    const boundedEntities = world.with('bounds')
    const minYRatio = this.currentMap.constraints?.minYRatio ?? 0.35

    for (const ent of boundedEntities) {
      ent.bounds.minX = 0
      ent.bounds.maxX = width
      ent.bounds.maxY = height
      // Use entity config if available, else default
      const ratio = ent.aiConfig?.minYRatio ?? minYRatio
      ent.bounds.minY = height * ratio
    }

    // Refresh background cache
    this._refreshStaticLayer()
  }

  /**
   * @param {Renderer2D} renderer 
   */
  draw(renderer) {
    // 1. 绘制背景/地面
    this._drawEnvironment(renderer)

    if (!this.isLoaded) return

    // 2. 绘制所有实体 (ECS RenderSystem)
    // RenderSystem handles Y-sorting and drawing
    RenderSystem.update(renderer)

    // Note: Entities with 'render' component are drawn by RenderSystem.
    // Legacy entities (if any) without 'render' but with 'draw' would be skipped here unless we keep the loop.
    // For now, Player and MapEnemy are migrated, so we assume all entities are in ECS.

    // Draw Portals (Visual Feedback)
    if (this.currentMap.portals) {
      this.currentMap.portals.forEach(p => {
        // Semi-transparent cyan glow
        renderer.drawRect(p.x, p.y, p.w, p.h, 'rgba(34, 211, 238, 0.3)')
      })
    }
  }

  /**
   * @param {Renderer2D} renderer 
   */
  _drawEnvironment(renderer) {
    const { width, height } = this.engine

    // Check if cache needs refresh (e.g. resize)
    if (!this.staticLayer || this.lastCacheWidth !== width || this.lastCacheHeight !== height) {
      this._refreshStaticLayer()
    }

    if (this.staticLayer) {
      // Fast Path: Draw cached image
      renderer.ctx.drawImage(this.staticLayer, 0, 0)
    }
  }

  _refreshStaticLayer() {
    if (!this.currentMap) return
    const { width, height } = this.engine
    if (width === 0 || height === 0) return

    // Create or Resize Canvas
    if (!this.staticLayer) {
      this.staticLayer = document.createElement('canvas')
    }
    this.staticLayer.width = width
    this.staticLayer.height = height

    const ctx = this.staticLayer.getContext('2d')
    const bg = this.currentMap.background
    const minYRatio = this.currentMap.constraints?.minYRatio ?? 0.35

    // 1. Clear
    ctx.clearRect(0, 0, width, height)

    // 2. Draw Ground
    ctx.fillStyle = bg.groundColor || '#bbf7d0'
    const groundY = height * minYRatio
    ctx.fillRect(0, groundY, width, height - groundY)

    // 3. Draw Decorations
    if (bg.decorations) {
      bg.decorations.forEach(dec => {
        if (dec.type === 'rect') {
          const y = dec.yRatio ? height * dec.yRatio : dec.y
          ctx.fillStyle = dec.color
          ctx.fillRect(dec.x, y, dec.width, dec.height)
        }
      })
    }

    this.lastCacheWidth = width
    this.lastCacheHeight = height
  }

  // 辅助：生成资源 URL
  _buildTinySpriteSheetDataURL() {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <rect width="32" height="32" fill="none"/>
      <ellipse cx="16" cy="26" rx="9" ry="4" fill="rgba(0,0,0,0.25)"/>
      <circle cx="16" cy="10" r="6" fill="#0f172a"/>
      <rect x="11" y="16" width="10" height="10" rx="2" fill="#ef4444"/>
      <rect x="9" y="20" width="4" height="7" rx="1" fill="#ef4444"/>
      <rect x="19" y="20" width="4" height="7" rx="1" fill="#ef4444"/>
    </svg>`
    const encoded = encodeURIComponent(svg)
    return `data:image/svg+xml;charset=utf-8,${encoded}`
  }
}

