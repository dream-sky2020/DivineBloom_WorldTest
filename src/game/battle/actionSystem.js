import * as TargetSystem from './targetSystem';
import { createActionRuntimeContext } from '@schema/runtime/ActionRuntimeContext';
import { resolveActionData } from './action/resolver';
import { standardStrategy } from './action/strategies/standardStrategy';
import { chainStrategy } from './action/strategies/chainStrategy';
import { randomStrategy } from './action/strategies/randomStrategy';
export { handleItemEffect } from './action/itemHandler';

/**
 * 执行战斗动作 (原子化重构版本)
 */
export const executeAction = (actor, action, battleContext) => {
    const { log, enemies, partySlots } = battleContext;

    // 1. 创建动作上下文（集成能量处理逻辑）
    let actionContext = createActionRuntimeContext(actor, action, battleContext);

    // 2. 解析动作数据并同步到上下文
    const resolved = resolveActionData(actor, action);
    if (action.type === 'skill' && !resolved.skillData) return { consumeTurn: false };

    // 合并解析结果到 actionContext，并注入运行时函数
    Object.assign(actionContext, resolved, {
        log: battleContext.log,
        enemies: battleContext.enemies,
        partySlots: battleContext.partySlots
    });

    // 3. 记录日志
    if (actionContext.logKey && log) {
        const params = { ...actionContext.logParams };
        // 如果日志需要 target 参数且存在 targetId，尝试解析目标名称
        if (action.targetId && !params.target) {
            const t = TargetSystem.findUnit([...TargetSystem.extractUnits(partySlots, true), ...enemies], action.targetId);
            if (t) params.target = t.name;
        }
        log(actionContext.logKey, params);
    }

    // 4. 解析目标并存入上下文
    actionContext.targets = TargetSystem.resolveTargets({
        partySlots,
        enemies,
        actor,
        targetId: action.targetId
    }, actionContext.targetType);

    // 5. 分发执行策略
    const { skillData } = actionContext;
    if (skillData && skillData.chain) {
        chainStrategy(actionContext);
    } else if (skillData && skillData.randomHits) {
        randomStrategy(actionContext);
    } else {
        standardStrategy(actionContext);
    }

    return { consumeTurn: actionContext.consumeTurn };
};
