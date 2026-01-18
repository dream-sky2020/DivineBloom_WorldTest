import { EntityManager } from '@/game/entities/EntityManager'
import { BackgroundEntity } from '@/game/entities/definitions/BackgroundEntity'
import { PlayerConfig } from '@/data/assets'
import Enemies from '@/data/characters/enemies'

export class ScenarioLoader {
    /**
     * 加载场景实体 (Player, Enemies, NPCs, Background)
     * @param {object} engine 
     * @param {object} mapData 
     * @param {string} entryId 
     * @returns {object} 返回创建的关键实体引用 (如 player)
     */
    static load(engine, mapData, entryId = 'default') {
        const result = {
            player: null,
            entities: []
        }

        if (!mapData) return result

        // 0. Spawn Background (Ground only)
        if (mapData.background) {
            const groundW = 2000
            const groundH = 2000
            BackgroundEntity.createGround(groundW, groundH, mapData.background.groundColor)
        }

        // 0.5 Spawn Decorations (As top-level entities)
        if (mapData.decorations) {
            mapData.decorations.forEach(dec => {
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
        }

        // 1. Create Player
        // 默认位置，会被 spawn point 覆盖
        const player = EntityManager.createPlayer({
            x: 200,
            y: 260,
            scale: PlayerConfig.scale
        })
        result.entities.push(player)
        result.player = player

        // Set Player Spawn from Entry Point
        let spawn = mapData.spawnPoint
        if (mapData.entryPoints && mapData.entryPoints[entryId]) {
            spawn = mapData.entryPoints[entryId]
        }

        if (spawn) {
            player.position.x = spawn.x
            player.position.y = spawn.y
        }

        // 2. Spawn Enemies
        if (mapData.spawners) {
            mapData.spawners.forEach(spawner => {
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

                    // Determine visual from the first enemy in group (leader)
                    const leaderId = spawner.enemyIds[0]
                    const leaderDef = Enemies[leaderId]
                    const spriteId = (leaderDef && leaderDef.spriteId) ? leaderDef.spriteId : 'default'

                    const enemyData = {
                        x, y,
                        battleGroup: group,
                        options: {
                            ...spawner.options,
                            spriteId: spriteId,
                            minYRatio: mapData.constraints?.minYRatio,
                        }
                    }

                    const enemyEntity = EntityManager.createEnemy(enemyData)
                    result.entities.push(enemyEntity)
                }
            })
        }

        // 3. Spawn NPCs
        if (mapData.npcs) {
            mapData.npcs.forEach(data => {
                const npcData = {
                    x: data.x,
                    y: data.y,
                    name: data.name, // 传递名称
                    config: {
                        ...data,
                        x: undefined,
                        y: undefined,
                        name: undefined // 避免重复
                    }
                }

                const npcEntity = EntityManager.createNPC(npcData)
                result.entities.push(npcEntity)
            })
        }

        // 4. Spawn Portals
        if (mapData.portals) {
            mapData.portals.forEach(data => {
                const portalData = {
                    x: data.x,
                    y: data.y,
                    name: data.name, // 传递名称
                    width: data.w,
                    height: data.h,
                    targetMapId: data.targetMapId,
                    targetEntryId: data.targetEntryId
                }
                const portalEntity = EntityManager.createPortal(portalData)
                result.entities.push(portalEntity)
            })
        }

        return result
    }

    /**
     * 从保存状态恢复实体
     * @param {object} engine 
     * @param {object} state 
     * @param {object} [mapData] Optional fallback for missing static entities
     * @returns {object} { player, entities }
     */
    static restore(engine, state, mapData = null) {
        const result = {
            player: null,
            entities: []
        }

        // 0. Restore Background (Ground and Decorations)
        if (mapData && mapData.background) {
            const groundW = 2000
            const groundH = 2000
            BackgroundEntity.createGround(groundW, groundH, mapData.background.groundColor)
        }

        if (mapData && mapData.decorations) {
            mapData.decorations.forEach(dec => {
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
        }

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

        // Safety Fallback: Check for missing Portals in old saves
        // If we have mapData but no portals were restored, inject them
        if (mapData && mapData.portals) {
            const hasPortals = result.entities.some(e => e.type === 'portal')
            if (!hasPortals) {
                console.warn('[ScenarioLoader] ⚠️ No portals found in save state. Injecting from map data (Legacy Save Fix).')
                mapData.portals.forEach(data => {
                    const portalData = {
                        x: data.x,
                        y: data.y,
                        name: data.name, // 传递名称
                        width: data.w,
                        height: data.h,
                        targetMapId: data.targetMapId,
                        targetEntryId: data.targetEntryId
                    }
                    const portalEntity = EntityManager.createPortal(portalData)
                    result.entities.push(portalEntity)
                })
            }
        }

        // Fallback: recreate player if missing
        if (!result.player) {
            console.warn('Player not found in save state, recreating...')
            const player = EntityManager.createPlayer({
                x: 200,
                y: 260,
                scale: PlayerConfig.scale
            })
            result.entities.push(player)
            result.player = player
        }

        return result
    }
}
