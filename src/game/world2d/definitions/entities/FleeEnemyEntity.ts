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

export const FleeEnemyEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional(),
  options: z.object({
    spriteId: z.string().default('enemy_slime'),
    scale: z.number().optional(),
    baseSpeed: z.number().default(110),
    visionRadius: z.number().default(550),
    maxHealth: z.number().default(50)
  }).default({} as any)
});

export type FleeEnemyEntityData = z.infer<typeof FleeEnemyEntitySchema>;

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  ...(TRANSFORM_INSPECTOR_FIELDS || []),
  ...(VELOCITY_INSPECTOR_FIELDS || []),
  ...(SHAPE_INSPECTOR_FIELDS || []),
  ...(HEALTH_INSPECTOR_FIELDS || []),
  { path: 'sprite.id', label: '精灵 ID', type: 'text', group: '精灵 (Sprite)' },
  ...(SPRITE_INSPECTOR_FIELDS || []),
  ...(BOUNDS_INSPECTOR_FIELDS || []),
  ...(COLLIDER_INSPECTOR_FIELDS || []),
  { path: 'aiConfig.type', label: 'AI 策略', type: 'text', group: 'AI 配置' },
  { path: 'aiConfig.speed', label: '基础速度', type: 'number', props: { min: 0 }, group: 'AI 配置' },
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const FleeEnemyEntity: IEntityDefinition<typeof FleeEnemyEntitySchema> = {
  type: 'flee_enemy',
  name: '逃跑敌人',
  order: 14,
  creationIndex: 0,
  schema: FleeEnemyEntitySchema,
  spawnFactory(ctx) {
    const params = ctx.params || {};
    const optionParams = (params.options ?? params) as Record<string, any>;
    return FleeEnemyEntity.create({
      x: ctx.x,
      y: ctx.y,
      name: params.name,
      options: {
        spriteId: optionParams.spriteId ?? 'enemy_slime',
        baseSpeed: optionParams.baseSpeed ?? 110,
        visionRadius: optionParams.visionRadius ?? 550,
        maxHealth: optionParams.maxHealth ?? 50,
        scale: optionParams.scale
      }
    });
  },
  create(data: FleeEnemyEntityData) {
    const result = FleeEnemyEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[FleeEnemyEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, options } = result.data;
    const visualId = options.spriteId;

    const root = world.add({
      type: 'flee_enemy',
      name: name || `FleeEnemy_${visualId}`,
      transform: Transform.create(x, y),
      velocity: Velocity.create(),
      enemy: true,
      fleeEnemy: true,
      monster: Monster.create({ category: 'horde', priority: 1 }),
      spawnMask: SpawnMask.create({ group: 'fleeEnemy' }),
      bounds: Bounds.create(),
      aiConfig: AI.Config({
        type: 'flee',
        visionRadius: options.visionRadius,
        speed: options.baseSpeed,
        detectedState: 'flee',
        alwaysTrackPlayer: false,
        hideVisionRender: false,
        homePosition: { x, y },
        patrolRadius: Math.max(100, Math.floor(options.visionRadius * 0.5))
      }),
      aiState: AI.State(false, 0, 'flee'),
      health: Health.create({ maxHealth: options.maxHealth, currentHealth: options.maxHealth }),
      sprite: Sprite.create(visualId, { scale: options.scale }),
      animation: Animation.create('idle'),
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: 15 }),
      collider: Collider.create(),
      detectable: Detectable.create(['enemy']),
      damageDetectable: DamageDetectable.create(['enemy']),
      portalDetectable: PortalDetectable.create(['enemy'])
    });

    const coreNode = world.add({
      type: 'flee_enemy_core',
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
    const { transform, aiConfig, sprite, name, health } = entity;
    return {
      type: 'flee_enemy',
      x: transform.x,
      y: transform.y,
      name,
      options: {
        spriteId: sprite?.id,
        scale: sprite?.scale,
        baseSpeed: aiConfig?.speed ?? 110,
        visionRadius: aiConfig?.visionRadius ?? 550,
        maxHealth: health.maxHealth
      }
    };
  },

  deserialize(data: any) {
    return this.create(data);
  }
};
