// Player 移除
// MapEnemy 移除
// NPC 移除
import { EntityFactory } from '@/game/entities/EntityFactory'
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

    // Unified Entity List
    this.gameEntities = []
    
    // Convenience reference to player (will be populated during init)
    this.player = null

    // Load Map Data
    this.currentMap = mapData || {} // Fallback empty
    this.entryId = entryId

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

    this.isLoaded = false
  }

  _initMap() {
    // 1. Create Player via Factory
    this.player = EntityFactory.createPlayer({ 
        x: 200, 
        y: 260, 
        scale: PlayerConfig.scale 
    })
    this.gameEntities.push(this.player)

    // Set Player Spawn from Entry Point
    let spawn = this.currentMap.spawnPoint
    if (this.currentMap.entryPoints && this.currentMap.entryPoints[this.entryId]) {
      spawn = this.currentMap.entryPoints[this.entryId]
    }

    if (spawn) {
      this.player.position.x = spawn.x
      this.player.position.y = spawn.y
    }
    
    // 2. Spawn Enemies and NPCs
    this._spawnEnemies()
    this._spawnNPCs()
  }

  serialize() {
    return {
      isInitialized: true,
      // Serialize ALL entities in one list
      entities: this.gameEntities.map(e => ({
        type: e.type || (e.entity ? e.entity.type : 'unknown'),
        data: EntityFactory.serialize(e)
      }))
    }
  }

  restore(state) {
    // Clear existing entities
    this.gameEntities.forEach(e => {
        // 如果还有 destroy 方法（防止漏网之鱼），调用之；否则直接从 world 移除
        if (e.destroy) e.destroy()
        else world.remove(e)
    })
    this.gameEntities = []

    if (state.entities) {
      state.entities.forEach(item => {
        // 使用 create 统一入口，不需要根据 type 显式 new Class
        const entity = EntityFactory.create(this.engine, item.type, item.data, {
          player: null 
        })
        
        if (entity) {
          this.gameEntities.push(entity)
          if (entity.type === 'player') {
            this.player = entity
          }
        }
      })
    }
    
    // Fallback: recreate player if missing
    if (!this.player) {
       console.warn('Player not found in save state, recreating...')
       this.player = EntityFactory.createPlayer({ 
            x: 200, 
            y: 260, 
            scale: PlayerConfig.scale 
       })
       this.gameEntities.push(this.player)
    }
  }

  _spawnEnemies() {
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

        const enemyData = {
            x, y, 
            battleGroup: group,
            options: {
                ...spawner.options,
                minYRatio: this.currentMap.constraints?.minYRatio,
            }
        }
        
        const enemyEntity = EntityFactory.createEnemy(enemyData)
        this.gameEntities.push(enemyEntity)
      }
    })
  }

  _spawnNPCs() {
    if (!this.currentMap || !this.currentMap.npcs) return

    this.currentMap.npcs.forEach(data => {
      // [修改] 使用工厂创建 NPC
      // 数据结构适配：map 数据是平铺的 {x, y, ...config}，工厂期望 {x, y, config: {...}}
      // 为了保持 EntityFactory createNPC 签名清晰，我们在 factory 里做了分离，或者在这里构造好
      
      // 根据 EntityFactory.createNPC(data) 的签名： { x, y, config: {} }
      // 而 map 数据通常是 { x, y, dialogueId: '...', ... }
      // 所以我们在这里重新组装一下
      
      const npcData = {
          x: data.x,
          y: data.y,
          config: {
              ...data, // 把所有额外属性都传进去作为 config (包含 dialogueId, spriteId 等)
              x: undefined, // 清理掉重复的 x, y（可选）
              y: undefined
          }
      }
      
      const npcEntity = EntityFactory.createNPC(npcData)
      this.gameEntities.push(npcEntity)
    })
  }

  async load() {
    const requiredVisuals = new Set()
    requiredVisuals.add('default')

    this.gameEntities.forEach(e => {
      // 现在的 e 都是纯 ECS 实体，没有 wrapper 了，直接访问
      if (e.visual) {
        requiredVisuals.add(e.visual.id)
      }
    })

    if (this.currentMap.backgroundId) {
      const bgPath = getAssetPath(this.currentMap.backgroundId)
      if (bgPath) {
        await this.engine.assets.loadTexture(this.currentMap.backgroundId)
      }
    }

    console.log('Preloading visuals:', Array.from(requiredVisuals))
    await this.engine.assets.preloadVisuals(Array.from(requiredVisuals), Visuals)

    this._refreshStaticLayer()
    this.isLoaded = true
  }


  /**
   * @param {number} dt 
   */
  update(dt) {
    if (!this.isLoaded) return
    this.lastDt = dt

    if (this.lastCacheWidth !== this.engine.width || this.lastCacheHeight !== this.engine.height) {
      this._handleResize()
    }

    InputSystem.update(dt, this.engine.input)
    EnemyAISystem.update(dt)
    MovementSystem.update(dt)
    ConstraintSystem.update(dt)

    InteractionSystem.update({
      input: this.engine.input,
      onEncounter: this.onEncounter,
      onSwitchMap: this.onSwitchMap,
      onInteract: this.onInteract,
      onProximity: null,
      portals: this.currentMap.portals
    })

    this.engine.renderer.setCamera(0, 0)
  }

  _handleResize() {
    const { width, height } = this.engine
    if (width === 0 || height === 0) return

    const boundedEntities = world.with('bounds')
    const minYRatio = this.currentMap.constraints?.minYRatio ?? 0.35

    for (const ent of boundedEntities) {
      ent.bounds.minX = 0
      ent.bounds.maxX = width
      ent.bounds.maxY = height
      const ratio = ent.aiConfig?.minYRatio ?? minYRatio
      ent.bounds.minY = height * ratio
    }

    this._refreshStaticLayer()
  }

  /**
   * @param {Renderer2D} renderer 
   */
  draw(renderer) {
    this._drawEnvironment(renderer)

    if (!this.isLoaded) return

    RenderSystem.update(renderer, this.lastDt)

    if (this.currentMap.portals) {
      this.currentMap.portals.forEach(p => {
        renderer.drawRect(p.x, p.y, p.w, p.h, 'rgba(34, 211, 238, 0.3)')
      })
    }
  }

  /**
   * @param {Renderer2D} renderer 
   */
  _drawEnvironment(renderer) {
    const { width, height } = this.engine

    if (!this.staticLayer || this.lastCacheWidth !== width || this.lastCacheHeight !== height) {
      this._refreshStaticLayer()
    }

    if (this.staticLayer) {
      renderer.ctx.drawImage(this.staticLayer, 0, 0)
    }
  }

  _refreshStaticLayer() {
    if (!this.currentMap) return
    const { width, height } = this.engine
    if (width === 0 || height === 0) return

    if (!this.staticLayer) {
      this.staticLayer = document.createElement('canvas')
    }
    this.staticLayer.width = width
    this.staticLayer.height = height

    const ctx = this.staticLayer.getContext('2d')
    const bg = this.currentMap.background
    const minYRatio = this.currentMap.constraints?.minYRatio ?? 0.35

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = bg.groundColor || '#bbf7d0'
    const groundY = height * minYRatio
    ctx.fillRect(0, groundY, width, height - groundY)

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
