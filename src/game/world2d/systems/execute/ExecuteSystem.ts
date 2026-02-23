import { actionQueue, eventQueue, world } from '@world2d/world';
import { getSystem } from '@world2d/SystemRegistry';
import { entityTemplateRegistry } from '@definitions/internal/EntityTemplateRegistry';
import { EntityCreator } from '@definitions/internal/EntityCreator';
import { editorManager } from '../../../editor/core/EditorCore';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { ExecuteUtils } from '../../ECSCalculateTool/ExecuteUtils';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('ExecuteSystem');

/**
 * 遗留事件处理器
 */
const EventHandlers: Record<string, (payload: any, callbacks: any) => void> = {
    TRIGGER_MAP_SWITCH: (payload, callbacks) => {
        if (callbacks && callbacks.onSwitchMap) callbacks.onSwitchMap(payload.targetMapId, payload.targetEntryId);
    },
    INTERACT_NPC: (payload, callbacks) => {
        if (callbacks && callbacks.onInteract) callbacks.onInteract(payload.interaction);
    }
};

/**
 * ExecuteSystem
 * 任务执行总管
 * 接收 ECS 产生的 Action 请求，以及 UI 产生的 Command 请求，统一分发执行
 */
interface IExecuteSystem extends ISystem {
    dispatch(item: any, callbacks: any, mapData: any): void;
    handleDelete(entity: IEntity, callbacks: any): void;
    handleCreateEntity(payload: any, callbacks: any, source?: IEntity, target?: IEntity): void;
    handleEmitSignal(payload: any, source?: IEntity, target?: IEntity): void;
}

export const ExecuteSystem: IExecuteSystem = {
    name: 'execute',

    update(dt?: number, callbacks: any = {}, mapData: any = null) {
        // 1. 处理全局命令队列 (Commands Component)
        const globalEntity = world.with('commands').first;
        if (globalEntity && globalEntity.commands.queue.length > 0) {
            const queue = globalEntity.commands.queue.splice(0, globalEntity.commands.queue.length);
            for (const item of queue) {
                this.dispatch(item, callbacks, mapData);
            }
        }

        // 2. 处理 ActionQueue (ECS 内部产生)
        if (actionQueue && actionQueue.length > 0) {
            const requests = actionQueue.splice(0, actionQueue.length);
            for (const request of requests) {
                this.dispatch(request, callbacks, mapData);
            }
        }

        // 3. 处理全局玩家意图 (Player Intent)
        const playerEntity = world.with('player', 'playerIntent').first;
        if (playerEntity) {
            if (playerEntity.playerIntent.wantsToOpenMenu) {
                if (callbacks.onOpenMenu) {
                    callbacks.onOpenMenu();
                    playerEntity.playerIntent.wantsToOpenMenu = false;
                }
            }
            if (playerEntity.playerIntent.wantsToOpenShop) {
                if (callbacks.onOpenShop) {
                    callbacks.onOpenShop();
                    playerEntity.playerIntent.wantsToOpenShop = false;
                }
            }
        }

        // 4. 处理 Legacy/UI Events (EventQueue) - 保持兼容性
        if (eventQueue) {
            const events = eventQueue.drain();
            for (const event of events) {
                if (event.type && event.payload) {
                    const handler = EventHandlers[event.type];
                    if (handler) handler(event.payload, callbacks);
                }
            }
        }
    },

    /**
     * 统一分发器 (Dispatch Center)
     */
    dispatch(item: any, callbacks: any, mapData: any) {
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
                ExecuteUtils.handleDialogue(source, callbacks);
                break;
            }

            case 'TELEPORT': {
                // 使用新的工具类处理
                ExecuteUtils.handleTeleport(item, callbacks, mapData);
                break;
            }

            // --- 编辑器/UI 指令 (Commands) ---
            case 'DELETE_ENTITY':
            case 'DELETE':
                this.handleDelete(payload.entity || target || source, callbacks);
                break;

            case 'CREATE_ENTITY':
                this.handleCreateEntity(payload, callbacks, source, target);
                break;

            case 'EMIT_SIGNAL':
                this.handleEmitSignal(payload, source, target);
                break;

            case 'SAVE_SCENE':
                if (callbacks.onSaveScene) callbacks.onSaveScene(payload);
                break;

            case 'LOAD_MAP':
                if (callbacks.onLoadMap) callbacks.onLoadMap(payload.mapId);
                break;

            default:
                logger.warn(`Unknown dispatch type: ${type}`, item);
        }
    },

    /**
     * 统一处理实体删除
     */
    handleDelete(entity: IEntity, callbacks: any) {
        if (!entity) return;

        // 安全检查
        if ((entity as any).globalManager || entity.inspector?.allowDelete === false) {
            logger.warn('Attempted to delete a protected entity:', entity.type);
            return;
        }

        logger.info('Deleting entity:', entity.type, entity.id || entity.uuid);

        // 同步 UI 状态
        if (editorManager.selectedEntity === entity) {
            editorManager.selectedEntity = null;
        }

        // 同步交互系统状态
        const editorInteraction = getSystem('editor-interaction') as any;
        if (editorInteraction && editorInteraction.selectedEntity === entity) {
            editorInteraction.selectedEntity = null;
        }

        // [New] 递归删除子实体
        if (entity.children && Array.isArray(entity.children.entities)) {
            for (const child of entity.children.entities) {
                if (world.entities.includes(child)) {
                    world.remove(child);
                }
            }
        }

        world.remove(entity);
    },

    /**
     * 处理实体创建
     */
    handleCreateEntity(payload: any, callbacks: any, source?: IEntity, target?: IEntity) {
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
};
