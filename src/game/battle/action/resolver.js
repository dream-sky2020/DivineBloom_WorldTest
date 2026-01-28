import { skillsDb } from '@schema/skills';

/**
 * 解析动作数据，转换为统一的格式
 */
export const resolveActionData = (actor, action) => {
    let targetType = 'single';
    let effects = [];
    let skillData = null;
    let consumeTurn = true;
    let logKey = null;
    let logParams = null;

    if (action.type === 'custom_skill') {
        targetType = action.targetType || 'single';
        effects = action.effects || [];
        if (action.consumeTurn === false) consumeTurn = false;
        if (action.logKey) {
            logKey = action.logKey;
            logParams = { name: actor.name };
        }
    } else if (action.type === 'skill') {
        skillData = skillsDb[action.skillId];
        if (skillData) {
            targetType = skillData.targetType || 'single';
            effects = skillData.effects || [];
            if (skillData.consumeTurn === false) consumeTurn = false;
            logKey = 'battle.useSkill';
            logParams = { user: actor.name, skill: skillData.name };
        }
    } else if (action.type === 'attack') {
        targetType = 'enemy';
        effects = [{ type: 'damage', value: 1, scaling: 'atk' }];
    }

    // AI 或特定动作可以覆盖目标类型
    if (action.targetType) targetType = action.targetType;

    return { skillData, targetType, effects, consumeTurn, logKey, logParams };
};
