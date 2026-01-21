import { EntityManager } from '@/game/ecs/entities/EntityManager'
import { BackgroundEntity } from '@/game/ecs/entities/definitions/BackgroundEntity'
import { SceneEntity } from '@/game/ecs/entities/definitions/SceneEntity'
import { PlayerConfig } from '@/data/assets'
import Enemies from '@/data/characters/enemies'
import { world } from '@/game/ecs/world'
import { SceneMigration } from './entities/internal/SceneMigration'
import { EntitySerializer } from './entities/internal/EntitySerializer'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ScenarioLoader')

/**
 * 实体创建工厂映射表
 * 将不同类型的实体创建逻辑解耦，便于后续扩展
 */
const ENTITY_FACTORIES = {
    // 背景层工厂
    background: (config) => {
        // 创建场景配置实体 (ECS 数据驱动)
        SceneEntity.create(config)

        if (config && config.groundColor) {
            const groundW = config.width || 2000
            const groundH = config.height || 2000
            BackgroundEntity.createGround(groundW, groundH, config.groundColor)
        }
    },

    // 玩家工厂 (特殊处理，通常不在场景数据中持久化位置，除非是存档)
    player: (config, spawnPoint) => {
        const player = EntityManager.createPlayer({
            x: spawnPoint?.x || 200,
            y: spawnPoint?.y || 260,
            scale: config.playerScale || PlayerConfig.scale
        })
        return player
    }
}

