import { world } from '@world2d/runtime/WorldEcsRuntime';
import { getSystem } from '@world2d/SystemRegistry';
import { entityTemplateRegistry } from '@definitions/internal/EntityTemplateRegistry';
import { EntityCreator } from '@definitions/internal/EntityCreator';
import { editorManager } from '../../../editor/core/EditorCore';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { ExecuteUtils } from '../../ECSCalculateTool/ExecuteUtils';
import { getEntityId, IEntity } from '@definitions/interface/IEntity';
import type { SystemContextBase } from '@definitions/interface/SystemContext';
import {
    drainCommands,
    getFrameContext,
    getRuntimeService,
    enqueueCommand,
    setViewState
} from '../../bridge/ExternalBridge';

const logger = createLogger('ExecuteSystem');

/**
 * ExecuteSystem
 * 任务执行总管
 * 接收 ECS 产生的 Action 请求，以及 UI 产生的 Command 请求，统一分发执行
 */
interface IExecuteSystem extends ISystem<SystemContextBase> {
    dispatch(item: any, context: any, mapData: any): void;
    handleDelete(entity: IEntity): void;
    handleCreateEntity(payload: any, source?: IEntity, target?: IEntity): void;
    handleEmitSignal(payload: any, source?: IEntity, target?: IEntity): void;
    resolveEntityFromPayload(payload: any): IEntity | null;
}

