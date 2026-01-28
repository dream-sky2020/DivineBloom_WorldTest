import { findUnit, getAlive, getDead, isDead } from './utils';
import { getTeamContext } from './team';
import { createTargetingRuntimeContext } from '@schema/runtime/TargetingRuntimeContext';

/**
 * 解析具体的目标逻辑
 * @param {Object|TargetingRuntimeContext} input 包含环境和参数的对象或上下文
 * @param {string} targetType 目标筛选类型 (如果 input 是上下文，则此参数可选)
 */
export const resolveTargets = (input, targetType) => {
    // 1. 初始化或提取上下文
    let ctx;
    if (input.isResolved !== undefined) {
        ctx = input;
    } else {
        ctx = createTargetingRuntimeContext({
            ...input,
            targetType: targetType || input.targetType
        });
    }

    const { partySlots, enemies, actor, targetId, targetType: finalType } = ctx;
    const targets = [];
    if (!actor) return targets;

    // 2. 获取阵营上下文
    const { myTeam, oppTeam } = getTeamContext(actor, partySlots, enemies);
    ctx.myTeam = myTeam;
    ctx.oppTeam = oppTeam;

    // 3. 执行筛选逻辑
    switch (finalType) {
        case 'single':
        case 'enemy':
            let target = targetId ? findUnit(oppTeam, targetId) : null;
            if (!target || isDead(target)) {
                const aliveOpponents = getAlive(oppTeam);
                if (aliveOpponents.length > 0) target = aliveOpponents[0];
            }
            if (target && !isDead(target)) targets.push(target);
            break;

        case 'allEnemies':
        case 'all':
            targets.push(...getAlive(oppTeam));
            break;

        case 'ally':
            let ally = targetId ? findUnit(myTeam, targetId) : actor;
            if (ally && !isDead(ally)) targets.push(ally);
            break;

        case 'allAllies':
            targets.push(...getAlive(myTeam));
            break;

        case 'deadAlly':
            let deadAlly = targetId ? findUnit(myTeam, targetId) : null;
            if (deadAlly && isDead(deadAlly)) {
                targets.push(deadAlly);
            } else if (!targetId) {
                const deads = getDead(myTeam);
                if (deads.length > 0) targets.push(deads[0]);
            }
            break;

        case 'deadEnemy':
            let deadOpp = targetId ? findUnit(oppTeam, targetId) : null;
            if (deadOpp && isDead(deadOpp)) {
                targets.push(deadOpp);
            } else if (!targetId) {
                const deads = getDead(oppTeam);
                if (deads.length > 0) targets.push(deads[0]);
            }
            break;

        case 'allDeadAllies':
            targets.push(...getDead(myTeam));
            break;

        case 'self':
            targets.push(actor);
            break;

        case 'randomEnemy':
            const alive = getAlive(oppTeam);
            if (alive.length > 0) {
                targets.push(alive[Math.floor(Math.random() * alive.length)]);
            }
            break;

        case 'allUnits':
            targets.push(...getAlive(myTeam), ...getAlive(oppTeam));
            break;

        case 'allOtherUnits':
            const allAlive = [...getAlive(myTeam), ...getAlive(oppTeam)];
            targets.push(...allAlive.filter(u => u.uuid !== actor.uuid));
            break;

        case 'allOtherAllies':
            targets.push(...getAlive(myTeam).filter(u => u.uuid !== actor.uuid));
            break;

        default:
            break;
    }

    ctx.targets = targets;
    ctx.isResolved = true;
    return targets;
};
