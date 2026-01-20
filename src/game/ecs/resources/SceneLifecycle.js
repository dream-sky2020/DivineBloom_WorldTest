import { ScenarioLoader } from '@/game/ecs/ScenarioLoader'
import { ResourceDeclaration } from './ResourceDeclaration'
import { Visuals as VisualDefs } from '@/data/visuals'
import { world } from '@/game/ecs/world'
import { createLogger } from '@/utils/logger'

const logger = createLogger('SceneLifecycle')

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
        logger.info('Starting scene preparation...')

        // Phase 1: 预加载资源（在创建实体之前）
        logger.info('Phase 1: Preloading assets')
        await this.preloadPhase(mapData, engine, (progress) => {
            if (onProgress) {
                onProgress({
                    phase: 'loading',
                    ...progress
                })
            }
        })

        // Phase 2: 创建实体
        logger.info('Phase 2: Creating entities')
        const entities = await this.createEntitiesPhase(mapData, engine, entryId, savedState)

        if (onProgress) {
            onProgress({
                phase: 'entities',
                progress: 1.0
            })
        }

        // Phase 3: 验证资源完整性
        logger.info('Phase 3: Validating resources')
        const validation = this.validatePhase(world, engine)

        // 🎯 [FIX] 如果有资源正在加载，先等待它们完成
        if (validation.loading && validation.loading.length > 0) {
            logger.info(`⏳ Waiting for ${validation.loading.length} assets still loading...`)
            const loadingAssetIds = [...new Set(validation.loading.map(item => item.assetId))]
            const waitPromises = loadingAssetIds
                .map(id => engine.assets.loading && engine.assets.loading.get(id))
                .filter(Boolean)

            if (waitPromises.length > 0) {
                await Promise.all(waitPromises)
                logger.info('✅ Loading assets completed')

                // 重新验证
                const revalidation = this.validatePhase(world, engine)
                if (revalidation.missing.length > 0) {
                    logger.warn('⚠️ Some assets still missing after waiting:', revalidation.missing)
                    await this.loadMissingAssets(revalidation.missing, engine)
                }
            }
        } else if (validation.missing.length > 0) {
            logger.warn('⚠️ Missing resources detected:', validation.missing)
            // 尝试补充加载缺失的资源
            await this.loadMissingAssets(validation.missing, engine)
        } else {
            logger.info('✅ All resources validated')
        }

        logger.info('Scene preparation complete')
        return entities
    }

    /**
     * Phase 1: 资源预加载
     */
    static async preloadPhase(mapData, engine, onProgress) {
        // 🎯 [DEBUG] 记录地图信息
        logger.info(`Preloading map: ${mapData?.id || 'unknown'}`)

        if (engine.resources && engine.resources.pipeline) {
            // 🎯 [DEBUG] 列出需要加载的资源
            const visualIds = ResourceDeclaration.getMapDependencies(mapData)
            const assetIds = ResourceDeclaration.resolveAssetIds(visualIds)
            logger.info(`Required assets (${assetIds.size}):`, Array.from(assetIds))

            await engine.resources.pipeline.preloadMap(mapData, onProgress)

            // 🎯 [DEBUG] 验证预加载结果
            const missing = []
            for (const assetId of assetIds) {
                const texture = engine.assets.getTexture(assetId)
                if (!texture) {
                    missing.push(assetId)
                }
            }
            if (missing.length > 0) {
                logger.warn(`❌ Preload incomplete, missing (${missing.length}):`, missing)
            } else {
                logger.info(`✅ Preload complete, all ${assetIds.size} assets loaded`)
            }
        } else {
            logger.warn('Resource pipeline not available, using fallback')
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
            logger.info('Restoring from saved state')
            return ScenarioLoader.restore(engine, savedState, mapData)
        } else {
            logger.info('Loading default scenario')
            return ScenarioLoader.load(engine, mapData, entryId)
        }
    }

    /**
     * Phase 3: 资源验证
     */
    static validatePhase(world, engine) {
        const missing = []
        const validated = []
        const loading = [] // 🎯 [NEW] 跟踪正在加载的资源

        for (const entity of world) {
            // 跳过全局管理器
            if (entity.globalManager) continue

            if (entity.visual && entity.visual.id) {
                const visualDef = VisualDefs[entity.visual.id]
                if (!visualDef) {
                    logger.warn(`❌ Missing visual definition: ${entity.visual.id} (entity: ${entity.name || entity.type})`)
                    continue
                }

                const assetId = visualDef.assetId
                if (!assetId) {
                    logger.warn(`❌ Visual definition has no assetId: ${entity.visual.id}`)
                    continue
                }

                // 🎯 [FIX] 检查多种状态
                const texture = engine.assets.getTexture(assetId)
                const isLoading = engine.assets.loading && engine.assets.loading.has(assetId)

                if (!texture && !isLoading) {
                    // 完全缺失
                    missing.push({
                        entityId: entity.id,
                        entityType: entity.type,
                        entityName: entity.name,
                        visualId: entity.visual.id,
                        assetId: assetId
                    })
                } else if (!texture && isLoading) {
                    // 正在加载中
                    loading.push({
                        entityId: entity.id,
                        visualId: entity.visual.id,
                        assetId: assetId
                    })
                } else {
                    // 已加载
                    validated.push(assetId)
                }
            }
        }

        return {
            missing: missing,
            loading: loading, // 🎯 [NEW] 返回加载中的资源
            validated: [...new Set(validated)],
            total: missing.length + loading.length + validated.length
        }
    }

    /**
     * 加载缺失的资源（紧急补救）
     */
    static async loadMissingAssets(missingList, engine) {
        logger.info(`Loading missing assets: ${missingList.length}`)

        const assetIds = [...new Set(missingList.map(item => item.assetId))]

        if (engine.resources && engine.resources.pipeline) {
            await engine.resources.pipeline.loadAssets(assetIds)
        } else {
            // Fallback
            const promises = assetIds.map(id => engine.assets.loadTexture(id))
            await Promise.all(promises)
        }

        logger.info('Missing assets loaded')
    }

    /**
     * 快速场景准备（无验证，适用于性能敏感场景）
     */
    static async prepareSceneFast(mapData, engine, entryId = 'default') {
        await this.preloadPhase(mapData, engine)
        return this.createEntitiesPhase(mapData, engine, entryId, null)
    }

    /**
     * 销毁场景资源
     * @param {object} scene 
     * @param {object} engine 
     */
    static destroyScene(scene, engine) {
        logger.info('Destroying current scene...')
        if (scene && scene.destroy) {
            scene.destroy()
        }

        // 可选：清理资源管理器中的非全局资源
        if (engine && engine.assets) {
            engine.assets.clear()
        }
    }
}
