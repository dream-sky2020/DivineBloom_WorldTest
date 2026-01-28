// src/game/battle/targetSystem.js
import { extractUnits, findUnit } from './target/utils';

// 导出解析逻辑
export { resolveTargets } from './target/resolvers';
export { getValidTargetIds } from './target/validator';

// 导出基础工具
export { 
    extractUnits, 
    findUnit, 
    isAlive, 
    isDead, 
    getAlive, 
    getDead 
} from './target/utils';

// 导出阵营工具
export { getTeamContext } from './target/team';

/**
 * 兼容性导出：获取所有单位扁平列表
 */
export const getAllUnits = (partySlots, enemies) => {
    return [
        ...extractUnits(partySlots, true),
        ...extractUnits(enemies, false)
    ];
};

/**
 * 兼容性导出：查找队员
 */
export const findPartyMember = (partySlots, id) => {
    const units = extractUnits(partySlots, true);
    return findUnit(units, id);
};
