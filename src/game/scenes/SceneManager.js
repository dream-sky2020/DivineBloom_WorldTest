import { world, clearWorld } from '@/game/ecs/world'
import { ScenarioLoader } from '@/game/ecs/ScenarioLoader'
import { EntityManager } from '@/game/ecs/entities/EntityManager'
import { getMapData } from '@/data/maps'
import { createLogger } from '@/utils/logger'
import { SceneLifecycle } from '@/game/ecs/resources/SceneLifecycle'

const logger = createLogger('SceneManager')

/**
 * 场景管理器 (中间层)
 * 负责协调 ECS、Store 和资源加载，处理地图切换的核心流程。
 */
export class SceneManager {
    /**
     * @param {import('@/game/GameEngine').GameEngine} engine 
     * @param {import('@/stores/world').useWorldStore} worldStore 
     */
    constructor(engine, worldStore) {
        this.engine = engine
        this.worldStore = worldStore
        this.currentScene = null

        // 状态标志
        this.isTransitioning = false
        this.pendingRequest = null
    }

    /**
     * 设置当前场景实例（用于序列化）
     * @param {import('@/game/scenes/WorldScene').WorldScene} scene 
     */
    setScene(scene) {
        this.currentScene = scene
    }

    /**
     * 每一帧更新 (由 ECS System 调用)
     */
    update() {
        if (this.pendingRequest) {
            this.executeTransition(this.pendingRequest)
            this.pendingRequest = null
        }
    }

    /**
     * 请求切换地图
     * @param {string} mapId 
     * @param {string} entryId 
     */
    requestSwitchMap(mapId, entryId) {
        if (this.isTransitioning) return
        this.pendingRequest = { type: 'MAP', mapId, entryId }
    }

    /**
     * 执行切换逻辑 (原子操作)
     */
    async executeTransition(request) {
        this.isTransitioning = true
        // Sync transition state to current scene to pause ECS updates
        if (this.currentScene) {
            this.currentScene.isTransitioning = true
        }

        logger.info(`Executing transition:`, request)

        try {
            if (request.type === 'MAP') {
                await this._handleMapSwitch(request)
            }
        } catch (e) {
            logger.error(`Transition failed:`, e)
        } finally {
            this.isTransitioning = false
            // Unpause scene
            if (this.currentScene) {
                this.currentScene.isTransitioning = false
            }
        }
    }

    async _handleMapSwitch({ mapId, entryId }) {
        // 1. 保存当前状态 (CRITICAL: 必须在 clearWorld 之前)
        if (this.currentScene) {
            logger.info(`Saving state for ${this.worldStore.currentMapId}`)
            this.worldStore.saveState(this.currentScene)
        }

        // 2. 加载新地图数据
        logger.info(`Loading map data: ${mapId}`)
        const mapData = await getMapData(mapId)
        if (!mapData) throw new Error(`Map data not found: ${mapId}`)

        // 3. 清理 ECS 世界
        clearWorld()

        // 4. 更新 Store 指向新地图
        this.worldStore.currentMapId = mapId

        // 5. 尝试加载存档
        this.worldStore.loadMap(mapId)
        const persistedState = this.worldStore.currentMapState

        // 6. 更新 Scene 的 mapData
        if (this.currentScene) {
            this.currentScene.mapData = mapData
            this.currentScene.entryId = entryId
        }

        // 🎯 7. 使用现代化场景生命周期管理
        logger.info(`Preparing scene using SceneLifecycle...`)
        const result = await SceneLifecycle.prepareScene(
            mapData,
            this.engine,
            entryId,
            persistedState,
            (progress) => {
                // 进度回调（可以用于 UI 显示）
                if (progress.phase === 'loading') {
                    logger.info(`Loading assets: ${(progress.progress * 100).toFixed(0)}%`)
                }
            }
        )

        const player = result.player

        // 8. 修正玩家位置到入口点 (如果是传送进入)
        if (entryId && mapData.entryPoints && mapData.entryPoints[entryId] && player) {
            const spawn = mapData.entryPoints[entryId]
            player.position.x = spawn.x
            player.position.y = spawn.y
            logger.info(`Player spawned at entry point: ${entryId}`)
        }

        // 9. 如果是新加载的场景，同步状态到 Store
        if (!persistedState && result.entities) {
            const serializedEntities = result.entities
                .map(e => EntityManager.serialize(e))
                .filter(e => e !== null)

            this.worldStore.initCurrentState(serializedEntities)
        }

        // 10. 更新 Scene 的 player 引用
        if (this.currentScene) {
            this.currentScene.player = player
        }

        logger.info(`✅ Map switch complete: ${mapId}`)
    }
}
