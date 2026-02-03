import { z } from 'zod'
import { ID } from '@schema/common'
import { world } from '@world2d/world'
import {
  DetectArea, Trigger, DetectInput, Detectable,
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Bounds, BOUNDS_INSPECTOR_FIELDS,
  AI,
  Actions,
  Health, HEALTH_INSPECTOR_FIELDS,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  DETECT_AREA_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Parent, Children, LocalTransform, Shape, ShapeType
} from '@components'

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
  { path: 'name', label: '名称', type: 'text', tip: '敌人在场景中的标识名', group: '基本属性' },
  ...TRANSFORM_INSPECTOR_FIELDS,
  ...VELOCITY_INSPECTOR_FIELDS,
  ...COLLIDER_INSPECTOR_FIELDS,
  ...BOUNDS_INSPECTOR_FIELDS,
  ...HEALTH_INSPECTOR_FIELDS,
  { path: 'sprite.id', label: '精灵 ID', type: 'text', tip: '对应资源库中的敌人图片', group: '精灵 (Sprite)' },
  ...SPRITE_INSPECTOR_FIELDS,
  ...DETECT_AREA_INSPECTOR_FIELDS,
  { path: 'aiConfig.type', label: 'AI 类型', type: 'text', tip: 'chase(追逐), flee(逃跑), patrol(巡逻), idle(静止)', group: 'AI 配置' },
  { path: 'aiConfig.visionRadius', label: '视野半径', type: 'number', tip: '敌人发现目标的距离', props: { min: 0 }, group: 'AI 配置' },
  { path: 'aiConfig.speed', label: '移动速度', type: 'number', props: { step: 10, min: 0 }, group: 'AI 配置' },
  { path: 'aiConfig.patrolRadius', label: '巡逻半径', type: 'number', tip: '仅对巡逻型 AI 有效', props: { min: 0 }, group: 'AI 配置' },
  { path: 'aiConfig.stunDuration', label: '眩晕时长', type: 'number', tip: '战斗逃跑或被特殊技能击中后的瘫痪时间', props: { step: 0.1, min: 0 }, group: 'AI 配置' },
  ...EDITOR_INSPECTOR_FIELDS
];

export const EnemyEntity = {
  create(data) {
    const result = EnemyEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[EnemyEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, battleGroup, options } = result.data;
    const uuid = options.uuid || Math.random().toString(36).substr(2, 9);
    const isStunned = options.isStunned;
    const visualId = options.spriteId;

    const root = world.add({
      type: 'enemy',
      name: name || `Enemy_${visualId}`,
      transform: Transform(x, y),
      velocity: Velocity(),
      enemy: true,

      actionBattle: Actions.Battle(battleGroup, uuid),
      interaction: { battleGroup, uuid },
      bounds: Bounds(),

      aiConfig: AI.Config(
        options.aiType,
        options.visionRadius,
        options.speed,
        {
          visionType: options.visionType,
          visionAngle: options.visionAngle,
          visionProximity: options.visionProximity,
          suspicionTime: options.suspicionTime,
          minYRatio: options.minYRatio,
          homePosition: options.homePosition || { x, y },
          patrolRadius: options.patrolRadius,
          detectedState: options.detectedState || (options.aiType === 'flee' ? 'flee' : 'chase'),
          stunDuration: options.stunDuration,
          chaseExitMultiplier: options.chaseExitMultiplier
        }
      ),

      aiState: AI.State(isStunned, options.stunnedTimer),
      health: Health.create({ maxHealth: 100, currentHealth: 100 }),
      sprite: Sprite.create(visualId, { scale: options.scale }),
      animation: Animation.create(isStunned ? 'stunned' : 'idle'),

      // Trigger 放在根节点
      trigger: Trigger({
        rules: [{ type: 'onEnter', condition: 'notStunned' }],
        actions: ['BATTLE']
      })
    });

    // 2. Body Child (Collision & Detection)
    const body = world.add({
        parent: Parent(root),
        transform: Transform(),
        localTransform: LocalTransform(0, 0),
        name: `${root.name}_Body`,
        shape: Shape({ type: ShapeType.CIRCLE, radius: 15 }),
        collider: Collider.create({ shapeId: 'body' }),
        detectable: Detectable(['enemy', 'teleportable']) // Move detectable here
    });

    // 3. Sensor Child (Battle Detection Only)
    const sensor = world.add({
        parent: Parent(root),
        transform: Transform(),
        localTransform: LocalTransform(0, 0),
        name: `${root.name}_Sensor`,
        shape: Shape({ type: ShapeType.CIRCLE, radius: 40 }),
        detectArea: DetectArea({ shapeId: 'sensor', target: 'player' })
    });

    root.children = Children([body, sensor]);

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 80,
      editorBox: { w: 40, h: 60, scale: 1 }
    });

    return root;
  },

  serialize(entity) {
    const { transform, aiState, aiConfig, interaction, sprite, visual, name } = entity
    return {
      type: 'enemy',
      x: transform.x,
      y: transform.y,
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
        spriteId: sprite?.id || visual?.id,
        scale: sprite?.scale || visual?.scale
      }
    }
  }
}
