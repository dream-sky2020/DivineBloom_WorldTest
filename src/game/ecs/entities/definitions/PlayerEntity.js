import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { PlayerConfig } from '@/data/assets'
import { Visuals } from '@/game/ecs/entities/components/Visuals'
import { Physics } from '@/game/ecs/entities/components/Physics'
import { Detectable } from '@/game/ecs/entities/components/Triggers'
import { Inspector } from '@/game/ecs/entities/components/Inspector'

// --- Schema Definition ---

export const PlayerEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Player'),
  scale: z.number().optional().default(0.7)
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text' },
  { path: 'position.x', label: '坐标 X', type: 'number' },
  { path: 'position.y', label: '坐标 Y', type: 'number' },
  { path: 'speed', label: '基础速度', type: 'number', props: { min: 0, step: 10 } },
  { path: 'fastSpeed', label: '奔跑速度', type: 'number', props: { min: 0, step: 10 } },
  { path: 'visual.scale', label: '缩放', type: 'number', props: { min: 0.1, step: 0.1 } }
];

export const PlayerEntity = {
  create(data) {
    const result = PlayerEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PlayerEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, scale } = result.data;

    const entity = world.add({
      type: 'player', // 方便序列化识别
      name: name,
      position: { x, y },
      velocity: Physics.Velocity(),
      detectable: Detectable(['player', 'teleportable']),

      // 玩家特有属性
      input: true,
      player: true, // Tag

      // 移动参数 (来自 PlayerConfig 或默认)
      speed: PlayerConfig.speed || 200,
      fastSpeed: PlayerConfig.fastSpeed || 320,

      // 🎯 自定义碰撞体 (圆形)
      collider: Physics.Circle(12),

      bounds: Physics.Bounds(),

      visual: Visuals.Sprite(
        'hero',
        scale
        // default state 'idle' is fine
      ),

      // [NEW] 添加 Inspector
      inspector: Inspector.create({ 
        fields: INSPECTOR_FIELDS,
        hitPriority: 100
      })
    })

    return entity
  },

  serialize(entity) {
    return {
      type: 'player',
      x: entity.position.x,
      y: entity.position.y,
      name: entity.name,
      scale: entity.visual.scale
    }
  }
}