export const ExecuteSystem: IExecuteSystem = {
    name: 'execute',

    update(dt?: number, _ctx?: SystemContextBase) {
        const frameContext = getFrameContext();
        const runtimeGameManager = getRuntimeService('gameManager');
        const runtimeWorldStore = getRuntimeService('worldStore');
        if (!runtimeGameManager) {
            throw new Error('[ExecuteSystem] Missing required runtime service: gameManager');
        }
        if (!runtimeWorldStore) {
            throw new Error('[ExecuteSystem] Missing required runtime service: worldStore');
        }
        const context = {
            ...frameContext,
            gameManager: runtimeGameManager,
            worldStore: runtimeWorldStore
        };
        const mapData = frameContext.mapData ?? null;
        // 0. 把玩家意图收敛为命令（统一通路）
        const playerEntity = world.with('player', 'playerIntent').first;
        if (playerEntity) {
            if (playerEntity.playerIntent.wantsToOpenMenu) {
                enqueueCommand({ type: 'UI_OPEN_MENU' });
                playerEntity.playerIntent.wantsToOpenMenu = false;
            }
            if (playerEntity.playerIntent.wantsToOpenShop) {
                enqueueCommand({ type: 'UI_OPEN_SHOP' });
                playerEntity.playerIntent.wantsToOpenShop = false;
            }
        }

        // 1. 统一只从命令通道消费；允许命令在同帧生成并继续消费
        for (let pass = 0; pass < 4; pass++) {
            const commands = drainCommands(128);
            if (!commands.length) break;
            for (const command of commands) {
                this.dispatch(command, context, mapData);
            }
        }
    },

    /**
     * 统一分发器 (Dispatch Center)
     */
    dispatch(item: any, context: any, mapData: any) {
        if (!item || !item.type) return;

        const type = item.type;
        const payload = item.payload || {};
        const source = item.source as IEntity;
        const target = item.target as IEntity;

        logger.info(`Dispatching: ${type}`, { type, payload, source, target });

        switch (type) {
            // --- 游戏逻辑动作 (Actions) ---
            case 'DIALOGUE': {
                // 使用新的工具类处理
                ExecuteUtils.handleDialogue(source);
                break;
            }

            case 'TELEPORT': {
                // 使用新的工具类处理
                ExecuteUtils.handleTeleport(item, mapData);
                break;
            }

            // --- 编辑器/UI 指令 (Commands) ---
            case 'DELETE_ENTITY':
            case 'DELETE':
                this.handleDelete(payload.entity || this.resolveEntityFromPayload(payload) || target || source);
                break;

            case 'CREATE_ENTITY':
                this.handleCreateEntity(payload, source, target);
                break;

            case 'UI_OPEN_MENU':
                if (context.gameManager) {
                    context.gameManager.state.system = 'list-menu';
                }
                setViewState({ activeOverlay: 'list-menu' });
                break;

            case 'UI_OPEN_SHOP':
                if (context.gameManager) {
                    context.gameManager.state.system = 'shop';
                }
                setViewState({ activeOverlay: 'shop' });
                break;

            case 'MAP_SWITCH': {
                const mapId = payload.mapId || payload.targetMapId;
                const entryId = payload.entryId || payload.targetEntryId || 'default';
                if (mapId && context.gameManager?.loadMap) {
                    void context.gameManager.loadMap(mapId, entryId);
                }
                break;
            }

            case 'INTERACT':
                if (context.gameManager?.handleInteractCommand) {
                    context.gameManager.handleInteractCommand(payload.interaction || payload);
                }
                break;

            case 'ENCOUNTER':
                if (context.gameManager?.handleEncounterCommand) {
                    context.gameManager.handleEncounterCommand(payload.enemyGroup ?? payload.group, payload.enemyId ?? payload.id);
                }
                break;

            case 'EMIT_SIGNAL':
                this.handleEmitSignal(payload, source, target);
                break;

            case 'SAVE_SCENE':
                if (context.worldStore?.saveState) context.worldStore.saveState(payload);
                break;

            case 'LOAD_MAP':
                if (context.gameManager?.loadMap && payload.mapId) {
                    void context.gameManager.loadMap(payload.mapId, payload.entryId || 'default');
                }
                break;

            default:
                logger.warn(`Unknown dispatch type: ${type}`, item);
        }
    },

    /**
     * 统一处理实体删除
     */
    handleDelete(entity: IEntity) {
        const resolvedEntity = entity;
        if (!resolvedEntity) return;

        // 安全检查
        if ((resolvedEntity as any).globalManager || resolvedEntity.inspector?.allowDelete === false) {
            logger.warn('Attempted to delete a protected entity:', resolvedEntity.type);
            return;
        }

        logger.info('Deleting entity:', resolvedEntity.type, getEntityId(resolvedEntity) || 'N/A');

        // 同步 UI 状态
        if (editorManager.selectedEntity === resolvedEntity) {
            editorManager.selectedEntity = null;
        }

        // 同步交互系统状态
        const editorInteraction = getSystem('editor-interaction') as any;
        if (editorInteraction && editorInteraction.selectedEntity === resolvedEntity) {
            editorInteraction.selectedEntity = null;
        }

        // [New] 递归删除子实体
        if (resolvedEntity.children && Array.isArray(resolvedEntity.children.entities)) {
            for (const child of resolvedEntity.children.entities) {
                if (world.entities.includes(child)) {
                    world.remove(child);
                }
            }
        }

        world.remove(resolvedEntity);
    },

    /**
     * 处理实体创建
     */
    handleCreateEntity(payload: any, source?: IEntity, target?: IEntity) {
        const actionData = (source as any)?.actionCreateEntity || {};
        const resolved = payload && Object.keys(payload).length > 0 ? payload : actionData;
        const { templateId, entityType, position, customData = {} } = resolved;

        if (!templateId && !entityType) {
            logger.error('CREATE_ENTITY: templateId or entityType is required');
            return;
        }

        const resolvedPosition = position
            || (target?.transform ? { x: target.transform.x, y: target.transform.y } : undefined)
            || (source?.transform ? { x: source.transform.x, y: source.transform.y } : undefined);

        const finalData = { ...(customData || {}) };

        if (templateId) {
            logger.info(`Creating entity from template: ${templateId}`, resolved);
            try {
                const entity = entityTemplateRegistry.createEntity(templateId, finalData, resolvedPosition) as IEntity;
                if (entity) {
                    logger.info(`Entity created successfully:`, (entity as any).type, (entity as any).name);
                    (editorManager as any).selectedEntity = entity;
                } else {
                    logger.error(`Failed to create entity from template: ${templateId}`);
                }
            } catch (error) {
                logger.error(`Error creating entity:`, error);
            }
            return;
        }

        if (entityType) {
            if (resolvedPosition) {
                if (finalData.x == null) finalData.x = resolvedPosition.x;
                if (finalData.y == null) finalData.y = resolvedPosition.y;
            }
            logger.info(`Creating entity by type: ${entityType}`, resolved);
            try {
                const entity = EntityCreator.create(null, entityType, finalData) as IEntity;
                if (entity) {
                    logger.info(`Entity created successfully:`, (entity as any).type, (entity as any).name);
                    (editorManager as any).selectedEntity = entity;
                } else {
                    logger.error(`Failed to create entity of type: ${entityType}`);
                }
            } catch (error) {
                logger.error(`Error creating entity:`, error);
            }
        }
    },

    /**
     * 处理信号发射
     */
    handleEmitSignal(payload: any, source?: IEntity, target?: IEntity) {
        const actionData = (source as any)?.actionEmitSignal || {};
        const resolved = payload && Object.keys(payload).length > 0 ? payload : actionData;

        if (!resolved?.signal) {
            logger.warn('EMIT_SIGNAL: signal is required');
            return;
        }

        logger.warn('EMIT_SIGNAL is deprecated after Trigger removal; ignored.', {
            signal: resolved.signal,
            source,
            target: resolved.target || target
        });
    }
    ,
    resolveEntityFromPayload(payload: any) {
        const entityId = payload?.entityId;
        if (entityId == null) return null;
        for (const entity of world) {
            const id = getEntityId(entity);
            if (id !== '' && id == entityId) return entity as IEntity;
        }
        return null;
    }
};
