import { world, clearWorld } from '@world2d/world'
// import { getMapData } from '@schema/maps' // Removed static import
import { createLogger } from '@/utils/logger'
import { SceneLifecycle } from '@world2d/resources/SceneLifecycle'
import { DamageDetectSenseSystem } from '@systems/sense/DamageDetectSenseSystem'
import { PortalDetectSenseSystem } from '@systems/sense/PortalDetectSenseSystem'
import { SyncTransformSystem } from '@systems/physics/SyncTransformSystem'
import { GameEngine } from './GameEngine'
import { WorldScene } from './WorldScene'

const logger = createLogger('SceneManager')

export interface SceneTransitionRequest {
    type: string;
    mapId: string;
    entryId: string;
}

/**
 * 场景管理器 (中间层)
 * 负责协调 ECS、Store 和资源加载，处理地图切换的核心流程。
 */
export class SceneManager {
    engine: GameEngine;
    worldStore: any; // useWorld2dStore
    currentScene: WorldScene | null;
    isTransitioning: boolean;
    pendingRequest: SceneTransitionRequest | null;
    _resolveTransition: (() => void) | null;

    /**
     * @param {GameEngine} engine 
     * @param {import('@/stores/world2d').useWorld2dStore} worldStore 
     */
    constructor(engine: GameEngine, worldStore: any) {
        this.engine = engine
        this.worldStore = worldStore
        this.currentScene = null

        // 状态标志
        this.isTransitioning = false
        this.pendingRequest = null
        this._resolveTransition = null // 用于等待切换完成的 Promise resolve
    }

    /**
     * 设置当前场景实例（用于序列化）
     * @param {WorldScene} scene 
     */
    setScene(scene: WorldScene) {
        this.currentScene = scene
    }

    /**
     * 每一帧更新 (由 ECS System 调用)
     */
    update() {
        if (this.pendingRequest) {
            const req = this.pendingRequest;
            const res = this._resolveTransition;
            this.pendingRequest = null;
            this._resolveTransition = null;

            this.executeTransition(req).then(() => {
                if (res) res();
            });
        }
    }

    /**
     * 请求切换地图
     * @param {string} mapId 
     * @param {string} entryId 
     * @returns {Promise}
     */
    requestSwitchMap(mapId: string, entryId: string): Promise<void> {
        if (this.isTransitioning) return Promise.resolve()

        // 如果已经有请求在排队，先取消旧的（或者等待，这里选择覆盖）
        return new Promise((resolve) => {
            this.pendingRequest = { type: 'MAP', mapId, entryId }
            this._resolveTransition = resolve
        });
    }

    /**
     * 执行切换逻辑 (原子操作)
     */
    async executeTransition(request: SceneTransitionRequest) {
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

    async _handleMapSwitch({ mapId, entryId }: { mapId: string, entryId: string }) {
        // 1. 保存当前状态 (CRITICAL: 必须在 clearWorld 之前)
        if (this.currentScene) {
            logger.info(`Saving state for ${this.worldStore.currentMapId}`)
            this.worldStore.saveState(this.currentScene)
        }

        // 2. 加载新地图数据
        logger.info(`Loading map data: ${mapId}`)
        // let mapData = await getMapData(mapId) // Removed static import
        let mapData = null;
        
        // 5. 尝试加载存档 (先加载，因为动态地图的配置可能就在这里)
        // [IMPORTANT] 我们只是预览一下 store 中的数据，不要真正的切换 currentMapId
        // 因为如果这时候切换了，上面的 saveState 就会存错地方（虽然 saveState 已经在上面执行过了）
        // 更重要的是，如果这里切换了，后续的逻辑可能会混乱
        // 所以我们手动从 store 中获取数据，而不是调用 loadMap
        const persistedState = this.worldStore.worldStates[mapId];

        // [FIX] 如果静态数据不存在，尝试从持久化状态中提取配置 (针对动态创建的场景)
        if (!mapData && persistedState && persistedState.header && persistedState.header.config) {
            logger.info(`Using dynamic map config from store for: ${mapId}`)
            mapData = persistedState.header.config
        }

        if (!mapData) throw new Error(`Map data not found: ${mapId}`)

        // 3. 清理 ECS 世界
        clearWorld()
        // 3.1 重置探测区域系统的缓存 (清除旧地图的静态实体)
        DamageDetectSenseSystem.reset()
        PortalDetectSenseSystem.reset()

        // 4. 更新 Store 指向新地图 (真正切换 ID)
        this.worldStore.currentMapId = mapId
        
        // 重新加载一次以确保 currentMapState 正确更新 (虽然我们已经有了 persistedState，但 loadMap 还有其他副作用如校验)
        this.worldStore.loadMap(mapId)

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
            (progress: any) => {
                // 进度回调（可以用于 UI 显示）
                if (progress.phase === 'loading') {
                    logger.info(`Loading assets: ${(progress.progress * 100).toFixed(0)}%`)
                }
            }
        )

        const player = result.find((e: any) => e.type === 'player');

        // 8. 修正玩家位置到入口点 (如果是传送进入)
        if (entryId && mapData.entryPoints && mapData.entryPoints[entryId] && player) {
            const spawn = mapData.entryPoints[entryId]
            // Ensure we are accessing the correct component for position (transform)
            if (player.transform) {
                player.transform.prevX = spawn.x
                player.transform.prevY = spawn.y
                player.transform.x = spawn.x
                player.transform.y = spawn.y
            }
            logger.info(`Player spawned at entry point: ${entryId}`)
        }

        // 9. 🎯 [FIX] 如果是新加载的场景，保存完整的场景状态（包括 header.config）
        // 避免下次切换回来时 Ground 消失
        if (!persistedState && this.currentScene) {
            logger.info(`Initializing state for new map: ${mapId}`)
            this.worldStore.saveState(this.currentScene)
        }

        // 10. 更新 Scene 的 player 引用
        if (this.currentScene) {
            this.currentScene.player = player
        }

        // 11. 强制同步一次坐标 (确保子实体位置正确，避免第一帧堆积在 0,0)
        SyncTransformSystem.update?.()

        logger.info(`✅ Map switch complete: ${mapId}`)
    }
}
