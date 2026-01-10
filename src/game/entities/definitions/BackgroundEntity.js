import { world } from '@/game/ecs/world'
import { Visuals } from '@/game/entities/components/Visuals'

export const BackgroundEntity = {
    /**
     * 创建地面实体
     * @param {number} width 
     * @param {number} height 
     * @param {string} color 
     */
    createGround(width, height, color) {
        return world.add({
            type: 'background_ground',
            position: { x: 0, y: 0 },
            visual: Visuals.Rect(width, height, color),
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
        return world.add({
            type: 'background_decoration',
            position: { x, y },
            visual: Visuals.Rect(width, height, color),
            zIndex: -50, // 在地面之上，但在角色之下
        })
    },

    serialize(entity) {
        // 静态背景不需要序列化，restore 时通过 ScenarioLoader 从 mapData 重建
        return null
    }
}

