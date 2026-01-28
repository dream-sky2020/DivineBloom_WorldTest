import * as TargetSystem from './targetSystem';
import { prepareActionContext } from './action/context';
import { resolveActionData } from './action/resolver';
import { standardStrategy } from './action/strategies/standardStrategy';
import { chainStrategy } from './action/strategies/chainStrategy';
import { randomStrategy } from './action/strategies/randomStrategy';
export { handleItemEffect } from './action/itemHandler';

/**
 * 执行战斗动作 (原子化重构版本)
 */
export const executeAction = (actor, action, context) => {
    const { log, enemies, partySlots } = context;

    // 1. 准备动作上下文（处理能量倍率）
    const actionContext = prepareActionContext(actor, context);

    // 2. 解析动作数据
    const { 
        skillData, 
        targetType, 
        effects, 
        consumeTurn, 
        logKey, 
        logParams 
    } = resolveActionData(actor, action);

    if (action.type === 'skill' && !skillData) return { consumeTurn: false };

    // 3. 记录日志
    if (logKey && log) {
        const params = { ...logParams };
        // 如果日志需要 target 参数且存在 targetId，尝试解析目标名称
        if (action.targetId && !params.target) {
            const t = TargetSystem.findUnit([...TargetSystem.extractUnits(partySlots, true), ...enemies], action.targetId);
            if (t) params.target = t.name;
        }
        log(logKey, params);
    }

    // 4. 解析目标
    const targets = TargetSystem.resolveTargets({
        partySlots,
        enemies,
        actor,
        targetId: action.targetId
    }, targetType);

    // 5. 分发执行策略
    if (skillData && skillData.chain) {
        chainStrategy(actor, action, skillData, actionContext);
    } else if (skillData && skillData.randomHits) {
        randomStrategy(actor, skillData, actionContext);
    } else {
        standardStrategy(actor, targets, action, skillData, effects, actionContext);
    }

    return { consumeTurn };
};
