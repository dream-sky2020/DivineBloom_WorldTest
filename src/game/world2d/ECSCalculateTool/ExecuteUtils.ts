import { world } from '@world2d/runtime/WorldEcsRuntime'
import { SceneTransition } from '@components'
import { createLogger } from '@/utils/logger'
import { IEntity } from '@definitions/interface/IEntity'
import { enqueueCommand } from '../bridge/ExternalBridge'

const logger = createLogger('ExecuteUtils')

/**
 * 执行系统工具类
 * 包含具体的动作执行逻辑，如传送、对话等
 */
export const ExecuteUtils = {
    /**
     * 处理传送逻辑
     * @param request 包含 source (发起者) 和 target (目标) 的请求对象
     * @param callbacks 回调函数集合
     * @param mapData 地图数据
     */
    handleTeleport(request: { source: IEntity, target?: IEntity }, mapData?: any) {
        const entity = request.source as IEntity;
        const targetEntity = request.target as IEntity;

        logger.info('Handle called for entity:', entity.type);

        if (!entity.actionTeleport) {
            logger.warn('Entity missing actionTeleport component!', entity);
            return;
        }

        const { mapId, entryId, destinationId, targetX, targetY } = entity.actionTeleport;

        // 安全检查：防止无效的 mapId
        if (mapId === 'error' || mapId === 'null' || mapId === 'undefined') {
            logger.error('Invalid mapId detected, aborting teleport:', mapId);
            return;
        }

        const isCrossMapTeleport = mapId != null && entryId != null;
        const isLocalTeleport = destinationId != null || (targetX != null && targetY != null);

        // === 同地图传送 ===
        if (isLocalTeleport) {
            if (!targetEntity || !targetEntity.transform) {
                logger.warn('Local teleport failed: No target entity or target has no transform');
                return;
            }

            let finalX: number, finalY: number;

            if (destinationId != null) {
                const destinations = world.with('destinationId', 'transform');
                const destination = [...destinations].find(d => d.destinationId === destinationId);

                if (destination) {
                    finalX = destination.transform.x;
                    finalY = destination.transform.y;
                    logger.info(`Local teleport: Moving ${targetEntity.type} to destination '${destinationId}' at (${finalX}, ${finalY})`);
                } else {
                    logger.error(`Destination entity '${destinationId}' not found! Teleport aborted.`);
                    return;
                }
            } else if (targetX != null && targetY != null) {
                finalX = targetX;
                finalY = targetY;
                logger.info(`Local teleport: Moving ${targetEntity.type} to direct coords (${finalX}, ${finalY})`);
            } else {
                logger.error('Invalid local teleport: No destinationId or coordinates provided');
                return;
            }

            targetEntity.transform.prevX = finalX;
            targetEntity.transform.prevY = finalY;
            targetEntity.transform.x = finalX;
            targetEntity.transform.y = finalY;

            if (entity.type !== 'portal') {
                world.removeComponent(entity, 'actionTeleport');
            }
            return;
        }

        // === 跨地图传送 ===
        if (isCrossMapTeleport) {
            const isPlayer = targetEntity?.detectable?.labels?.includes('player');

            if (!isPlayer) {
                logger.info(`Cross-map teleport ignored for non-player entity: ${targetEntity?.type}`);
                return;
            }

            logger.info(`Triggering transition to ${mapId}:${entryId} for player`);

            if (targetEntity) {
                world.addComponent(targetEntity, 'sceneTransition', SceneTransition.create({
                    mapId,
                    entryId
                }));
            }

            if (entity.type !== 'portal') {
                world.removeComponent(entity, 'actionTeleport');
            }

            logger.info(`Requesting transition to map: ${mapId}, entry: ${entryId}`);
            return;
        }

        logger.error('Invalid teleport configuration', entity.actionTeleport);
    },

    /**
     * 处理对话逻辑
     * @param entity 触发对话的实体
     * @param callbacks 回调函数集合
     */
    handleDialogue(entity: IEntity) {
        if (!entity.actionDialogue) return;

        const interactionPayload = {
                type: 'dialogue',
                id: entity.actionDialogue.scriptId,
                ...entity.actionDialogue.params
            };

        // 新通路：统一写入命令，由 ExecuteSystem 消费
        enqueueCommand({
            type: 'INTERACT',
            payload: interactionPayload
        });

    }
};
