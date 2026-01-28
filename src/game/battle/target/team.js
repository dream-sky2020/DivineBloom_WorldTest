import { extractUnits } from './utils';

/**
 * 获取基于行动者的团队上下文（区分我方与敌方）
 */
export const getTeamContext = (actor, partySlots, enemies) => {
    if (!actor) return { myTeam: [], oppTeam: [] };

    const isPlayer = actor.isPlayer;
    
    const myTeamRaw = isPlayer ? partySlots : enemies;
    const oppTeamRaw = isPlayer ? enemies : partySlots;

    return {
        myTeam: extractUnits(myTeamRaw, isPlayer),
        oppTeam: extractUnits(oppTeamRaw, !isPlayer)
    };
};
