import { z } from 'zod'
import { ID } from '@/data/schemas/common'
import { world } from '@/game/ecs/world'
import { DetectArea, Trigger, DetectInput, Detectable } from '@/game/ecs/entities/components/Triggers'
import { Visuals } from '@/game/ecs/entities/components/Visuals'
import { Physics } from '@/game/ecs/entities/components/Physics'
import { AI } from '@/game/ecs/entities/components/AI'
import { Actions } from '@/game/ecs/entities/components/Actions'
import { Inspector } from '@/game/ecs/entities/components/Inspector'

// --- Schema Definition ---

export const EnemyEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  battleGroup: z.array(z.object({ id: ID })).default([]),
  options: z.object({
    uuid: z.string().optional(),
    isStunned: z.boolean().default(false),
    stunnedTimer: z.number().default(0),
    spriteId: z.string().default('enemy_slime'),
    scale: z.number().optional(),

    // AI Config
    aiType: z.string().optional(),
    visionRadius: z.number().optional(),
    speed: z.number().optional(),

    // AI Extra Options
    visionType: z.string().optional(),
    visionAngle: z.number().optional(),
    visionProximity: z.number().optional(),
    suspicionTime: z.number().optional(),
    minYRatio: z.number().optional(),
    homePosition: z.object({ x: z.number(), y: z.number() }).optional(),
    patrolRadius: z.number().optional(),
    detectedState: z.string().optional(),
    stunDuration: z.number().optional(),
    chaseExitMultiplier: z.number().optional()
  }).default({})
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', tip: '敌人在场景中的标识名' },
  { path: 'position.x', label: '坐标 X', type: 'number', props: { step: 1 } },
  { path: 'position.y', label: '坐标 Y', type: 'number', props: { step: 1 } },
  { path: 'visual.id', label: '精灵 ID', type: 'text', tip: '对应资源库中的敌人图片' },
  { path: 'visual.scale', label: '缩放', type: 'number', props: { step: 0.1, min: 0.1 } },
  { path: 'aiConfig.type', label: 'AI 类型', type: 'text', tip: 'chase(追逐), flee(逃跑), patrol(巡逻), idle(静止)' },
  { path: 'aiConfig.visionRadius', label: '视野半径', type: 'number', tip: '敌人发现目标的距离', props: { min: 0 } },
  { path: 'aiConfig.speed', label: '移动速度', type: 'number', props: { step: 10, min: 0 } },
  { path: 'aiConfig.patrolRadius', label: '巡逻半径', type: 'number', tip: '仅对巡逻型 AI 有效', props: { min: 0 } },
  { path: 'aiConfig.stunDuration', label: '眩晕时长', type: 'number', tip: '战斗逃跑或被特殊技能击中后的瘫痪时间', props: { step: 0.1, min: 0 } }
];

export const EnemyEntity = {
  create(data) {
    const result = EnemyEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[EnemyEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, battleGroup, options } = result.data;

    // Generate UUID if not present
    const uuid = options.uuid || Math.random().toString(36).substr(2, 9);
    const isStunned = options.isStunned;
    const visualId = options.spriteId;

    const entity = world.add({
      type: 'enemy',
      name: name || `Enemy_${visualId}`,
      position: { x, y },
      velocity: Physics.Velocity(),
      detectable: Detectable(['enemy', 'teleportable']),
      enemy: true,

      // [NEW ARCHITECTURE]
      detectArea: DetectArea({ shape: 'circle', radius: 40, target: 'player' }), // 敌人依然只探测玩家标签来触发战斗
      trigger: Trigger({
        rules: [{
          type: 'onEnter',
          // [NEW] Added Condition
          condition: 'notStunned'
        }],
        actions: ['BATTLE']
      }),

      actionBattle: Actions.Battle(battleGroup, uuid),

      // [LEGACY COMPATIBILITY] - Keeping for safety if other systems access it directly
      interaction: {
        battleGroup: battleGroup,
        uuid: uuid
      },

      // 🎯 自定义碰撞体 (圆形)
      collider: Physics.Circle(15),

      bounds: Physics.Bounds(),

      aiConfig: AI.Config(
        options.aiType,
        options.visionRadius,
        options.speed,
        { // Extra options
          visionType: options.visionType,
          visionAngle: options.visionAngle,
          visionProximity: options.visionProximity,
          suspicionTime: options.suspicionTime,
          minYRatio: options.minYRatio,
          homePosition: options.homePosition || { x, y }, // 优先使用保存的家位置，否则使用初始坐标
          patrolRadius: options.patrolRadius,
          detectedState: options.detectedState || (options.aiType === 'flee' ? 'flee' : 'chase'),
          stunDuration: options.stunDuration,
          chaseExitMultiplier: options.chaseExitMultiplier
        }
      ),

      aiState: AI.State(isStunned, options.stunnedTimer),

      visual: Visuals.Sprite(
        visualId,
        options.scale,
        isStunned ? 'stunned' : 'idle'
      ),

      // [NEW] 添加 Inspector 映射
      inspector: Inspector.create({
        fields: INSPECTOR_FIELDS,
        hitPriority: 80
      })
    })

    // [REMOVED] Vision Indicator Entity
    // Vision rendering is now handled by AIVisionRenderSystem which queries the enemy entity directly.
    // No need for a separate attached entity.

    return entity
  },

  serialize(entity) {
    const { position, aiState, aiConfig, interaction, visual, name } = entity
    return {
      type: 'enemy',
      x: position.x,
      y: position.y,
      name: name,
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
        homePosition: aiConfig.homePosition,
        patrolRadius: aiConfig.patrolRadius,
        detectedState: aiConfig.detectedState,
        stunDuration: aiConfig.stunDuration,
        chaseExitMultiplier: aiConfig.chaseExitMultiplier,
        spriteId: visual.id,
        scale: visual.scale
      }
    }
  }
}
