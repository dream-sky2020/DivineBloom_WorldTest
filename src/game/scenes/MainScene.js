import { Player } from '@/game/entities/Player'
import { MapEnemy } from '@/game/entities/MapEnemy'
import { NPC } from '@/game/entities/NPC'
import { clearWorld, world } from '@/game/ecs/world'
import { MovementSystem } from '@/game/ecs/systems/MovementSystem'
import { InputSystem } from '@/game/ecs/systems/InputSystem'
import { ConstraintSystem } from '@/game/ecs/systems/ConstraintSystem'
import { RenderSystem } from '@/game/ecs/systems/RenderSystem'
import { EnemyAISystem } from '@/game/ecs/systems/EnemyAISystem'
import { InteractionSystem } from '@/game/ecs/systems/InteractionSystem'
import { getAssetPath, PlayerConfig } from '@/data/assets'
import { Visuals } from '@/data/visuals'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
 */

export class MainScene {
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

    // Pass player config from assets
    this.player = new Player(engine, PlayerConfig)

    // Load Map Data
    this.currentMap = mapData || {} // Fallback empty
    this.entryId = entryId

    // Map Enemies
    this.mapEnemies = []
    // Map NPCs
    this.npcs = []

    // Static Cache Layer
    this.staticLayer = null
    this.lastCacheWidth = 0
    this.lastCacheHeight = 0

    // Time delta for animation
    this.lastDt = 0.016

    if (initialState && initialState.isInitialized) {
      this.restore(initialState)
    } else {
      this._initMap()
    }

    // 统一实体列表
    this.entities = [this.player, ...this.mapEnemies, ...this.npcs]

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
    this._spawnNPCs()
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

    // Restore NPCs (Respawn from map data as they are static for now)
    this._spawnNPCs()

    // Rebuild entities list if needed
    this.entities = [this.player, ...this.mapEnemies, ...this.npcs]
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

  _spawnNPCs() {
    this.npcs.forEach(n => n.destroy && n.destroy())
    this.npcs = []
    if (!this.currentMap || !this.currentMap.npcs) return

    this.currentMap.npcs.forEach(data => {
      const npc = new NPC(this.engine, data.x, data.y, data)
      this.npcs.push(npc)
    })
  }

  async load() {
    // 使用新的 AssetManager 批量加载
    // 我们不需要手动一个个 load('player', path) 了
    // 而是收集当前场景所有 Entity 用到的 visualId

    const requiredVisuals = new Set()

    // 1. Player
    requiredVisuals.add('hero')

    // 2. NPCs
    if (this.currentMap && this.currentMap.npcs) {
      this.currentMap.npcs.forEach(n => {
        // 假设 map 数据里写的是 spriteId='npc_guide'，这个 key 正好也是 Visuals 的 key
        // 为了兼容旧代码，如果没有 spriteId 默认用 'npc_guide'
        const vid = n.spriteId || 'npc_guide'
        requiredVisuals.add(vid)
      })
    }

    // 3. Enemies
    // 默认 MapEnemy 使用 'enemy_slime'，除非有覆盖
    requiredVisuals.add('enemy_slime')

    // 4. Map Background
    if (this.currentMap.backgroundId) {
      // 背景图作为普通 Texture 加载
      const bgPath = getAssetPath(this.currentMap.backgroundId)
      if (bgPath) {
        await this.engine.assets.loadTexture(this.currentMap.backgroundId)
      }
    }

    // 执行批量加载
    console.log('Preloading visuals:', Array.from(requiredVisuals))
    await this.engine.assets.preloadVisuals(Array.from(requiredVisuals), Visuals)

    // Pre-render background
    this._refreshStaticLayer()

    this.isLoaded = true
  }

  /**
   * @param {number} dt 
   */
  update(dt) {
    if (!this.isLoaded) return
    this.lastDt = dt

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
      input: this.engine.input,
      onEncounter: this.onEncounter,
      onSwitchMap: this.onSwitchMap,
      onInteract: this.onInteract,
      portals: this.currentMap.portals
    })

    // 摄像机跟随玩家 (简单示例)
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
    // 我们把 update(dt) 获取到的时间传给 RenderSystem 用于播放动画
    RenderSystem.update(renderer, this.lastDt)

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
}
