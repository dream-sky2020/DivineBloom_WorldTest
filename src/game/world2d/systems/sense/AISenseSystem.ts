import { world } from '@world2d/runtime/WorldEcsRuntime';
import { canSeePlayer } from '@world2d/ECSCalculateTool/AIUtils';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { getEntityId, IEntity } from '@definitions/interface/IEntity';
import { AISensory } from '@components';

const logger = createLogger('AISenseSystem');

// Helper to get player
const getPlayer = (): IEntity | null => {
    return world.with('player', 'transform').first as IEntity;
};

/**
 * 用于快速查找实体的缓存映射
 */
let entityMapCache = new Map<string, IEntity>();
let currentMapData: any = null;

/**
 * AI Sense System
 * 优化版：引入了 ID 缓存查找和感知分摊机制
 */
export const AISenseSystem: ISystem & {
    _refreshEntityMap(): void;
    senseBattleResult(): void;
    _initSensoryComponent(entity: IEntity): void;
    senseEnvironment(dt: number): void;
    _senseObstacles(entity: IEntity, sensory: any): void;
    _sensePortals(entity: IEntity, sensory: any, playerPos: any): void;
    _updateSuspicion(entity: IEntity, sensory: any, aiConfig: any, checkInterval: number, dt: number): void;
} = {
    name: 'ai-sense',

    /**
     * 初始化感知系统
     */
    init(mapData: any) {
        currentMapData = mapData;
    },

    update(dt: number) {
        // 1. Sense Facts (Battle Results)
        this.senseBattleResult();

        // 2. Sense Environment (Vision)
        this.senseEnvironment(dt);
    },

    /**
     * 更新实体 ID 映射缓存
     */
    _refreshEntityMap() {
        entityMapCache.clear();
        const aiEntities = world.with('aiConfig', 'aiState', 'transform');
        for (const entity of aiEntities) {
            const e = entity as IEntity;
            // TODO: check type definitions for actionBattle/interaction
            const id = (e as any).actionBattle?.id || (e as any).interaction?.id || getEntityId(e);
            if (id) {
                entityMapCache.set(String(id), e);
            }
        }
    },

    /**
     * 读取并消费 GlobalEntity 上的战斗结果
     */
    senseBattleResult() {
        // 查找带有 battleResult 组件的全局实体
        const globalEntity = world.with('globalManager', 'battleResult').first as IEntity;

        if (globalEntity) {
            const { id, result } = (globalEntity as any).battleResult;
            const battleEntityId = id == null ? '' : String(id);
            logger.info(`🚨 Sensed Battle Result for ID: ${battleEntityId}`, result);

            // 按需更新缓存
            this._refreshEntityMap();

            // O(1) 查找替代 O(N) 遍历
            const entity = battleEntityId ? entityMapCache.get(battleEntityId) : undefined;

            if (entity) {
                if (!entity.aiSensory) {
                    this._initSensoryComponent(entity);
                }
                // 写入结果
                entity.aiSensory.lastBattleResult = result;
                logger.debug(`✅ Applied battle result to entity: ${battleEntityId}`);
            } else {
                logger.error(`❌ Target entity for battle result ${battleEntityId || 'N/A'} NOT FOUND!`);
            }

            // 消费掉结果 (移除组件)
            world.removeComponent(globalEntity, 'battleResult');
        }
    },

    /**
     * 初始化感知组件，带有随机化的计时器以平摊计算压力
     */
    _initSensoryComponent(entity: IEntity) {
        world.addComponent(entity, 'aiSensory', AISensory.create({
            distSqToPlayer: Infinity,
            playerPos: { x: 0, y: 0 },
            hasPlayer: false,
            canSeePlayer: false,
            suspicion: 0,
            // 随机化初始计时器 (0s - 0.1s)，确保感知检测分布在不同帧
            senseTimer: Math.random() * 0.1,
            lastBattleResult: null,
            // 传送门感知
            bestPortal: null, // { pos: {x,y}, dest: {x,y}, distImprovement: number }
            // 障碍物感知
            nearbyObstacles: [] // Array of obstacle entities
        }));
    },

    senseEnvironment(dt: number) {
        const aiEntities = world.with('aiConfig', 'aiState', 'transform');
        const player = getPlayer();
        const playerPos = player ? player.transform : null;

        // 预提取位置信息以减少循环内访问开销
        const px = playerPos ? playerPos.x : 0;
        const py = playerPos ? playerPos.y : 0;

        for (const entity of aiEntities) {
            const e = entity as IEntity;
            // Ensure aiSensory component exists
            if (!e.aiSensory) {
                this._initSensoryComponent(e);
            }

            const sensory = e.aiSensory;
            const { aiConfig, transform } = e;

            if (!aiConfig || !transform) continue;

            if (!playerPos) {
                sensory.hasPlayer = false;
                sensory.distSqToPlayer = Infinity;
                sensory.canSeePlayer = false;
                this._updateSuspicion(e, sensory, aiConfig, 0, dt);
                continue;
            }

            // 全局追踪模式：跳过视野检测，默认一直看到玩家
            if (aiConfig.alwaysTrackPlayer) {
                sensory.hasPlayer = true;
                sensory.playerPos.x = px;
                sensory.playerPos.y = py;
                const dx = px - transform.x;
                const dy = py - transform.y;
                sensory.distSqToPlayer = dx * dx + dy * dy;
                sensory.canSeePlayer = true;
                sensory.suspicion = 1.0;
                if (e.aiState) {
                    e.aiState.lastSeenPos = { x: px, y: py };
                }
                this._sensePortals(e, sensory, playerPos);
                this._senseObstacles(e, sensory);
                continue;
            }

            // 1. 节流检测 (每秒约 10 次)
            sensory.senseTimer -= dt;
            if (sensory.senseTimer > 0) {
                // 虽然本帧不进行视线检测，但仍需处理疑虑值的衰减逻辑
                this._updateSuspicion(e, sensory, aiConfig, 0, dt);
                continue;
            }

            // 重置计时器，加入微小随机扰动防止后续重新对齐
            sensory.senseTimer = 0.1 + (Math.random() * 0.02 - 0.01);

            // 2. 更新基础感知信息
            sensory.hasPlayer = true;
            sensory.playerPos.x = px;
            sensory.playerPos.y = py;

            // 更新 AI 记忆中的最后位置
            if (e.aiState) {
                e.aiState.lastSeenPos = { x: px, y: py };
            }

            const dx = px - transform.x;
            const dy = py - transform.y;
            const distSq = dx * dx + dy * dy;
            sensory.distSqToPlayer = distSq;

            // 3. 视线检测 (高能耗操作)
            let isVisible = false;
            try {
                // 只有在合理距离内才进行真正的射线/视线检测
                const maxRange = aiConfig.visionRange || 300;
                if (distSq < maxRange * maxRange) {
                    isVisible = canSeePlayer(e, distSq, playerPos);
                }
                sensory.canSeePlayer = isVisible;
            } catch (error) {
                logger.error(`Error in canSeePlayer for Entity ${e.id || 'N/A'}:`, error);
                sensory.canSeePlayer = false;
            }

            // 4. 更新疑虑值 (使用 0.1 作为检测间隔的近似值)
            this._updateSuspicion(e, sensory, aiConfig, 0.1, dt);

            // 5. 感知传送门 (Shortcut Detection)
            this._sensePortals(e, sensory, playerPos);

            // 6. 感知障碍物 (Obstacle Detection)
            this._senseObstacles(e, sensory);
        }
    },

    /**
     * 感知周围的障碍物
     */
    _senseObstacles(entity: IEntity, sensory: any) {
        const obstacleEntities = world.with('type', 'transform', 'collider');
        const entityPos = entity.transform;
        const radius = 150; // 感知半径比转向用的危险半径稍大一点
        const radiusSq = radius * radius;

        sensory.nearbyObstacles = [];

        for (const obs of obstacleEntities) {
            const o = obs as IEntity;
            if (o.type !== 'obstacle') continue;
            if (!o.transform) continue;

            const dx = o.transform.x - entityPos.x;
            const dy = o.transform.y - entityPos.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq) {
                sensory.nearbyObstacles.push(o);
            }
        }
    },

    /**
     * 感知本地图内的传送门，判断是否可以作为追逐玩家的捷径
     */
    _sensePortals(entity: IEntity, sensory: any, playerPos: any) {
        if (!currentMapData) {
            sensory.bestPortal = null;
            return;
        }

        const portals = world.with('actionTeleport', 'transform');
        const destinations = world.with('destinationId', 'transform');
        const entityPos = entity.transform;
        const lastSeenPos = entity.aiState?.lastSeenPos;

        let bestPortal = null;
        let maxImprovement = 0;

        // 如果没有玩家位置，但有最后看到玩家的位置
        // 我们检查玩家是否消失在了某个传送门附近
        if (!playerPos) {
            if (!lastSeenPos) {
                sensory.bestPortal = null;
                return;
            }

            for (const p of portals) {
                const pe = p as IEntity;
                const { actionTeleport, transform: pPos, detectArea } = pe;
                if (!actionTeleport || !pPos) continue;

                // 计算传送门位置（中心点）
                let portalX = pPos.x;
                let portalY = pPos.y;
                if (detectArea && detectArea.offset) {
                    portalX += detectArea.offset.x;
                    portalY += detectArea.offset.y;
                }

                // 如果玩家消失的位置离这个传送门很近 (50像素内)，AI 认为玩家进了这个门
                const distToPortal = Math.sqrt((portalX - lastSeenPos.x) ** 2 + (portalY - lastSeenPos.y) ** 2);
                if (distToPortal < 50) {
                    sensory.bestPortal = {
                        pos: { x: portalX, y: portalY },
                        improvement: 9999 // 极高优先级，诱导 AI 走向传送门
                    };
                    return; // 找到即返回
                }
            }

            sensory.bestPortal = null;
            return;
        }

        // --- 以下是正常的捷径评估逻辑 (当玩家在场时) ---
        // 计算当前到玩家的直线距离 (近似路径成本)
        const directDist = Math.sqrt(sensory.distSqToPlayer);

        for (const p of portals) {
            const pe = p as IEntity;
            const { actionTeleport, transform: pPos, detectArea } = pe;
            if (!actionTeleport || !pPos) continue;

            const { mapId, entryId, destinationId, targetX, targetY } = actionTeleport;

            // 判断传送类型（使用 != null 来同时排除 null 和 undefined）
            const isCrossMap = mapId != null && entryId != null;
            const isLocalTeleport = destinationId != null || (targetX != null && targetY != null);

            // 仅考虑同地图传送门
            if (isCrossMap) {
                continue;
            }

            if (!isLocalTeleport) {
                continue;
            }

            // 获取传送目标位置
            let dest: { x: number, y: number } | undefined;
            if (destinationId != null) {
                // 查找目的地实体
                const destEntity = [...destinations].find(d => d.destinationId === destinationId) as IEntity | undefined;
                if (!destEntity) {
                    continue; // 找不到目的地实体，跳过
                }
                dest = { x: destEntity.transform.x, y: destEntity.transform.y };
            } else if (targetX != null && targetY != null) {
                // 使用直接坐标
                dest = { x: targetX, y: targetY };
            } else {
                continue;
            }

            // 计算传送门位置（中心点）
            let portalX = pPos.x;
            let portalY = pPos.y;
            if (detectArea && detectArea.offset) {
                portalX += detectArea.offset.x;
                portalY += detectArea.offset.y;
            }

            // 计算通过该传送门的路径成本: 到传送门的距离 + 传送后到玩家的距离
            const distToPortal = Math.sqrt((portalX - entityPos.x) ** 2 + (portalY - entityPos.y) ** 2);
            const distFromDestToPlayer = Math.sqrt((dest.x - playerPos.x) ** 2 + (dest.y - playerPos.y) ** 2);
            const portalRouteDist = distToPortal + distFromDestToPlayer;

            // 如果通过传送门比直着跑能缩短至少 100 像素的距离，则认为是一个好的捷径
            // 且传送门不能离得太远 (例如超过 800 像素就不考虑了，除非捷径非常大)
            const improvement = directDist - portalRouteDist;

            if (improvement > 100 && improvement > maxImprovement) {
                maxImprovement = improvement;
                bestPortal = {
                    pos: { x: portalX, y: portalY },
                    dest: { x: dest.x, y: dest.y },
                    improvement: improvement
                };
            }
        }

        sensory.bestPortal = bestPortal;
    },

    /**
     * 独立出疑虑值逻辑，以便在节流帧也能平滑更新状态
     */
    _updateSuspicion(entity: IEntity, sensory: any, aiConfig: any, checkInterval: number, dt: number) {
        const suspicionTime = aiConfig.suspicionTime || 1.0;
        const fillRate = 1.0 / suspicionTime;

        // 如果是检测帧 (checkInterval > 0)
        if (checkInterval > 0) {
            if (sensory.canSeePlayer) {
                sensory.suspicion += fillRate * checkInterval;
            } else {
                sensory.suspicion -= 0.5 * checkInterval;
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
};
