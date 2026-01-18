import { world } from '@/game/ecs/world'
import { canSeePlayer } from '@/game/ai/utils'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AISenseSystem')

/**
 * AI Sense System
 * 优化版：引入了 UUID 缓存查找和感知分摊机制
 */

const aiEntities = world.with('aiConfig', 'aiState', 'position')

// Helper to get player
const getPlayer = () => {
    return world.with('player', 'position').first
}

/**
 * 用于快速查找实体的缓存映射
 */
let entityMapCache = new Map();

export const AISenseSystem = {
    update(dt) {
        // 1. Sense Facts (Battle Results)
        this.senseBattleResult();

        // 2. Sense Environment (Vision)
        this.senseEnvironment(dt);
    },

    /**
     * 更新实体 UUID 映射缓存
     */
    _refreshEntityMap() {
        entityMapCache.clear();
        for (const entity of aiEntities) {
            const uuid = entity.actionBattle?.uuid || entity.interaction?.uuid;
            if (uuid) {
                entityMapCache.set(uuid, entity);
            }
        }
    },

    /**
     * 读取并消费 GlobalEntity 上的战斗结果
     */
    senseBattleResult() {
        // 查找带有 battleResult 组件的全局实体
        const globalEntity = world.with('globalManager', 'battleResult').first

        if (globalEntity) {
            const { uuid, result } = globalEntity.battleResult
            logger.info(`🚨 Sensed Battle Result for UUID: ${uuid}`, result)

            // 按需更新缓存
            this._refreshEntityMap();

            // O(1) 查找替代 O(N) 遍历
            const entity = entityMapCache.get(uuid);

            if (entity) {
                if (!entity.aiSensory) {
                    this._initSensoryComponent(entity);
                }
                // 写入结果
                entity.aiSensory.lastBattleResult = result;
                logger.debug(`✅ Applied battle result to entity: ${uuid}`);
            } else {
                logger.error(`❌ Target entity for battle result ${uuid} NOT FOUND!`)
            }

            // 消费掉结果 (移除组件)
            world.removeComponent(globalEntity, 'battleResult')
        }
    },

    /**
     * 初始化感知组件，带有随机化的计时器以平摊计算压力
     */
    _initSensoryComponent(entity) {
        world.addComponent(entity, 'aiSensory', {
            distSqToPlayer: Infinity,
            playerPos: { x: 0, y: 0 },
            hasPlayer: false,
            canSeePlayer: false,
            suspicion: 0,
            // 随机化初始计时器 (0s - 0.1s)，确保感知检测分布在不同帧
            senseTimer: Math.random() * 0.1,
            lastBattleResult: null
        })
    },

    senseEnvironment(dt) {
        const player = getPlayer()
        const playerPos = player ? player.position : null

        // 预提取位置信息以减少循环内访问开销
        const px = playerPos ? playerPos.x : 0
        const py = playerPos ? playerPos.y : 0

        for (const entity of aiEntities) {
            // Ensure aiSensory component exists
            if (!entity.aiSensory) {
                this._initSensoryComponent(entity);
            }

            const sensory = entity.aiSensory
            const { aiConfig, position } = entity

            if (!aiConfig || !position) continue;

            // 1. 节流检测 (每秒约 10 次)
            sensory.senseTimer -= dt
            if (sensory.senseTimer > 0) {
                // 虽然本帧不进行视线检测，但仍需处理疑虑值的衰减逻辑
                this._updateSuspicion(entity, sensory, aiConfig, 0, dt);
                continue
            }

            // 重置计时器，加入微小随机扰动防止后续重新对齐
            sensory.senseTimer = 0.1 + (Math.random() * 0.02 - 0.01);

            if (!playerPos) {
                sensory.hasPlayer = false
                sensory.distSqToPlayer = Infinity
                sensory.canSeePlayer = false
                this._updateSuspicion(entity, sensory, aiConfig, 0, dt);
                continue
            }

            // 2. 更新基础感知信息
            sensory.hasPlayer = true
            sensory.playerPos.x = px
            sensory.playerPos.y = py

            const dx = px - position.x
            const dy = py - position.y
            const distSq = dx * dx + dy * dy
            sensory.distSqToPlayer = distSq

            // 3. 视线检测 (高能耗操作)
            let isVisible = false;
            try {
                // 只有在合理距离内才进行真正的射线/视线检测
                const maxRange = aiConfig.visionRange || 300;
                if (distSq < maxRange * maxRange) {
                    isVisible = canSeePlayer(entity, distSq, playerPos)
                }
                sensory.canSeePlayer = isVisible
            } catch (e) {
                logger.error(`Error in canSeePlayer for Entity ${entity.id || 'N/A'}:`, e);
                sensory.canSeePlayer = false;
            }

            // 4. 更新疑虑值 (使用 0.1 作为检测间隔的近似值)
            this._updateSuspicion(entity, sensory, aiConfig, 0.1, dt);
        }
    },

    /**
     * 独立出疑虑值逻辑，以便在节流帧也能平滑更新状态
     */
    _updateSuspicion(entity, sensory, aiConfig, checkInterval, dt) {
        const suspicionTime = aiConfig.suspicionTime || 1.0
        const fillRate = 1.0 / suspicionTime

        // 如果是检测帧 (checkInterval > 0)
        if (checkInterval > 0) {
            if (sensory.canSeePlayer) {
                sensory.suspicion += fillRate * checkInterval
            } else {
                sensory.suspicion -= 0.5 * checkInterval
            }
        } else {
            // 在非检测帧，根据实际 dt 平滑衰减疑虑（如果不可见）
            if (!sensory.canSeePlayer && sensory.suspicion > 0) {
                sensory.suspicion -= 0.5 * dt;
            }
        }

        // 边界约束
        if (sensory.suspicion > 1.0) sensory.suspicion = 1.0;
        if (sensory.suspicion < 0) sensory.suspicion = 0;
    }
}
