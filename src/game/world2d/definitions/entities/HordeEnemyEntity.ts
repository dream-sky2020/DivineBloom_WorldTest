import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Velocity, VELOCITY_INSPECTOR_FIELDS,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Bounds, BOUNDS_INSPECTOR_FIELDS,
  Detectable,
  HordeAI,
  Health, HEALTH_INSPECTOR_FIELDS,
  Inspector, EDITOR_INSPECTOR_FIELDS,
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
    
    // HordeAI Config
    strategy: z.enum(['chase', 'steering']).default('chase'),
    baseSpeed: z.number().default(80),
    visionRadius: z.number().default(500),
    
    // Dynamic Speed Config
    proximitySpeedEnabled: z.boolean().default(true),
    minDistance: z.number().optional(),
    maxDistance: z.number().optional(),
    minMultiplier: z.number().optional(),
    maxMultiplier: z.number().optional(),

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
  { path: 'hordeAIConfig.strategy', label: 'AI 策略', type: 'select', props: { options: ['chase', 'steering'] }, group: '怪潮 AI' },
  { path: 'hordeAIConfig.baseSpeed', label: '基础速度', type: 'number', props: { min: 0 }, group: '怪潮 AI' },
  ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const HordeEnemyEntity: IEntityDefinition<typeof HordeEnemyEntitySchema> = {
  type: 'horde_enemy',
  name: '怪潮敌人',
  order: 11,
  creationIndex: 0,
  schema: HordeEnemyEntitySchema,
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
      
      bounds: Bounds.create(),
      
      hordeAIConfig: HordeAI.Config({
        strategy: options.strategy,
        baseSpeed: options.baseSpeed,
        visionRadius: options.visionRadius,
        proximitySpeed: {
          enabled: options.proximitySpeedEnabled,
          minDistance: options.minDistance,
          maxDistance: options.maxDistance,
          minMultiplier: options.minMultiplier,
          maxMultiplier: options.maxMultiplier
        }
      }),

      hordeAIState: HordeAI.State(),
      health: Health.create({ maxHealth: options.maxHealth, currentHealth: options.maxHealth }),
      sprite: Sprite.create(visualId, { scale: options.scale }),
      animation: Animation.create('idle'),
      shape: Shape.create({ type: ShapeType.CIRCLE, radius: 15 }),
      collider: Collider.create(),
      detectable: Detectable.create(['enemy'])
    });

    root.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 80,
      editorBox: { w: 40, h: 40, scale: 1 }
    });

    return root;
  },

  serialize(entity: any) {
    const { transform, hordeAIConfig, sprite, name, health } = entity
    return {
      type: 'horde_enemy',
      x: transform.x,
      y: transform.y,
      name: name,
      options: {
        spriteId: sprite?.id,
        scale: sprite?.scale,
        strategy: hordeAIConfig.strategy,
        baseSpeed: hordeAIConfig.baseSpeed,
        visionRadius: hordeAIConfig.visionRadius,
        proximitySpeedEnabled: hordeAIConfig.proximitySpeed.enabled,
        minDistance: hordeAIConfig.proximitySpeed.minDistance,
        maxDistance: hordeAIConfig.proximitySpeed.maxDistance,
        minMultiplier: hordeAIConfig.proximitySpeed.minMultiplier,
        maxMultiplier: hordeAIConfig.proximitySpeed.maxMultiplier,
        maxHealth: health.maxHealth
      }
    }
  },

  deserialize(data: any) {
    return this.create(data);
  }
}