export class ScenarioLoader {
    /**
     * [归一化入口] 加载场景
     * 支持加载原始 Map 配置或编辑器导出的 Bundle
     * @param {object} engine 
     * @param {object} source 地图配置或导出的场景包
     * @param {string} entryId 
     * @returns {object} { player, entities }
     */
    static load(engine, source, entryId = 'default') {
        if (!source) return { player: null, entities: [] }

        // 1. 归一化处理：将不同来源的数据统一为 SceneBundle 格式
        let bundle = this.normalize(source)

        // 2. 版本迁移：处理组件变更导致的结构差异
        bundle = SceneMigration.migrate(bundle)

        // 3. 执行物理层加载 (背景/相机等配置)
        const config = bundle.header?.config || {}
        ENTITY_FACTORIES.background(config)

        // 4. 执行实体加载
        const result = {
            player: null,
            entities: []
        }

        // 4.1 确定玩家出生点 (如果是跨地图进入)
        let spawnPoint = config.spawnPoint
        if (config.entryPoints && config.entryPoints[entryId]) {
            spawnPoint = config.entryPoints[entryId]
        }

        // 4.2 从 bundle.entities 还原所有实体
        bundle.entities.forEach(item => {
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

        // 4.3 安全检查：如果没有玩家实体 (比如新场景加载)，则手动创建一个
        if (!result.player) {
            result.player = ENTITY_FACTORIES.player(config, spawnPoint)
            result.entities.push(result.player)
        } else if (spawnPoint) {
            // 如果已有玩家实体但有指定的入口点，则覆盖坐标
            result.player.position.x = spawnPoint.x
            result.player.position.y = spawnPoint.y
        }

        // 5. 初始化相机
        this._initCamera(engine, result.player, config)

        return result
    }

    /**
     * 将原始地图配置 (src/data/maps/*.js) 转换为统一的归一化格式
     * @param {object} source 
     * @returns {object} SceneBundle
     */
    static normalize(source) {
        // 1. 如果已经是完整的 Bundle 格式，直接返回
        if (source.header && source.entities) {
            return source
        }

        // 2. 如果是只有 entities 的存档数据 (兼容旧格式或部分导出)
        if (source.entities && Array.isArray(source.entities)) {
            return {
                header: {
                    version: '1.0.0',
                    config: source.config || { id: 'unknown' }
                },
                entities: source.entities
            }
        }

        // 3. 执行“展开”逻辑，将 MapSchema 静态配置转换为具体的实体实例列表
        const entities = []
        const config = {
            id: source.id,
            width: source.width || 800,
            height: source.height || 600,
            groundColor: source.background?.groundColor || '#000',
            entryPoints: source.entryPoints,
            spawnPoint: source.spawnPoint
        }

        // 转换装饰物
        source.decorations?.forEach(dec => {
            let y = dec.y
            if (y === undefined && dec.yRatio !== undefined) {
                y = dec.yRatio * config.height
            }
            entities.push({
                type: 'decoration',
                data: {
                    x: dec.x,
                    y: y || 0,
                    name: dec.spriteId ? `Decoration_${dec.spriteId}` : 'Decoration_Rect',
                    config: {
                        spriteId: dec.spriteId,
                        scale: dec.scale,
                        collider: dec.collider,
                        rect: dec.type === 'rect' ? {
                            width: dec.width,
                            height: dec.height,
                            color: dec.color
                        } : undefined
                    }
                }
            })
        })

        // 转换障碍物
        source.obstacles?.forEach(obs => {
            entities.push({
                type: 'obstacle',
                data: { 
                    name: obs.name || `Obstacle_${obs.shape || 'Box'}`,
                    ...obs 
                }
            })
        })

        // 转换传送门目的地
        source.portalDestinations?.forEach(dest => {
            entities.push({
                type: 'portal_destination',
                data: { ...dest }
            })
        })

        // 转换 NPC
        source.npcs?.forEach(npc => {
            entities.push({
                type: 'npc',
                data: {
                    x: npc.x,
                    y: npc.y,
                    name: npc.name,
                    config: { ...npc, x: undefined, y: undefined, name: undefined }
                }
            })
        })

        // 转换传送门
        source.portals?.forEach(portal => {
            entities.push({
                type: 'portal',
                data: {
                    x: portal.x, y: portal.y, name: portal.name,
                    width: portal.w, height: portal.h,
                    isForced: portal.isForced,
                    targetMapId: portal.targetMapId,
                    targetEntryId: portal.targetEntryId,
                    destinationId: portal.destinationId,
                    targetX: portal.targetX,
                    targetY: portal.targetY
                }
            })
        })

        // 转换刷怪点为具体敌人实例 (静态展开)
        source.spawners?.forEach(spawner => {
            for (let i = 0; i < spawner.count; i++) {
                let x = 0, y = 0
                if (spawner.area) {
                    x = spawner.area.x + Math.random() * spawner.area.w
                    y = spawner.area.y + Math.random() * spawner.area.h
                } else {
                    x = 300; y = 300;
                }

                const leaderId = spawner.enemyIds[0]
                const leaderDef = Enemies[leaderId]
                const spriteId = (leaderDef && leaderDef.spriteId) ? leaderDef.spriteId : 'default'

                entities.push({
                    type: 'enemy',
                    data: {
                        x, y,
                        battleGroup: spawner.enemyIds.map(id => ({ id })),
                        options: {
                            ...spawner.options,
                            spriteId: spriteId,
                            minYRatio: source.constraints?.minYRatio,
                        }
                    }
                })
            }
        })

        return {
            header: {
                version: '1.0.0', // 原始 MapSchema 视为 1.0.0
                config: config
            },
            entities: entities
        }
    }

    /**
     * [导出入口] 将当前场景导出为归一化 Bundle
     */
    static exportScene(engine, mapId) {
        // [FIX] miniplex world 没有 .entities 属性，需使用 Array.from(world)
        const entities = Array.from(world)
            .map(ent => EntitySerializer.serialize(ent))
            .filter(Boolean)

        // [FIX] 优先从 SceneConfig 组件获取场景元数据，解决切换场景或编辑后的持久化问题
        const sceneConfigEntity = world.with('sceneConfig').first;
        let groundW, groundH, groundColor, sceneName;

        if (sceneConfigEntity) {
            const config = sceneConfigEntity.sceneConfig;
            groundW = config.width;
            groundH = config.height;
            groundColor = config.groundColor;
            sceneName = config.name;
        } else {
            // 备选方案：尝试从世界中查找地面实体以获取背景色和尺寸
            const groundEntity = Array.from(world).find(e => e.type === 'background_ground');
            groundColor = groundEntity?.visual?.color || '#000';
            groundW = groundEntity?.visual?.width || 3200;
            groundH = groundEntity?.visual?.height || 2400;
            sceneName = 'Unknown Scene';
        }

        const config = {
            id: mapId,
            name: sceneName,
            width: groundW,
            height: groundH,
            groundColor: groundColor
        }

        return {
            header: {
                version: SceneMigration.CURRENT_VERSION,
                config: config,
                exportTime: new Date().toISOString()
            },
            entities: entities
        }
    }

    /**
     * [存档恢复] 以前的 restore 现在可以复用 load 逻辑
     */
    static restore(engine, state, mapData = null) {
        // 如果 state 已经是 Bundle 格式，直接 load
        // 如果是旧存档格式，则需要进行一次转换
        return this.load(engine, state)
    }

    /**
     * [项目级导出] 导出整个项目的所有地图数据
     * @param {object} engine
     * @param {object} worldStates store中的所有地图持久化状态
     * @param {object} mapLoaders 外部传入的地图加载器字典
     * @returns {object} ProjectBundle
     */
    static async exportProject(engine, worldStates, mapLoaders) {
        const projectBundle = {
            project: {
                version: SceneMigration.CURRENT_VERSION,
                exportTime: new Date().toISOString(),
                mapIds: Object.keys(mapLoaders || {})
            },
            maps: {}
        };

        const targetMaps = mapLoaders || {};

        // 遍历所有定义的地图
        for (const mapId of Object.keys(targetMaps)) {
            // 1. 优先获取内存中已改变的状态
            if (worldStates[mapId]) {
                projectBundle.maps[mapId] = worldStates[mapId];
            } else {
                // 2. 如果内存没有，则读取静态配置并归一化
                try {
                    const rawData = await targetMaps[mapId]();
                    projectBundle.maps[mapId] = this.normalize(rawData);
                } catch (e) {
                    logger.error(`Failed to pre-load map ${mapId} for export`, e);
                }
            }
        }

        return projectBundle;
    }

    /**
     * [项目级导入] 解析项目包
     * @param {object} projectBundle 
     * @returns {object} { worldStates }
     */
    static importProject(projectBundle) {
        if (!projectBundle.project || !projectBundle.maps) {
            throw new Error('Invalid project bundle format');
        }

        const worldStates = {};
        for (const [mapId, sceneBundle] of Object.entries(projectBundle.maps)) {
            // 对每个场景包进行版本迁移
            const migrated = SceneMigration.migrate(sceneBundle);
            worldStates[mapId] = {
                entities: migrated.entities,
                isInitialized: true
            };
        }

        return worldStates;
    }

    /**
     * 初始化相机
     */
    static _initCamera(engine, player, config = null) {
        if (!player) return

        const globalEntity = world.with('camera', 'globalManager').first
        if (globalEntity && globalEntity.camera) {
            const cam = globalEntity.camera
            const viewportWidth = engine.width
            const viewportHeight = engine.height
            const mapWidth = config?.width || 800
            const mapHeight = config?.height || 600

            // 检查地图是否大于视口
            const isMapLargerX = mapWidth > viewportWidth
            const isMapLargerY = mapHeight > viewportHeight

            let targetX = 0
            let targetY = 0

            if (isMapLargerX) {
                targetX = player.position.x - viewportWidth / 2
                if (cam.useBounds) {
                    const maxX = mapWidth - viewportWidth
                    targetX = Math.max(0, Math.min(targetX, maxX))
                }
            } else {
                targetX = (mapWidth - viewportWidth) / 2
            }

            if (isMapLargerY) {
                targetY = player.position.y - viewportHeight / 2
                if (cam.useBounds) {
                    const maxY = mapHeight - viewportHeight
                    targetY = Math.max(0, Math.min(targetY, maxY))
                }
            } else {
                targetY = (mapHeight - viewportHeight) / 2
            }

            cam.x = targetX
            cam.y = targetY
            cam.targetX = cam.x
            cam.targetY = cam.y
        }
    }
}
