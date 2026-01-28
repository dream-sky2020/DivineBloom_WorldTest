import { getAlive, getDead } from './utils';
import { getTeamContext } from './team';

/**
 * 获取所有合法的目标 UUID 列表
 */
export const getValidTargetIds = ({ partySlots, enemies, actor }, targetType) => {
    if (!actor) return [];

    const { myTeam, oppTeam } = getTeamContext(actor, partySlots, enemies);

    switch (targetType) {
        case 'single':
        case 'enemy':
        case 'allEnemies':
        case 'all':
        case 'randomEnemy':
            return getAlive(oppTeam).map(u => u.uuid);
        
        case 'ally':
        case 'allAllies':
            return getAlive(myTeam).map(u => u.uuid);
        
        case 'deadAlly':
        case 'allDeadAllies':
            return getDead(myTeam).map(u => u.uuid);
        
        case 'deadEnemy':
            return getDead(oppTeam).map(u => u.uuid);
        
        case 'self':
            return [actor.uuid];
        
        case 'allUnits':
            return [...getAlive(myTeam), ...getAlive(oppTeam)].map(u => u.uuid);
        
        case 'allOtherUnits':
            return [...getAlive(myTeam), ...getAlive(oppTeam)]
                .filter(u => u.uuid !== actor.uuid)
                .map(u => u.uuid);
        
        case 'allOtherAllies':
            return getAlive(myTeam)
                .filter(u => u.uuid !== actor.uuid)
                .map(u => u.uuid);
        
        default:
            return [];
    }
};
