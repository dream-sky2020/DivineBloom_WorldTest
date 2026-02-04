import { world, actionQueue } from '@world2d/world'
import { createLogger } from '@/utils/logger'
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('TriggerSystem')

interface RuleContext {
    entity: IEntity;
    rule: any;
    state: any;
    detectArea?: any;
    detectProjectile?: any;
    detectInput?: any;
}

/**
 * 规则运行状态追踪 (内部使用，避免污染组件数据)
 * 结构: Map<entity, Array<ruleState>>
 */
const ruleRuntimeStates = new WeakMap<object, any[]>();

/**
 * 插件化规则处理器注册表
 */
const RuleHandlers: Record<string, (context: RuleContext) => boolean> = {
    /**
     * 基础区域进入检测
     */
    onEnter: (context) => {
        const { isInside, lastInside } = context.state;
        return isInside && !lastInside;
    },

    /**
     * 基础区域离开检测
     */
    onExit: (context) => {
        const { isInside, lastInside } = context.state;
        return !isInside && lastInside;
    },

    /**
     * 持续在区域内检测
     */
    onStay: (context) => {
        return context.state.isInside;
    },

    /**
     * 按键按下检测
     */
    onPress: (context) => {
        const { detectInput, rule } = context;
        if (!detectInput) return false;

        const inputTriggered = detectInput.justPressed;

        // 如果规则要求必须在区域内
        if (rule.requireArea) {
            return inputTriggered && context.state.isInside;
        }

        return inputTriggered;
    }
};

/**
 * 升级版 TriggerSystem
 */
export const TriggerSystem: ISystem & {
    _findInFamily(entity: IEntity, componentName: string): any;
    _dispatchActions(entity: IEntity, trigger: any, results: any[], rule: any): void;
    _findActionProvider(entity: IEntity, actionType: string): IEntity;
    _checkCondition(entity: IEntity, conditionType: string): boolean;
} = {
    name: 'trigger',

    update(dt: number) {
        const triggers = world.with('trigger');

        for (const entity of triggers) {
            const e = entity as IEntity;
            const trigger = e.trigger;

            // 1. 基础状态检查
            if (!trigger.active || trigger.oneShotExecuted) continue;
            if (trigger.cooldownTimer > 0) {
                trigger.cooldownTimer -= dt;
                continue;
            }

            // 2. 获取或初始化运行状态
            let states = ruleRuntimeStates.get(e);
            if (!states) {
                states = trigger.rules.map(() => ({ lastInside: false, isInside: false }));
                ruleRuntimeStates.set(e, states);
            }

            // 3. 预取该实体及其族群的相关组件 (缓存加速)
            const detectArea = this._findInFamily(e, 'detectArea');
            const detectProjectile = this._findInFamily(e, 'detectProjectile');
            const detectInput = this._findInFamily(e, 'detectInput');

            // 只要 detectArea 或 detectProjectile 中有任何结果，即视为“正在接触”
            const currentResults = [...(detectArea?.results || []), ...(detectProjectile?.results || [])];
            const isInside = currentResults.length > 0;

            let shouldActivate = false;
            let triggeredRule = null;

            // 4. 遍历并执行所有规则处理器
            for (let i = 0; i < trigger.rules.length; i++) {
                const rule = trigger.rules[i];
                const state = states[i];

                // 更新当前帧的感知状态
                state.isInside = isInside;

                // 执行条件检查 (Condition)
                if (rule.condition && rule.condition !== 'none' && !this._checkCondition(e, rule.condition)) {
                    state.lastInside = isInside;
                    continue;
                }

                // 执行规则处理器
                const handler = RuleHandlers[rule.type];
                if (handler) {
                    const context = { entity: e, rule, state, detectArea, detectProjectile, detectInput };
                    if (handler(context)) {
                        shouldActivate = true;
                        triggeredRule = rule;
                    }
                }

                // 状态持久化 (为下一帧做准备)
                state.lastInside = isInside;

                if (shouldActivate) break; // 只要有一个规则满足就触发
            }

            // 5. 触发动作分发
            if (shouldActivate) {
                this._dispatchActions(e, trigger, currentResults, triggeredRule);

                // 更新冷却和单次触发标记
                trigger.cooldownTimer = trigger.defaultCooldown;
                if (trigger.oneShot) trigger.oneShotExecuted = true;
            }
        }
    },

    /**
     * 内部方法：在实体族群（父、子）中查找组件
     */
    _findInFamily(entity: IEntity, componentName: string) {
        // 1. 检查自身
        if ((entity as any)[componentName]) return (entity as any)[componentName];
        // 2. 检查子实体 (通常 Sensor/Collider 在子实体)
        if (entity.children && Array.isArray(entity.children.entities)) {
            const child = entity.children.entities.find((c: any) => c[componentName]);
            if (child) return (child as any)[componentName];
        }
        // 3. 检查父实体 (部分逻辑挂在 Root)
        if (entity.parent?.entity && (entity.parent.entity as any)[componentName]) {
            return (entity.parent.entity as any)[componentName];
        }
        return null;
    },

    /**
     * 内部方法：处理动作分发
     * 明确 Source (发起逻辑的实体) 和 Target (被影响的实体)
     */
    _dispatchActions(entity: IEntity, trigger: any, results: any[], rule: any) {
        const targets = (results && results.length > 0) ? results : [null];

        for (const actionType of trigger.actions) {
            // 自动定位持有具体 action 组件的实体
            const actionSource = this._findActionProvider(entity, actionType);

            const globalEntity = world.with('commands').first;
            const targetQueue = globalEntity ? globalEntity.commands.queue : actionQueue;

            for (const target of targets) {
                logger.info(`Pushing Action: ${actionType} | Source: ${actionSource.name || actionSource.type} | Target: ${target?.name || 'none'}`);
                targetQueue.push({
                    source: actionSource, // 动作发起者 (通常是拥有配置的 Root)
                    type: actionType,     // 动作类型 (如 TELEPORT, DIALOGUE)
                    target: target        // 动作目标 (如 Player)
                });
            }
        }
    },

    /**
     * 内部方法：定位真正持有动作配置的实体
     */
    _findActionProvider(entity: IEntity, actionType: string) {
        const componentName = `action${actionType.charAt(0).toUpperCase() + actionType.slice(1).toLowerCase()}`;

        // 向上溯源：如果当前实体没有该组件，尝试查找父实体
        let current: IEntity | undefined = entity;
        while (current) {
            if ((current as any)[componentName]) return current;
            current = current.parent?.entity;
        }
        return entity; // Fallback
    },

    /**
     * 内部方法：条件检查
     */
    _checkCondition(entity: IEntity, conditionType: string) {
        const logicEntity = entity.parent?.entity || entity;
        if (conditionType === 'notStunned') {
            if (!logicEntity.aiState) return true;
            return logicEntity.aiState.state !== 'stunned';
        }
        return true;
    }
};
