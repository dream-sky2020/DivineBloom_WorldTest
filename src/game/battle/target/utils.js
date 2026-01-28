/**
 * 判断单位是否死亡
 */
export const isDead = (u) => !!(u && u.statusEffects && u.statusEffects.some(s => s.id === 'status_dead'));

/**
 * 判断单位是否存活
 */
export const isAlive = (u) => !isDead(u);

/**
 * 从数据结构中提取单位列表
 * @param {Array} source 
 * @param {Boolean} isPartySlots 
 */
export const extractUnits = (source, isPartySlots) => {
    if (!source) return [];
    if (!isPartySlots) return source; // 假设 enemies 已经是扁平数组

    const list = [];
    source.forEach(slot => {
        if (slot.front) list.push(slot.front);
        if (slot.back) list.push(slot.back);
    });
    return list;
};

/**
 * 在扁平列表中查找单位
 */
export const findUnit = (units, id) => {
    if (!id || !units) return null;
    return units.find(u => u.uuid === id || u.id === id) || null;
};

/**
 * 获取所有存活单位
 */
export const getAlive = (list) => list.filter(isAlive);

/**
 * 获取所有死亡单位
 */
export const getDead = (list) => list.filter(isDead);
