import { z } from 'zod';
import { world } from '@world2d/runtime/WorldEcsRuntime';
import { IEntityDefinition } from '../interface/IEntity';
import {
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Bounds, BOUNDS_INSPECTOR_FIELDS,
  Detectable,
  DamageDetectable,
  PortalDetectable,
  SpawnMask,
  Monster,
  AI,
  Children,
  Health, HEALTH_INSPECTOR_FIELDS,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  LocalTransform,
  Parent,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Shape, ShapeType, SHAPE_INSPECTOR_FIELDS
} from '@components';

// --- Schema Definition ---

export const HordeEnemyEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  options: z.object({
    spriteId: z.string().default('enemy_slime'),
    scale: z.number().optional(),

    // AI Config
    strategy: z.enum(['chase', 'steering']).default('chase'),
    baseSpeed: z.number().default(80),
    visionRadius: z.number().default(500),

    // Health
    maxHealth: z.number().default(50),
  }).default({} as any)
});

export type HordeEnemyEntityData = z.infer<typeof HordeEnemyEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', tip: '敌人在场景中的标识名', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  ...(VELOCITY_INSPECTOR_FIELDS || []),
  ...(SHAPE_INSPECTOR_FIELDS || []),
  ...(HEALTH_INSPECTOR_FIELDS || []),
  { path: 'sprite.id', label: '精灵 ID', type: 'text', tip: '对应资源库中的敌人图片', group: '精灵 (Sprite)' },
  ...(SPRITE_INSPECTOR_FIELDS || []),
  { path: 'aiConfig.type', label: 'AI 策略', type: 'select', props: { options: ['chase', 'steering'] }, group: 'AI 配置' },
  { path: 'aiConfig.speed', label: '基础速度', type: 'number', props: { min: 0 }, group: 'AI 配置' },
  { path: 'aiConfig.alwaysTrackPlayer', label: '全局追踪', type: 'checkbox', group: 'AI 配置' },
  { path: 'aiConfig.hideVisionRender', label: '隐藏视野绘制', type: 'checkbox', group: 'AI 配置' },
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const HordeEnemyEntity: IEntityDefinition<typeof HordeEnemyEntitySchema> = {
  type: 'horde_enemy',
  name: '怪潮敌人',
  order: 11,
  creationIndex: 0,
  schema: HordeEnemyEntitySchema,
  spawnFactory(ctx) {
    const params = ctx.params || {};
    const optionParams = (params.options ?? params) as Record<string, any>;
    return HordeEnemyEntity.create({
      x: ctx.x,
      y: ctx.y,
      name: params.name,
      options: {
        spriteId: optionParams.spriteId ?? 'enemy_slime',
        strategy: optionParams.strategy ?? 'chase',
        baseSpeed: optionParams.baseSpeed ?? 80,
        visionRadius: optionParams.visionRadius ?? 500,
        maxHealth: optionParams.maxHealth ?? 50,
        scale: optionParams.scale
      }
    });
  },
  create(data: HordeEnemyEntityData) {
    const result = HordeEnemyEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[HordeEnemyEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, options } = result.data;
    const visualId = options.spriteId;

    const root = world.add({
      type: 'horde_enemy',
      name: name || `HordeEnemy_${visualId}`,
      transform: Transform.create(x, y),
      velocity: Velocity.create(),
      enemy: true, // 保持 enemy 标签以便被玩家武器检测到
      chaseEnemy: true,
      monster: Monster.create({ category: 'horde', priority: 2 }),
      spawnMask: SpawnMask.create({ group: 'monster' }),

      bounds: Bounds.create(),

      aiConfig: AI.Config({
        type: options.strategy === 'steering' ? 'chase' : options.strategy,
        visionRadius: options.visionRadius,
        speed: options.baseSpeed,
        detectedState: 'chase',
        alwaysTrackPlayer: false,
        hideVisionRender: false,
        homePosition: { x, y },
        patrolRadius: Math.max(80, Math.floor(options.visionRadius * 0.5))
      }),
      aiState: AI.State(false, 0, 'chase'),
      health: Health.create({ maxHealth: options.maxHealth, currentHealth: options.maxHealth }),
      sprite: Sprite.create(visualId, { scale: options.scale }),
      animation: Animation.create('idle'),
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: 15 }),
      collider: Collider.create(),
      detectable: Detectable.create(['enemy']),
      damageDetectable: DamageDetectable.create(['enemy']),
      portalDetectable: PortalDetectable.create(['enemy'])
    });

    // 子节点：挂载被探测组件，便于后续扩展命中盒/独立部件系统
    const coreNode = world.add({
      type: 'horde_enemy_core',
      name: `${root.name}_Core`,
      parent: Parent.create(root),
      transform: Transform.create(x, y),
      localTransform: LocalTransform.create(0, 0),
      detectable: Detectable.create(['enemy']),
      damageDetectable: DamageDetectable.create(['enemy']),
      portalDetectable: PortalDetectable.create(['enemy'])
    });
    root.children = Children.create([coreNode]);

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 80,
      editorBox: { w: 40, h: 40, scale: 1 }
    });

    return root;
  },

  serialize(entity: any) {
    const { transform, aiConfig, sprite, name, health } = entity
    return {
      type: 'horde_enemy',
      x: transform.x,
      y: transform.y,
      name: name,
      options: {
        spriteId: sprite?.id,
        scale: sprite?.scale,
        strategy: aiConfig?.type || 'chase',
        baseSpeed: aiConfig?.speed ?? 80,
        visionRadius: aiConfig?.visionRadius ?? 500,
        maxHealth: health.maxHealth
      }
    }
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
