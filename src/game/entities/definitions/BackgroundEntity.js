import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { Visuals } from '@/game/entities/components/Visuals'

// --- Schema Definitions ---

export const BackgroundGroundSchema = z.object({
  width: z.number(),
  height: z.number(),
  color: z.string()
});

export const BackgroundDecorationSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string()
});

// --- Entity Definition ---

export const BackgroundEntity = {
    /**
     * 创建地面实体
     * @param {number} width 
     * @param {number} height 
     * @param {string} color 
     */
    createGround(width, height, color) {
        const result = BackgroundGroundSchema.safeParse({ width, height, color });
        if (!result.success) {
            console.error('[BackgroundEntity] Ground validation failed', result.error);
            return null;
        }
        
        // Use validated data
        const d = result.data;

        return world.add({
            type: 'background_ground',
            position: { x: 0, y: 0 },
            visual: Visuals.Rect(d.width, d.height, d.color),
            zIndex: -100, // 最底层
            // Ground 不需要序列化，因为它由 mapData 决定
        })
    },

    /**
     * 创建装饰物实体
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} color 
     */
    createDecoration(x, y, width, height, color) {
        const result = BackgroundDecorationSchema.safeParse({ x, y, width, height, color });
        if (!result.success) {
            console.error('[BackgroundEntity] Decoration validation failed', result.error);
            return null;
        }

        const d = result.data;

        return world.add({
            type: 'background_decoration',
            position: { x: d.x, y: d.y },
            visual: Visuals.Rect(d.width, d.height, d.color),
            zIndex: -50, // 在地面之上，但在角色之下
        })
    },

    serialize(entity) {
        // 静态背景不需要序列化，restore 时通过 ScenarioLoader 从 mapData 重建
        return null
    }
}
