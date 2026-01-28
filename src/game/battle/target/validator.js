import { getAlive, getDead } from './utils';
import { getTeamContext } from './team';
import { createTargetingRuntimeContext } from '@schema/runtime/TargetingRuntimeContext';

/**
 * 获取所有合法的目标 UUID 列表
 */
export const getValidTargetIds = (input, targetType) => {
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

    const { partySlots, enemies, actor, targetType: finalType } = ctx;
    if (!actor) return [];

    const { myTeam, oppTeam } = getTeamContext(actor, partySlots, enemies);
    ctx.myTeam = myTeam;
    ctx.oppTeam = oppTeam;

    let validIds = [];
    switch (finalType) {
        case 'single':
        case 'enemy':
        case 'allEnemies':
        case 'all':
        case 'randomEnemy':
            validIds = getAlive(oppTeam).map(u => u.uuid);
            break;
        
        case 'ally':
        case 'allAllies':
            validIds = getAlive(myTeam).map(u => u.uuid);
            break;
        
        case 'deadAlly':
        case 'allDeadAllies':
            validIds = getDead(myTeam).map(u => u.uuid);
            break;
        
        case 'deadEnemy':
            validIds = getDead(oppTeam).map(u => u.uuid);
            break;
        
        case 'self':
            validIds = [actor.uuid];
            break;
        
        case 'allUnits':
            validIds = [...getAlive(myTeam), ...getAlive(oppTeam)].map(u => u.uuid);
            break;
        
        case 'allOtherUnits':
            validIds = [...getAlive(myTeam), ...getAlive(oppTeam)]
                .filter(u => u.uuid !== actor.uuid)
                .map(u => u.uuid);
            break;
        
        case 'allOtherAllies':
            validIds = getAlive(myTeam)
                .filter(u => u.uuid !== actor.uuid)
                .map(u => u.uuid);
            break;
        
        default:
            validIds = [];
            break;
    }

    ctx.validTargetIds = validIds;
    return validIds;
};
