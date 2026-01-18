import { EntityManager } from '@/game/ecs/entities/EntityManager'
import { BackgroundEntity } from '@/game/ecs/entities/definitions/BackgroundEntity'
import { PlayerConfig } from '@/data/assets'
import Enemies from '@/data/characters/enemies'

/**
 * 实体创建工厂映射表
 * 将不同类型的实体创建逻辑解耦，便于后续扩展
 */
const ENTITY_FACTORIES = {
    // 背景层工厂
    background: (mapData) => {
        if (mapData.background) {
            const groundW = 2000
            const groundH = 2000
            BackgroundEntity.createGround(groundW, groundH, mapData.background.groundColor)
        }
    },

    // 装饰物工厂
    decorations: (mapData) => {
        mapData.decorations?.forEach(dec => {
            let y = dec.y
            if (y === undefined && dec.yRatio !== undefined) {
                y = dec.yRatio * 600
            }

            EntityManager.createDecoration({
                x: dec.x,
                y: y || 0,
                name: dec.spriteId ? `Decoration_${dec.spriteId}` : 'Decoration_Rect',
                config: {
                    spriteId: dec.spriteId,
                    scale: dec.scale,
                    rect: dec.type === 'rect' ? {
                        width: dec.width,
                        height: dec.height,
                        color: dec.color
                    } : undefined
                }
            })
        })
    },

    // 玩家工厂
    player: (mapData, entryId) => {
        const player = EntityManager.createPlayer({
            x: 200,
            y: 260,
            scale: PlayerConfig.scale
        })

        // 处理出生点
        let spawn = mapData.spawnPoint
        if (mapData.entryPoints && mapData.entryPoints[entryId]) {
            spawn = mapData.entryPoints[entryId]
        }

        if (spawn) {
            player.position.x = spawn.x
            player.position.y = spawn.y
        }

        return player
    },

    // 敌人/生成器工厂
    enemies: (mapData) => {
        const created = []
        mapData.spawners?.forEach(spawner => {
            for (let i = 0; i < spawner.count; i++) {
                let x = 0, y = 0
                if (spawner.area) {
                    x = spawner.area.x + Math.random() * spawner.area.w
                    y = spawner.area.y + Math.random() * spawner.area.h
                } else {
                    x = 300
                    y = 300
                }

                const group = spawner.enemyIds.map(id => ({ id }))
                const leaderId = spawner.enemyIds[0]
                const leaderDef = Enemies[leaderId]
                const spriteId = (leaderDef && leaderDef.spriteId) ? leaderDef.spriteId : 'default'

                const enemyEntity = EntityManager.createEnemy({
                    x, y,
                    battleGroup: group,
                    options: {
                        ...spawner.options,
                        spriteId: spriteId,
                        minYRatio: mapData.constraints?.minYRatio,
                    }
                })
                created.push(enemyEntity)
            }
        })
        return created
    },

    // NPC 工厂
    npcs: (mapData) => {
        const created = []
        mapData.npcs?.forEach(data => {
            const npcEntity = EntityManager.createNPC({
                x: data.x,
                y: data.y,
                name: data.name,
                config: {
                    ...data,
                    x: undefined,
                    y: undefined,
                    name: undefined
                }
            })
            created.push(npcEntity)
        })
        return created
    },

    // 传送门工厂
    portals: (mapData) => {
        const created = []
        mapData.portals?.forEach(data => {
            const portalEntity = EntityManager.createPortal({
                x: data.x,
                y: data.y,
                name: data.name,
                width: data.w,
                height: data.h,
                targetMapId: data.targetMapId,
                targetEntryId: data.targetEntryId
            })
            created.push(portalEntity)
        })
        return created
    }
}

export class ScenarioLoader {
    /**
     * 加载场景实体 (静态配置加载)
     * @param {object} engine 
     * @param {object} mapData 
     * @param {string} entryId 
     * @returns {object} { player, entities }
     */
    static load(engine, mapData, entryId = 'default') {
        const result = {
            player: null,
            entities: []
        }

        if (!mapData) return result

        // 1. 执行背景和装饰物初始化 (不返回实体引用)
        ENTITY_FACTORIES.background(mapData)
        ENTITY_FACTORIES.decorations(mapData)

        // 2. 创建核心实体
        result.player = ENTITY_FACTORIES.player(mapData, entryId)
        result.entities.push(result.player)

        // 3. 创建其他业务实体
        const otherEntities = [
            ...ENTITY_FACTORIES.enemies(mapData),
            ...ENTITY_FACTORIES.npcs(mapData),
            ...ENTITY_FACTORIES.portals(mapData)
        ]
        
        result.entities.push(...otherEntities)

        return result
    }

    /**
     * 从保存状态恢复实体 (动态状态恢复)
     * @param {object} engine 
     * @param {object} state 
     * @param {object} [mapData] 
     * @returns {object} { player, entities }
     */
    static restore(engine, state, mapData = null) {
        const result = {
            player: null,
            entities: []
        }

        // 1. 恢复静态背景（通常不随存档改变）
        if (mapData) {
            ENTITY_FACTORIES.background(mapData)
            ENTITY_FACTORIES.decorations(mapData)
        }

        // 2. 从状态列表恢复动态实体
        if (state.entities) {
            state.entities.forEach(item => {
                const entity = EntityManager.create(engine, item.type, item.data, {
                    player: null
                })

                if (entity) {
                    result.entities.push(entity)
                    if (entity.type === 'player') {
                        result.player = entity
                    }
                }
            })
        }

        // 3. 补丁逻辑：如果是旧存档缺失传送门，从地图配置补全
        if (mapData?.portals) {
            const hasPortals = result.entities.some(e => e.type === 'portal')
            if (!hasPortals) {
                console.warn('[ScenarioLoader] Legacy Save: Injecting portals from map data.')
                const portals = ENTITY_FACTORIES.portals(mapData)
                result.entities.push(...portals)
            }
        }

        // 4. 安全回退：确保玩家存在
        if (!result.player) {
            console.warn('[ScenarioLoader] Player missing in state, recreating...')
            result.player = ENTITY_FACTORIES.player(mapData || {}, 'default')
            result.entities.push(result.player)
        }

        return result
    }
}
