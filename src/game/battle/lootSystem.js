/**
 * 战利品计算系统
 * @param {object} enemy 敌人数据 (包含 drops 配置)
 * @returns {Array} 掉落物品列表 [{ itemId, qty }]
 */
export const calculateDrops = (enemy) => {
    if (!enemy || !enemy.drops || !Array.isArray(enemy.drops)) return []

    const results = []

    enemy.drops.forEach(drop => {
        // 随机判定
        if (Math.random() <= drop.chance) {
            // 计算数量
            const qty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty
            if (qty > 0) {
                results.push({ itemId: drop.itemId, qty })
            }
        }
    })

    return results
}

/**
 * 合并掉落物列表
 * @param {Array} dropsList 多个掉落列表的数组
 * @returns {Array} 合并后的列表
 */
export const mergeDrops = (dropsList) => {
    const merged = {}

    dropsList.forEach(drops => {
        drops.forEach(item => {
            if (!merged[item.itemId]) {
                merged[item.itemId] = 0
            }
            merged[item.itemId] += item.qty
        })
    })

    return Object.keys(merged).map(itemId => ({
        itemId: Number(itemId),
        qty: merged[itemId]
    }))
}
