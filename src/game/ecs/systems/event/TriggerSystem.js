import { world, actionQueue } from '@/game/ecs/world'
import { createLogger } from '@/utils/logger'

const logger = createLogger('TriggerSystem')

let debugDumped = false

/**
 * TriggerSystem
 * 决策核心
 * 输入: DetectArea, DetectInput 的运行时数据
 * 输出: 向 ActionQueue 推送执行请求
 */
export const TriggerSystem = {
  update(dt) {
    const triggers = world.with('trigger')

    // Debug System Heartbeat (Low frequency)
    if (Math.random() < 0.005) {
      logger.debug(`Heartbeat. Triggers count: ${[...triggers].length}`)
    }

    // ONCE PER SESSION DEBUG DUMP
    if (!debugDumped && [...triggers].length > 0) {
      // logger.debug('[TriggerSystem] INITIAL TRIGGER DUMP');
      for (const entity of triggers) {
        // Defensive check inside debug loop
        if (!entity.trigger) {
          logger.error(`Entity ${entity.id} has 'trigger' tag but component is missing!`);
          continue;
        }
        const t = entity.trigger;
        // logger.debug(`Entity [${entity.type}] ID:${entity.id || 'N/A'}`);
        // Direct access to flat properties
        // logger.debug(`  State: Active=${t.active}, Cooldown=${t.cooldownTimer}, OneShotExec=${t.oneShotExecuted}`);
        // logger.debug(`  Rules:`, JSON.stringify(t.rules));
        // logger.debug(`  Actions:`, JSON.stringify(t.actions));
      }
      // console.groupEnd();
      debugDumped = true;
    }

    for (const entity of triggers) {
      const trigger = entity.trigger

      // Defensive Check: Component Existence
      if (!trigger) {
        logger.warn(`Missing trigger component on entity ${entity.id || 'N/A'}`);
        continue;
      }

      // 1. 状态检查 (Direct Access - Flattened)
      if (trigger.active === false) continue; // Explicit check, default true
      if (trigger.oneShotExecuted) continue
      if (trigger.cooldownTimer > 0) {
        trigger.cooldownTimer -= dt
        continue
      }

      // Defensive Check: Rules Array
      if (!trigger.rules || !Array.isArray(trigger.rules)) {
        logger.warn(`Invalid 'rules' array for Entity: ${entity.type} (ID: ${entity.id})`);
        trigger.rules = []; // Patch it to prevent crash
        continue;
      }

      // 2. 规则匹配
      let shouldTrigger = false
      let triggeredRule = null

      // 遍历所有规则，通常满足任意一个规则即可触发 (OR 逻辑)
      for (const rule of trigger.rules) {
        if (this.checkRule(entity, rule)) {
          shouldTrigger = true
          triggeredRule = rule
          break
        }
      }

      // 3. 执行决策
      if (shouldTrigger) {
        logger.info(`Trigger Activated! Type: ${entity.type}, ID: ${entity.id}, Rule: ${triggeredRule?.type}, Actions: ${trigger.actions?.join(', ')}`)

        // 标记状态 (Direct Access)
        if (trigger.oneShot) {
          trigger.oneShotExecuted = true
        }

        // Defensive Check: Actions Array
        if (!trigger.actions || !Array.isArray(trigger.actions)) {
          logger.error(`Invalid 'actions' array for Entity: ${entity.type} (ID: ${entity.id})`);
          trigger.actions = [];
        }

        // 收集所有 Actions 并推送到队列
        if (trigger.actions.length === 0) {
          logger.warn(`Trigger activated but no actions defined for Entity: ${entity.type} (ID: ${entity.id})!`)
        }

        for (const actionType of trigger.actions) {
          logger.info(`Pushing Action: ${actionType} for Entity: ${entity.type} (ID: ${entity.id})`)
          
          // 如果有多个检测结果（例如玩家和敌人都在区域内），则为每个结果生成一个 Action
          if (entity.detectArea && entity.detectArea.results && entity.detectArea.results.length > 0) {
            for (const target of entity.detectArea.results) {
              actionQueue.push({
                source: entity,
                type: actionType,
                target: target
              })
            }
          } else {
            // 没有检测结果的情况（可能是 onPress 等其他触发方式）
            actionQueue.push({
              source: entity,
              type: actionType,
              target: null
            })
          }
        }

        // 使用组件定义的默认冷却时间，如果没有则默认为 0.5
        trigger.cooldownTimer = trigger.defaultCooldown !== undefined ? trigger.defaultCooldown : 0.5
      }
    }
  },

  checkRule(entity, rule) {
    if (!rule) return false;

    // [NEW] 0. 额外条件检查 (Condition Check)
    if (rule.condition && rule.condition !== 'none') {
      if (!this.checkCondition(entity, rule.condition)) {
        return false;
      }
    }

    const detectArea = entity.detectArea
    const detectInput = entity.detectInput

    switch (rule.type) {
      case 'onEnter':
        // 需要 DetectArea
        if (!detectArea) {
          // console.warn(`[TriggerSystem] Rule 'onEnter' requires DetectArea component. Entity: ${entity.type}`)
          return false
        }
        // Defensive: results might be missing if init failed
        if (!detectArea.results) detectArea.results = [];

        const isInside = detectArea.results.length > 0

        if (isInside && Math.random() < 0.01) {
          logger.debug(`'onEnter' rule met for Entity: ${entity.type}`)
        }

        if (rule.requireEnterOnly) {
          // 真正的 onEnter
          // Defensive check for wasInside
          if (entity.trigger.wasInside === undefined) entity.trigger.wasInside = false;

          const wasInside = entity.trigger.wasInside
          entity.trigger.wasInside = isInside
          return isInside && !wasInside
        }

        return isInside

      case 'onStay':
        if (!detectArea) return false
        if (!detectArea.results) return false;
        return detectArea.results.length > 0

      case 'onPress':
        // 需要 DetectInput
        if (!detectInput) {
          logger.warn(`Rule 'onPress' requires DetectInput component. Entity: ${entity.type}`)
          return false
        }

        if (detectInput.justPressed) {
          logger.debug(`Checking 'onPress' rule for Entity: ${entity.type}. JustPressed: ${detectInput.justPressed}`)
        }

        // 如果需要同时在区域内
        if (rule.requireArea) {
          if (!detectArea || !detectArea.results || detectArea.results.length === 0) {
            if (detectInput.justPressed) {
              logger.debug(`'onPress' rule failed: Not in Area. Entity: ${entity.type}`)
            }
            return false
          }
        }

        const triggered = detectInput.justPressed
        if (triggered) {
          logger.info(`'onPress' rule met! Entity: ${entity.type}`)
        }
        return triggered

      default:
        logger.warn(`Unknown rule type: ${rule.type}`)
        return false
    }
  },

  /**
   * 检查自定义条件
   * @param {object} entity 
   * @param {string} conditionType 
   */
  checkCondition(entity, conditionType) {
    if (conditionType === 'notStunned') {
      // 如果实体没有 aiState，则认为满足条件（不是 stunned）
      if (!entity.aiState) return true;
      // 只有 state 为 'stunned' 时返回 false
      return entity.aiState.state !== 'stunned';
    }
    return true;
  }
}
