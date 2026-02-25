import { EntityManager } from '@definitions'
import { SceneMigration } from '@definitions/internal/SceneMigration'
import { createLogger } from '@/utils/logger'
import { world } from '@world2d/runtime/WorldEcsRuntime'
import { EntitySerializer } from '@definitions/internal/EntitySerializer'
import { GameEngine } from './GameEngine'

const logger = createLogger('ScenarioLoader')

export class ScenarioLoader {
    /**
     * [纯净模式] 加载场景
     * 直接消费标准的 SceneBundle 数据，不再进行格式转换
     * @param {GameEngine} engine 
     * @param {object} bundle 标准的场景数据包
     * @param {string} entryId 
     * @returns {object} { player, entities }
     */
    static load(engine: GameEngine, bundle: any, entryId: string = 'default') {
        if (!bundle || !bundle.entities) {
            logger.error('Invalid SceneBundle: missing entities')
            return { player: null, entities: [] }
        }

        // 1. 版本迁移 (保留以应对组件结构升级)
        const migratedBundle = SceneMigration.migrate(bundle)
        const config = migratedBundle.header?.config || {}

        const result: { player: any; entities: any[] } = {
            player: null,
            entities: []
        }

        // 2. 确定出生点
        let spawnPoint = config.spawnPoint
        if (config.entryPoints && config.entryPoints[entryId]) {
            spawnPoint = config.entryPoints[entryId]
        }

        // 3. 实体充气 (Hydration)
        const normalizeEntityData = (data: any) => {
            if (!data || data.type) return data;
            // Legacy save data: scene config stored without explicit type
            if (data.id && (data.width !== undefined || data.height !== undefined || data.groundColor !== undefined || data.gravity !== undefined)) {
                return { ...data, type: 'scene_config' };
            }
            // Legacy save data: global manager stored without explicit type
            if (data.camera || data.inputState || data.timer) {
                return { ...data, type: 'global_manager' };
            }
            return data;
        };

        migratedBundle.entities.forEach((entityData: any) => {
            const normalized = normalizeEntityData(entityData);
            if (normalized?.type === 'weapon') return;
            // 直接透传数据给 EntityManager
            // 假设 entityData 结构为 { type: '...', components: { ... } }
            const entity = EntityManager.create(engine, normalized?.type, normalized, {
                player: null // 上下文
            })

            if (entity) {
                result.entities.push(entity)
                if (entity.type === 'player') {
                    result.player = entity
                }
            }
        })

        // 4. 玩家兜底逻辑 (如果存档中没有玩家，则新建)
        if (!result.player) {
            logger.info('No player found in scene data, spawning default player')
            result.player = EntityManager.createPlayer({
                x: spawnPoint?.x || 200,
                y: spawnPoint?.y || 200,
                scale: 1.0 // 默认值，具体应由 Config 决定
            })
            result.entities.push(result.player)
        } else if (spawnPoint) {
            // 强制覆盖玩家位置到入口点
            if (result.player.transform) {
                result.player.transform.prevX = spawnPoint.x
                result.player.transform.prevY = spawnPoint.y
                result.player.transform.x = spawnPoint.x
                result.player.transform.y = spawnPoint.y
            }
        }

        // 5. 初始化相机
        this._initCamera(engine, result.player, config)

        return result
    }

    /**
     * [导出] 将当前世界状态序列化为 Bundle
     */
    static exportScene(engine: GameEngine, mapId: string) {
        // 1. 序列化所有实体
        const entities = Array.from(world)
            .map(ent => EntitySerializer.serialize(ent))
            .filter(Boolean)

        // 2. 获取配置
        const sceneConfigEntity = world.with('sceneConfig').first;
        let sceneName = 'Unknown Scene';
        let config: any = { id: mapId };

        if (sceneConfigEntity && sceneConfigEntity.sceneConfig) {
            sceneName = sceneConfigEntity.sceneConfig.name || sceneName;
            config = { ...sceneConfigEntity.sceneConfig };
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

    // 相机逻辑保持不变，这属于运行时逻辑
    static _initCamera(engine: GameEngine, player: any, config: any = null) {
        if (!player) return
        const globalEntity = world.with('camera', 'globalManager').first
        if (globalEntity && globalEntity.camera) {
            const cam = globalEntity.camera
            // 简单重置相机位置到玩家
            cam.x = player.transform.x - engine.width / 2
            cam.y = player.transform.y - engine.height / 2
            cam.targetX = cam.x
            cam.targetY = cam.y
        }
    }
}
