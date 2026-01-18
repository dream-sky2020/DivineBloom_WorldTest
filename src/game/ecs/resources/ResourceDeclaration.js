import { Visuals as VisualDefs } from '@/data/visuals'
import Enemies from '@/data/characters/enemies'

/**
 * 资源声明系统
 * 负责分析和收集场景所需的所有资源依赖
 */
export class ResourceDeclaration {
    /**
     * 从地图配置中自动提取所有资源依赖
     * @param {object} mapData 地图配置数据
     * @returns {Set<string>} 视觉资源 ID 集合
     */
    static getMapDependencies(mapData) {
        const visualIds = new Set()

        if (!mapData) return visualIds

        // 1. 玩家资源（始终需要）
        visualIds.add('hero')

        // 2. NPC 资源
        if (mapData.npcs) {
            mapData.npcs.forEach(npc => {
                if (npc.spriteId) {
                    visualIds.add(npc.spriteId)
                }
            })
        }

        // 3. 装饰物资源
        if (mapData.decorations) {
            mapData.decorations.forEach(dec => {
                if (dec.spriteId) {
                    visualIds.add(dec.spriteId)
                }
            })
        }

        // 4. 敌人资源
        if (mapData.spawners) {
            mapData.spawners.forEach(spawner => {
                if (spawner.enemyIds && spawner.enemyIds.length > 0) {
                    spawner.enemyIds.forEach(enemyId => {
                        const enemyDef = Enemies[enemyId]
                        if (enemyDef && enemyDef.spriteId) {
                            visualIds.add(enemyDef.spriteId)
                        }
                    })
                }
            })
        }

        // 5. 传送门资源
        if (mapData.portals && mapData.portals.length > 0) {
            visualIds.add('portal_default')
        }

        return visualIds
    }

    /**
     * 从 World 中收集所有实体当前使用的资源
     * @param {World} world ECS World 实例
     * @returns {Set<string>} 视觉资源 ID 集合
     */
    static getWorldDependencies(world) {
        const visualIds = new Set()

        for (const entity of world) {
            // 跳过全局管理器
            if (entity.globalManager) continue

            // 收集视觉资源
            if (entity.visual && entity.visual.id) {
                visualIds.add(entity.visual.id)
            }
        }

        return visualIds
    }

    /**
     * 将视觉 ID 转换为实际的资源文件 ID
     * @param {Set<string>} visualIds 视觉资源 ID 集合
     * @returns {Set<string>} 资源文件 ID 集合
     */
    static resolveAssetIds(visualIds) {
        const assetIds = new Set()

        for (const visualId of visualIds) {
            const visualDef = VisualDefs[visualId]
            if (visualDef && visualDef.assetId) {
                assetIds.add(visualDef.assetId)
            }
        }

        return assetIds
    }

    /**
     * 一步到位：从地图配置获取所有需要的资源文件 ID
     * @param {object} mapData 地图配置
     * @returns {Set<string>} 资源文件 ID 集合
     */
    static getMapAssetIds(mapData) {
        const visualIds = this.getMapDependencies(mapData)
        return this.resolveAssetIds(visualIds)
    }

    /**
     * 一步到位：从 World 获取所有需要的资源文件 ID
     * @param {World} world ECS World 实例
     * @returns {Set<string>} 资源文件 ID 集合
     */
    static getWorldAssetIds(world) {
        const visualIds = this.getWorldDependencies(world)
        return this.resolveAssetIds(visualIds)
    }
}
