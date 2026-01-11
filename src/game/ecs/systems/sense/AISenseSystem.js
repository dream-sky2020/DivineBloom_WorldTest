import { world } from '@/game/ecs/world'
import { canSeePlayer } from '@/game/ai/utils'

/**
 * AI Sense System
 * 负责 AI 的感知逻辑 (Sense)
 * 1. 感知环境 (Environment): 距离、视线、玩家位置
 * 2. 感知事实 (Facts): 战斗结果 (BattleResult)
 */

const aiEntities = world.with('aiConfig', 'aiState', 'position')

// Helper to get player
const getPlayer = () => {
    return world.with('player', 'position').first
}

export const AISenseSystem = {
    update(dt) {
        // 1. Sense Facts (Battle Results)
        this.senseBattleResult();

        // 2. Sense Environment (Vision)
        this.senseEnvironment(dt);
    },

    /**
     * 读取并消费 GlobalEntity 上的战斗结果
     */
    senseBattleResult() {
        // 查找带有 battleResult 组件的全局实体
        const globalEntity = world.with('globalManager', 'battleResult').first

        if (globalEntity) {
            const { uuid, result } = globalEntity.battleResult
            console.log(`[AISenseSystem] 🚨 Sensed Battle Result for UUID: ${uuid}`, result)

            // DEBUG: 打印所有 AI 实体的 UUID，看看能否匹配上
            const debugEntities = [...aiEntities].map(e => ({
                uuid: e.actionBattle?.uuid || e.interaction?.uuid,
                hasEnemyTag: !!e.enemy,
                hasVelocity: !!e.velocity
            }));
            console.log('[AISenseSystem] Available AI Entities (Count):', debugEntities.length);

            // 查找对应的 AI 实体
            const entity = [...aiEntities].find(e =>
                (e.actionBattle && e.actionBattle.uuid === uuid) ||
                (e.interaction && e.interaction.uuid === uuid)
            )

            if (entity) {
                console.log(`[AISenseSystem] ✅ Found entity match. Keys:`, Object.keys(entity))

                // 确保 aiSensory 存在
                if (!entity.aiSensory) {
                    console.log('[AISenseSystem] Creating new aiSensory component');
                    world.addComponent(entity, 'aiSensory', {
                        distSqToPlayer: Infinity,
                        playerPos: { x: 0, y: 0 },
                        hasPlayer: false,
                        canSeePlayer: false,
                        suspicion: 0,
                        senseTimer: 0,
                        lastBattleResult: null
                    })
                }

                // 写入结果
                entity.aiSensory.lastBattleResult = result;

                // 立即验证写入是否成功
                console.log('[AISenseSystem] Wrote result to entity.aiSensory:', entity.aiSensory.lastBattleResult);

            } else {
                console.error(`[AISenseSystem] ❌ Target entity for battle result ${uuid} NOT FOUND in aiEntities query!`)
            }

            // 消费掉结果 (移除组件)
            // 这样下一帧就不会重复处理了
            world.removeComponent(globalEntity, 'battleResult')
        }
    },

    senseEnvironment(dt) {
        const player = getPlayer()
        const playerPos = player ? player.position : null

        for (const entity of aiEntities) {
            // Ensure aiSensory component exists
            if (!entity.aiSensory) {
                world.addComponent(entity, 'aiSensory', {
                    distSqToPlayer: Infinity,
                    playerPos: { x: 0, y: 0 },
                    hasPlayer: false,
                    canSeePlayer: false,
                    suspicion: 0,
                    senseTimer: Math.random() // Stagger updates
                })
            }

            const sensory = entity.aiSensory
            const { aiConfig, position } = entity

            if (!aiConfig || !position) continue;

            // Throttle sensing logic (e.g. 10 times per second)
            sensory.senseTimer -= dt
            if (sensory.senseTimer > 0) continue

            // Adaptive throttle based on distance (handled in next frame) or fixed
            sensory.senseTimer = 0.1

            if (!playerPos) {
                sensory.hasPlayer = false
                sensory.distSqToPlayer = Infinity
                sensory.canSeePlayer = false
                sensory.suspicion = 0
                continue
            }

            // Update basic info
            sensory.hasPlayer = true
            sensory.playerPos.x = playerPos.x
            sensory.playerPos.y = playerPos.y

            const dx = playerPos.x - position.x
            const dy = playerPos.y - position.y
            sensory.distSqToPlayer = dx * dx + dy * dy

            // Check Visibility
            try {
                const isVisible = canSeePlayer(entity, sensory.distSqToPlayer, playerPos)
                sensory.canSeePlayer = isVisible
            } catch (e) {
                console.error(`[AISenseSystem] Error in canSeePlayer for Entity ${entity.id || 'N/A'}:`, e);
                sensory.canSeePlayer = false;
            }

            // Update Suspicion
            const suspicionTime = aiConfig.suspicionTime || 1.0
            const fillRate = 1.0 / suspicionTime
            const interval = 0.1

            if (sensory.canSeePlayer) {
                sensory.suspicion += fillRate * interval
                if (sensory.suspicion > 1.0) sensory.suspicion = 1.0
            } else {
                // Decay suspicion
                if (sensory.suspicion > 0) {
                    sensory.suspicion -= interval * 0.5
                    if (sensory.suspicion < 0) sensory.suspicion = 0
                }
            }
        }
    }
}
