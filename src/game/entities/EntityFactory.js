import { world } from '@/game/ecs/world'
// NPC 移除
import { PlayerConfig } from '@/data/assets' 

export const EntityFactory = {
  // --- 1. 纯 ECS 敌人创建工厂 ---
  createEnemy(data) {
    const { x, y, battleGroup, options = {} } = data
    
    // 默认值处理 (逻辑来自原 MapEnemy.js)
    const isStunned = options.isStunned || false
    const visualId = options.spriteId || 'enemy_slime'
    const uuid = options.uuid || Math.random().toString(36).substr(2, 9)

    // 直接返回 ECS 实体 (不再包裹在 class 里)
    const entity = world.add({
      type: 'enemy', // 方便序列化识别
      position: { x, y },
      velocity: { x: 0, y: 0 },
      enemy: true, // Tag Component

      interaction: {
        battleGroup: battleGroup || [],
        uuid: uuid
      },

      bounds: {
        minX: 0, maxX: 9999, // 暂时硬编码，后面由 System 统一更新
        minY: 0, maxY: 9999
      },

      aiConfig: {
        type: options.aiType || 'wander',
        visionRadius: options.visionRadius || 120,
        visionType: options.visionType || 'circle',
        visionAngle: (options.visionAngle || 90) * (Math.PI / 180),
        visionProximity: options.visionProximity || 40,
        speed: options.speed || 80,
        suspicionTime: options.suspicionTime || 0,
        minYRatio: options.minYRatio || 0.35
      },

      aiState: {
        state: isStunned ? 'stunned' : 'wander',
        timer: isStunned ? (options.stunnedTimer || 3.0) : 0,
        suspicion: 0,
        moveDir: { x: 0, y: 0 },
        facing: { x: 1, y: 0 },
        colorHex: '#eab308', // 黄色
        alertAnim: 0,
        starAngle: 0,
        justEntered: true
      },

      visual: {
        id: visualId,
        state: isStunned ? 'stunned' : 'idle',
        frameIndex: 0,
        timer: 0,
        scale: options.scale || 1
      }
    })

    return entity
  },

  // --- 2. 纯 ECS 玩家工厂 ---
  createPlayer(data) {
    const { x, y, scale } = data
    
    const entity = world.add({
      type: 'player', // 方便序列化识别
      position: { x, y },
      velocity: { x: 0, y: 0 },
      
      // 玩家特有属性
      input: true,
      player: true, // Tag
      
      // 移动参数 (来自 PlayerConfig 或默认)
      speed: PlayerConfig.speed || 200,
      fastSpeed: PlayerConfig.fastSpeed || 320,

      bounds: {
        minX: 0, maxX: 9999, // 由 MainScene 更新
        minY: 0, maxY: 9999
      },

      visual: {
        id: 'hero',
        state: 'idle',
        frameIndex: 0,
        timer: 0,
        scale: scale || 0.7
      }
    })

    return entity
  },

  // --- 3. 新增：纯 ECS NPC 工厂 ---
  createNPC(data) {
    const { x, y, config = {} } = data
    
    // 默认值逻辑来自原 NPC.js
    const dialogueId = config.dialogueId || 'welcome'
    const visualId = config.spriteId || 'npc_guide'

    const entity = world.add({
        type: 'npc',
        position: { x, y },
        npc: true,
        interaction: {
            type: 'dialogue',
            id: dialogueId,
            range: config.range || 60
        },
        // Body component (for collisions if implemented later, currently used for static property?)
        body: {
            static: true,
            radius: 15,
            width: 30,
            height: 30
        },
        bounds: { minX: 0, maxX: 9999, minY: 0, maxY: 9999 },

        visual: {
            id: visualId,
            state: 'default',
            frameIndex: 0,
            timer: 0,
            scale: config.scale || 0.8
        }
    })

    return entity
  },

  // --- 4. 兼容层：统一创建入口 ---
  create(engine, type, data, context = {}) {
    if (type === 'enemy') return this.createEnemy(data)
    
    if (type === 'player') {
        return this.createPlayer({
            x: data.x, 
            y: data.y, 
            scale: data.scale
        })
    }
    
    if (type === 'npc') {
        // 适配参数
        return this.createNPC({
            x: data.x, 
            y: data.y, 
            config: data.config || {}
        })
    }
  },

  // --- 5. 序列化助手 ---
  serialize(entity) {
    // Enemy
    if (entity.type === 'enemy') {
       const { position, aiState, aiConfig, interaction, visual } = entity
       return {
         x: position.x,
         y: position.y,
         battleGroup: interaction.battleGroup,
         options: {
           uuid: interaction.uuid,
           isStunned: aiState.state === 'stunned',
           stunnedTimer: aiState.state === 'stunned' ? aiState.timer : 0,
           aiType: aiConfig.type,
           visionRadius: aiConfig.visionRadius,
           visionType: aiConfig.visionType,
           visionAngle: Math.round(aiConfig.visionAngle * (180 / Math.PI)),
           visionProximity: aiConfig.visionProximity,
           speed: aiConfig.speed,
           minYRatio: aiConfig.minYRatio,
           suspicionTime: aiConfig.suspicionTime,
           spriteId: visual.id,
           scale: visual.scale
         }
       }
    }

    // Player
    if (entity.type === 'player') {
       return {
         x: entity.position.x,
         y: entity.position.y,
         scale: entity.visual.scale
       }
    }
    
    // [新增] NPC 序列化
    if (entity.type === 'npc') {
       return {
         x: entity.position.x,
         y: entity.position.y,
         config: {
            dialogueId: entity.interaction.id,
            range: entity.interaction.range,
            spriteId: entity.visual.id,
            scale: entity.visual.scale
         }
       }
    }
    
    return null
  }
}
