import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { PlayerConfig } from '@/data/assets'
import { Visuals } from '@/game/entities/components/Visuals'
import { Physics } from '@/game/entities/components/Physics'

// --- Schema Definition ---

export const PlayerEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  scale: z.number().optional().default(0.7)
});

// --- Entity Definition ---

export const PlayerEntity = {
  create(data) {
    const result = PlayerEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PlayerEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, scale } = result.data;

    const entity = world.add({
      type: 'player', // 方便序列化识别
      position: { x, y },
      velocity: Physics.Velocity(),

      // 玩家特有属性
      input: true,
      player: true, // Tag

      // 移动参数 (来自 PlayerConfig 或默认)
      speed: PlayerConfig.speed || 200,
      fastSpeed: PlayerConfig.fastSpeed || 320,

      bounds: Physics.Bounds(),

      visual: Visuals.Sprite(
        'hero',
        scale
        // default state 'idle' is fine
      )
    })

    return entity
  },

  serialize(entity) {
    return {
      x: entity.position.x,
      y: entity.position.y,
      scale: entity.visual.scale
    }
  }
}
