import { actionQueue, eventQueue, world } from '@world2d/world'
import { getSystem } from '@world2d/SystemRegistry'
import { entityTemplateRegistry } from '@definitions/internal/EntityTemplateRegistry'
import { editorManager } from '@/game/editor/core/EditorCore'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ExecuteSystem')

/**
 * 遗留事件处理器
 */
const EventHandlers = {
  TRIGGER_BATTLE: (payload, callbacks) => {
    if (callbacks && callbacks.onEncounter) callbacks.onEncounter(payload.battleGroup, payload.uuid)
  },
  TRIGGER_MAP_SWITCH: (payload, callbacks) => {
    if (callbacks && callbacks.onSwitchMap) callbacks.onSwitchMap(payload.targetMapId, payload.targetEntryId)
  },
  INTERACT_NPC: (payload, callbacks) => {
    if (callbacks && callbacks.onInteract) callbacks.onInteract(payload.interaction)
  }
}

/**
 * ExecuteSystem
 * 任务执行总管
 * 接收 TriggerSystem 产生的 Action 请求，以及 UI 产生的 Command 请求，统一分发执行
 */
export const ExecuteSystem = {
  update(callbacks = {}, mapData = null) {
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
      const events = eventQueue.drain()
      for (const event of events) {
        if (event.type && event.payload) {
          const handler = EventHandlers[event.type]
          if (handler) handler(event.payload, callbacks)
        }
      }
    }
  },

  /**
   * 统一分发器 (Dispatch Center)
   * 能够识别 Action { source, type, target } 和 Command { type, payload }
   */
  dispatch(item, callbacks, mapData) {
    if (!item || !item.type) return;

    const type = item.type;
    // 兼容两种结构：payload (Command) 或 source/target (Action)
    const payload = item.payload || {};
    const source = item.source;
    const target = item.target;

    logger.info(`Dispatching: ${type}`, { type, payload, source, target });

    switch (type) {
      // --- 游戏逻辑动作 (Actions) ---
      case 'BATTLE': {
        const battleSystem = getSystem('battle-execute');
        if (battleSystem) {
          battleSystem.handle(source, callbacks);
        } else {
          logger.warn('战斗系统未实现，无法处理 BATTLE 动作', { source });
        }
        break;
      }

      case 'DIALOGUE': {
        const dialogueSystem = getSystem('dialogue-execute');
        if (dialogueSystem) {
          dialogueSystem.handle(source, callbacks);
        } else {
          logger.warn('对话系统未找到，无法处理 DIALOGUE 动作', { source });
        }
        break;
      }

      case 'TELEPORT': {
        const teleportSystem = getSystem('teleport-execute');
        if (teleportSystem) {
          // Teleport 期望的是整个 request 对象作为参数
          teleportSystem.handle(item, callbacks, mapData);
        } else {
          logger.warn('传送系统未找到，无法处理 TELEPORT 动作', { item });
        }
        break;
      }

      // --- 编辑器/UI 指令 (Commands) ---
      case 'DELETE_ENTITY':
      case 'DELETE':
        this.handleDelete(payload.entity || target || source, callbacks);
        break;

      case 'CREATE_ENTITY':
        this.handleCreateEntity(payload, callbacks);
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
  handleDelete(entity, callbacks) {
    if (!entity) return;

    // 安全检查
    if (entity.globalManager || entity.inspector?.allowDelete === false) {
      logger.warn('Attempted to delete a protected entity:', entity.type);
      return;
    }

    logger.info('Deleting entity:', entity.type, entity.id || entity.uuid);

    // 同步 UI 状态
    if (editorManager.selectedEntity === entity) {
      editorManager.selectedEntity = null;
    }

    // 同步交互系统状态
    const editorInteraction = getSystem('editor-interaction')
    if (editorInteraction && editorInteraction.selectedEntity === entity) {
      editorInteraction.selectedEntity = null;
    }

    world.remove(entity);
  },

  /**
   * 处理实体创建
   * @param {Object} payload - { templateId, position, customData }
   * @param {Object} callbacks 
   */
  handleCreateEntity(payload, callbacks) {
    const { templateId, position, customData = {} } = payload;

    if (!templateId) {
      logger.error('CREATE_ENTITY: templateId is required');
      return;
    }

    logger.info(`Creating entity from template: ${templateId}`, payload);

    try {
      // 使用模板注册表创建实体
      const entity = entityTemplateRegistry.createEntity(templateId, customData, position);

      if (entity) {
        logger.info(`Entity created successfully:`, entity.type, entity.name);

        // 自动选中新创建的实体（方便用户立即编辑）
        editorManager.selectedEntity = entity;
      } else {
        logger.error(`Failed to create entity from template: ${templateId}`);
      }
    } catch (error) {
      logger.error(`Error creating entity:`, error);
    }
  }
}
