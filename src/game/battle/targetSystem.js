// src/game/battle/targetSystem.js

/**
 * 在队伍槽位中查找特定 ID 的单位
 * @param {Array} partySlots 队伍槽位数组
 * @param {Number|String} id 目标 ID 或 UUID
 * @returns {Object|null}
 */
export const findPartyMember = (partySlots, id) => {
    for (const slot of partySlots) {
        if (slot.front && (slot.front.uuid === id || slot.front.id === id)) return slot.front;
        if (slot.back && (slot.back.uuid === id || slot.back.id === id)) return slot.back;
    }
    return null;
};

/**
 * 根据类型解析目标列表
 * @param {Object} context 上下文 { partySlots, enemies, actor, targetId }
 * @param {String} targetType 目标类型 (allEnemies, single, ally, etc.)
 * @returns {Array} 目标单位数组
 */
export const resolveTargets = ({ partySlots, enemies, actor, targetId }, targetType) => {
    const targets = [];
    
    // 辅助：获取存活的友方
    const getAliveAllies = () => {
        const list = [];
        partySlots.forEach(slot => {
            if (slot.front && slot.front.currentHp > 0) list.push(slot.front);
            if (slot.back && slot.back.currentHp > 0) list.push(slot.back);
        });
        return list;
    };

    // 辅助：获取死亡的友方
    const getDeadAllies = () => {
        const list = [];
        partySlots.forEach(slot => {
            if (slot.front && slot.front.currentHp <= 0) list.push(slot.front);
            if (slot.back && slot.back.currentHp <= 0) list.push(slot.back);
        });
        return list;
    };

    // 辅助：获取存活的敌人
    const getAliveEnemies = () => enemies.filter(e => e.currentHp > 0);

    switch (targetType) {
        case 'allEnemies':
        case 'all': // 兼容旧定义
            return getAliveEnemies();

        case 'allAllies':
            return getAliveAllies();

        case 'allDeadAllies':
            return getDeadAllies();

        case 'allUnits':
            return [...getAliveEnemies(), ...getAliveAllies()];

        case 'allOtherUnits':
            return [
                ...getAliveEnemies(),
                ...getAliveAllies().filter(u => u.id !== actor.id)
            ];

        case 'allOtherAllies':
            return getAliveAllies().filter(u => u.id !== actor.id);

        case 'single':
        case 'enemy':
            // 优先尝试 ID 匹配
            let enemy = enemies.find(e => e.uuid === targetId || e.id === targetId);
            // 找不到则默认选第一个活着的
            if (!enemy) enemy = getAliveEnemies()[0];
            if (enemy) targets.push(enemy);
            break;

        case 'ally':
            let ally = targetId ? findPartyMember(partySlots, targetId) : actor;
            // 如果是给自己且没传ID，或者找到了
            if (ally) targets.push(ally);
            break;

        case 'deadAlly':
            let deadAlly = targetId ? findPartyMember(partySlots, targetId) : null;
            if (deadAlly && deadAlly.currentHp <= 0) targets.push(deadAlly);
            break;
            
        default:
            // 默认单体逻辑 fallback
            if (targetType === 'single') {
                 // 上面处理了，这里留空或处理未知类型
            }
            break;
    }

    return targets;
};

