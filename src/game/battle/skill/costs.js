/**
 * 累计各项资源消耗需求
 */
export const accumulateCosts = (costs, initialReqs = null) => {
    const reqs = initialReqs ? JSON.parse(JSON.stringify(initialReqs)) : {
        mp: 0,
        hp: 0,
        statuses: {}, // id -> amount
        items: {}     // id -> amount
    };

    for (const cost of costs) {
        if (cost.type === 'mp') {
            reqs.mp += cost.amount;
        } else if (cost.type === 'hp') {
            reqs.hp += cost.amount;
        } else if (cost.type === 'status_duration') {
            reqs.statuses[cost.id] = (reqs.statuses[cost.id] || 0) + cost.amount;
        } else if (cost.type === 'item') {
            reqs.items[cost.id] = (reqs.items[cost.id] || 0) + cost.amount;
        }
    }
    return reqs;
};

/**
 * 检查基础资源是否满足
 */
export const checkResources = (actor, reqs, context) => {
    const isDead = (u) => u && u.statusEffects && u.statusEffects.some(s => s.id === 'status_dead');
    
    if (actor.currentMp < reqs.mp) return false;
    if (isDead(actor)) return false; 
    if (actor.currentHp <= reqs.hp) return false;

    for (const [statusId, amount] of Object.entries(reqs.statuses)) {
        const status = actor.statusEffects?.find(s => s.id === statusId);
        const currentDuration = status ? (Number(status.duration) || 0) : 0;
        if (currentDuration < amount) return false;
    }

    for (const [itemId, amount] of Object.entries(reqs.items)) {
        if (context && context.checkItem) {
            if (!context.checkItem(itemId, amount)) return false;
        } else {
            console.warn('Battle context missing checkItem for item cost');
            return false;
        }
    }
    return true;
};

/**
 * 支付基础资源
 */
export const payResources = (actor, reqs, context) => {
    if (reqs.mp > 0) {
        actor.currentMp = Math.max(0, actor.currentMp - reqs.mp);
    }
    if (reqs.hp > 0) {
        actor.currentHp = Math.max(1, actor.currentHp - reqs.hp);
    }
    for (const [statusId, amount] of Object.entries(reqs.statuses)) {
        const status = actor.statusEffects?.find(s => s.id === statusId);
        if (status) {
            status.duration = (Number(status.duration) || 0) - amount;
            if (status.duration <= 0) {
                if (actor.statusEffects) {
                    const idx = actor.statusEffects.indexOf(status);
                    if (idx !== -1) actor.statusEffects.splice(idx, 1);
                }
            }
        }
    }
    for (const [itemId, amount] of Object.entries(reqs.items)) {
        if (context && context.consumeItem) {
            context.consumeItem(itemId, amount);
        }
    }
};

/**
 * 解析并检查技能消耗
 */
export const checkSkillCost = (actor, skill, context) => {
    // 1. 结构化 costs 数组
    if (skill.costs && skill.costs.length > 0) {
        const commonCosts = [];
        const costGroups = {};

        for (const cost of skill.costs) {
            if (cost.group !== undefined && cost.group !== null) {
                if (!costGroups[cost.group]) costGroups[cost.group] = [];
                costGroups[cost.group].push(cost);
            } else {
                commonCosts.push(cost);
            }
        }

        const baseReqs = accumulateCosts(commonCosts);
        const groupIds = Object.keys(costGroups).map(Number).sort((a, b) => a - b);
        
        if (groupIds.length === 0) {
            return checkResources(actor, baseReqs, context);
        }

        for (const groupId of groupIds) {
            const groupReqs = accumulateCosts(costGroups[groupId], baseReqs);
            if (checkResources(actor, groupReqs, context)) {
                return true;
            }
        }
        return false;
    }

    // 2. 兼容旧的字符串格式
    if (skill.cost && typeof skill.cost === 'string') {
        const parts = skill.cost.split(' ');
        if (parts.length === 2 && parts[1] === 'MP') {
            const amount = parseInt(parts[0], 10);
            if (!isNaN(amount)) {
                return actor.currentMp >= amount;
            }
        }
    }
    return true;
};

/**
 * 支付技能消耗
 */
export const paySkillCost = (actor, skill, context) => {
    if (skill.costs && skill.costs.length > 0) {
        const commonCosts = [];
        const costGroups = {};

        for (const cost of skill.costs) {
            if (cost.group !== undefined && cost.group !== null) {
                if (!costGroups[cost.group]) costGroups[cost.group] = [];
                costGroups[cost.group].push(cost);
            } else {
                commonCosts.push(cost);
            }
        }

        const baseReqs = accumulateCosts(commonCosts);
        const groupIds = Object.keys(costGroups).map(Number).sort((a, b) => a - b);

        if (groupIds.length === 0) {
            payResources(actor, baseReqs, context);
            return;
        }

        for (const groupId of groupIds) {
            const groupReqs = accumulateCosts(costGroups[groupId], baseReqs);
            if (checkResources(actor, groupReqs, context)) {
                payResources(actor, groupReqs, context);
                return;
            }
        }
        console.warn("paySkillCost failed to find satisfied cost group despite check passing.");
        return;
    }

    if (skill.cost && typeof skill.cost === 'string') {
        const parts = skill.cost.split(' ');
        if (parts.length === 2 && parts[1] === 'MP') {
            const amount = parseInt(parts[0], 10);
            if (!isNaN(amount)) {
                actor.currentMp = Math.max(0, actor.currentMp - amount);
            }
        }
    }
};
