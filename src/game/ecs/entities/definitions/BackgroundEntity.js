import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { Visuals } from '@/game/ecs/entities/components/Visuals'
import { Inspector } from '@/game/ecs/entities/components/Inspector'
import { createLogger } from '@/utils/logger'

const logger = createLogger('BackgroundEntity')

// --- Schema Definitions ---

export const BackgroundGroundSchema = z.object({
    width: z.number(),
    height: z.number(),
    color: z.string()
});

// --- Entity Definition ---

export const BackgroundEntity = {
    /**
     * 创建地面实体 (底层颜色)
     * @param {number} width 
     * @param {number} height 
     * @param {string} color 
     */
    createGround(width, height, color) {
        const result = BackgroundGroundSchema.safeParse({ width, height, color });
        if (!result.success) {
            logger.error('Ground validation failed', result.error);
            return null;
        }

        const d = result.data;

        return world.add({
            type: 'background_ground',
            name: 'Ground',
            position: { x: 0, y: 0 },
            visual: Visuals.Rect(d.width, d.height, d.color),
            zIndex: -100, // 最底层
            // [NEW] 添加 Inspector
            inspector: Inspector.create({
                tagName: 'Background',
                tagColor: '#64748b',
                allowDelete: false,
                hitPriority: 10 // 背景点击优先级最低
            })
        })
    },

    serialize(entity) {
        return null
    }
}
