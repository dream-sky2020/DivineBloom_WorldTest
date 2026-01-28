import { findUnit, getAlive, getDead, isDead } from './utils';
import { getTeamContext } from './team';

/**
 * 解析具体的目标逻辑
 */
export const resolveTargets = ({ partySlots, enemies, actor, targetId }, targetType) => {
    const targets = [];
    if (!actor) return targets;

    const { myTeam, oppTeam } = getTeamContext(actor, partySlots, enemies);

    switch (targetType) {
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

    return targets;
};
