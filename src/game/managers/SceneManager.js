import { world, clearWorld } from '@/game/ecs/world'
import { ScenarioLoader } from '@/game/utils/ScenarioLoader'
import { EntityManager } from '@/game/entities/EntityManager'
import { getMapData } from '@/data/maps'

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
     * 请求进入战斗
     * @param {Array} enemyGroup 
     * @param {string} battleId 
     */
    requestBattle(enemyGroup, battleId) {
        // 战斗切换目前较简单，可以直接回调，或者也走这里
        // 这里我们主要处理地图切换，战斗保持原样或稍后集成
        // 为了统一，我们也可以在这里处理
        this.pendingRequest = { type: 'BATTLE', enemyGroup, battleId }
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

        console.log(`[SceneManager] Executing transition:`, request)

        try {
            if (request.type === 'MAP') {
                await this._handleMapSwitch(request)
            } else if (request.type === 'BATTLE') {
                this._handleBattle(request)
            }
        } catch (e) {
            console.error(`[SceneManager] Transition failed:`, e)
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
            console.log(`[SceneManager] Saving state for ${this.worldStore.currentMapId}`)
            this.worldStore.saveState(this.currentScene)
        }

        // 2. 预加载新地图数据
        // (可以在这里做 Loading UI 的回调)
        // const loadingHandle = showLoading()

        const mapData = await getMapData(mapId)
        if (!mapData) throw new Error(`Map data not found: ${mapId}`)

        // 3. 清理 ECS 世界
        clearWorld()

        // 4. 更新 Store 指向新地图
        this.worldStore.currentMapId = mapId

        // 5. 尝试加载存档
        this.worldStore.loadMap(mapId)
        const persistedState = this.worldStore.currentMapState

        // 6. 重建场景
        // 更新 Scene 的 mapData
        if (this.currentScene) {
            this.currentScene.mapData = mapData
            this.currentScene.entryId = entryId
            // 重新初始化依赖 mapData 的系统
            // (注意：理想情况下这些 System 应该在 update 里自动检测 mapData 变化，但手动 init 也行)
            if (this.currentScene.onMapLoaded) {
                this.currentScene.onMapLoaded(mapData)
            }
        }

        let player = null

        // 策略：如果存在有效的存档（且包含实体），则恢复；否则加载默认
        // 增加健壮性检查：如果 entities 为空数组，视为无效存档，回退到默认
        if (persistedState && persistedState.entities && persistedState.entities.length > 0) {
            console.log(`[SceneManager] Restoring state for ${mapId}`)
            const result = ScenarioLoader.restore(this.engine, persistedState, mapData)
            player = result.player

            // 修正玩家位置到入口点 (如果是传送进入)
            if (entryId && mapData.entryPoints && mapData.entryPoints[entryId] && player) {
                const spawn = mapData.entryPoints[entryId]
                player.position.x = spawn.x
                player.position.y = spawn.y
            }
        } else {
            console.log(`[SceneManager] Loading default scenario for ${mapId}`)
            const result = ScenarioLoader.load(this.engine, mapData, entryId)
            player = result.player

            // CRITICAL FIX: 初始化 Store 状态，确保后续战斗返回时有数据可更新
            // 默认地图加载后，entities 应该同步到 store
            if (result.entities) {
                // Serialize entities before passing to store (Store expects validated schema objects, not ECS entities)
                const serializedEntities = result.entities
                    .map(e => EntityManager.serialize(e))
                    .filter(e => e !== null) // EntitySerializer returns {type, data} or null

                this.worldStore.initCurrentState(serializedEntities)
            }
        }

        // 7. 玩家状态传递 (HP/Inventory)
        // 从 Store 或之前的 Scene 实例中获取跨场景数据
        // TODO: 如果需要保留上一张图的血量，需要在 saveState 时保存到全局 Store，这里再读出来

        console.log(`[SceneManager] Transition complete.`)
    }

    _handleBattle({ enemyGroup, battleId }) {
        // 战斗不需要 clearWorld (如果是覆盖式 UI)
        // 或者需要 clearWorld (如果是独立 Scene)
        // 目前假设是 Vue 层切换 UI
        if (this.currentScene && this.currentScene.onEncounter) {
            this.currentScene.onEncounter(enemyGroup, battleId)
        }
    }
}

