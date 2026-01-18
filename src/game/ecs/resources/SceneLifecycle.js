import { ScenarioLoader } from '@/game/ecs/ScenarioLoader'
import { ResourceDeclaration } from './ResourceDeclaration'
import { Visuals as VisualDefs } from '@/data/visuals'
import { world } from '@/game/ecs/world'

/**
 * 场景生命周期管理
 * 负责场景的完整加载流程：资源预加载 -> 实体创建 -> 验证
 */
export class SceneLifecycle {
    /**
     * 准备场景（完整流程）
     * @param {object} mapData 地图配置
     * @param {object} engine 游戏引擎
     * @param {string} entryId 入口点 ID
     * @param {object} [savedState] 保存的状态（用于恢复）
     * @param {Function} [onProgress] 进度回调
     * @returns {Promise<{ player: object, entities: array }>}
     */
    static async prepareScene(mapData, engine, entryId = 'default', savedState = null, onProgress = null) {
        console.log('[SceneLifecycle] Starting scene preparation...')

        // Phase 1: 预加载资源（在创建实体之前）
        console.log('[SceneLifecycle] Phase 1: Preloading assets')
        await this.preloadPhase(mapData, engine, (progress) => {
            if (onProgress) {
                onProgress({
                    phase: 'loading',
                    ...progress
                })
            }
        })

        // Phase 2: 创建实体
        console.log('[SceneLifecycle] Phase 2: Creating entities')
        const entities = await this.createEntitiesPhase(mapData, engine, entryId, savedState)

        if (onProgress) {
            onProgress({
                phase: 'entities',
                progress: 1.0
            })
        }

        // Phase 3: 验证资源完整性
        console.log('[SceneLifecycle] Phase 3: Validating resources')
        const validation = this.validatePhase(world, engine)

        if (validation.missing.length > 0) {
            console.warn('[SceneLifecycle] ⚠️ Missing resources detected:', validation.missing)
            // 尝试补充加载缺失的资源
            await this.loadMissingAssets(validation.missing, engine)
        } else {
            console.log('[SceneLifecycle] ✅ All resources validated')
        }

        console.log('[SceneLifecycle] Scene preparation complete')
        return entities
    }

    /**
     * Phase 1: 资源预加载
     */
    static async preloadPhase(mapData, engine, onProgress) {
        if (engine.resources && engine.resources.pipeline) {
            await engine.resources.pipeline.preloadMap(mapData, onProgress)
        } else {
            console.warn('[SceneLifecycle] Resource pipeline not available, using fallback')
            // Fallback: 使用旧的加载方式
            const visualIds = ResourceDeclaration.getMapDependencies(mapData)
            await engine.assets.preloadVisuals(Array.from(visualIds), VisualDefs)
        }
    }

    /**
     * Phase 2: 实体创建
     */
    static async createEntitiesPhase(mapData, engine, entryId, savedState) {
        if (savedState && savedState.entities && savedState.entities.length > 0) {
            console.log('[SceneLifecycle] Restoring from saved state')
            return ScenarioLoader.restore(engine, savedState, mapData)
        } else {
            console.log('[SceneLifecycle] Loading default scenario')
            return ScenarioLoader.load(engine, mapData, entryId)
        }
    }

    /**
     * Phase 3: 资源验证
     */
    static validatePhase(world, engine) {
        const missing = []
        const validated = []

        for (const entity of world) {
            // 跳过全局管理器
            if (entity.globalManager) continue

            if (entity.visual && entity.visual.id) {
                const visualDef = VisualDefs[entity.visual.id]
                if (!visualDef) {
                    console.warn(`[SceneLifecycle] Missing visual definition: ${entity.visual.id}`)
                    continue
                }

                const assetId = visualDef.assetId
                if (assetId && !engine.assets.getTexture(assetId)) {
                    missing.push({
                        entityId: entity.id,
                        visualId: entity.visual.id,
                        assetId: assetId
                    })
                } else {
                    validated.push(assetId)
                }
            }
        }

        return {
            missing: missing,
            validated: [...new Set(validated)],
            total: missing.length + validated.length
        }
    }

    /**
     * 加载缺失的资源（紧急补救）
     */
    static async loadMissingAssets(missingList, engine) {
        console.log('[SceneLifecycle] Loading missing assets:', missingList.length)

        const assetIds = [...new Set(missingList.map(item => item.assetId))]

        if (engine.resources && engine.resources.pipeline) {
            await engine.resources.pipeline.loadAssets(assetIds)
        } else {
            // Fallback
            const promises = assetIds.map(id => engine.assets.loadTexture(id))
            await Promise.all(promises)
        }

        console.log('[SceneLifecycle] Missing assets loaded')
    }

    /**
     * 快速场景准备（无验证，适用于性能敏感场景）
     */
    static async prepareSceneFast(mapData, engine, entryId = 'default') {
        await this.preloadPhase(mapData, engine)
        return this.createEntitiesPhase(mapData, engine, entryId, null)
    }
}
