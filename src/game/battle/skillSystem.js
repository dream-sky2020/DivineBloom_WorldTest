import { statusDb } from '@/data/status';

/**
 * 解析连锁技能 (Chain Skill) 的命中序列
 * @param {Object} skill 技能对象
 * @param {Object} initialTarget 初始目标
 * @param {Array} allEnemies 所有敌人列表
 * @returns {Array} 命中序列 [{ target, damageMultiplier, hitIndex }]
 */
export const resolveChainSequence = (skill, initialTarget, allEnemies) => {
    const hits = [];
    const bounceCount = skill.chain || 0;
    const decay = skill.decay || 0.85;
    let multiplier = 1.0;

    // 用于记录已命中的目标 UUID，避免重复（如果设计允许重复可移除）
    const hitIds = new Set();

    let currentTarget = initialTarget;

    // 如果初始目标无效，尝试找一个替补
    if (!currentTarget || currentTarget.currentHp <= 0) {
        currentTarget = allEnemies.find(e => e.currentHp > 0);
    }

    for (let i = 0; i < bounceCount; i++) {
        if (!currentTarget) break;

        // 记录命中
        hitIds.add(currentTarget.uuid);
        hits.push({
            target: currentTarget,
            multiplier: multiplier,
            hitIndex: i + 1
        });

        // 衰减伤害
        multiplier *= decay;

        // 寻找下一个目标 (随机一个没被击中过的活着的目标)
        const candidates = allEnemies.filter(e =>
            e.currentHp > 0 && !hitIds.has(e.uuid)
        );

        if (candidates.length === 0) break;

        // 随机选择
        currentTarget = candidates[Math.floor(Math.random() * candidates.length)];
    }

    return hits;
};

/**
 * 解析随机多次攻击序列 (Random Sequence)
 * @param {Object} skill 技能对象
 * @param {Array} allEnemies 所有敌人列表
 * @returns {Array} 命中序列 [{ target, hitIndex }]
 */
export const resolveRandomSequence = (skill, allEnemies) => {
    const hits = [];
    const count = skill.randomHits || 1;

    for (let i = 0; i < count; i++) {
        // 每次都重新筛选存活的敌人
        const candidates = allEnemies.filter(e => e.currentHp > 0);
        if (candidates.length === 0) break;

        const target = candidates[Math.floor(Math.random() * candidates.length)];
        hits.push({
            target: target,
            hitIndex: i + 1
        });
    }
    return hits;
};

// --- Internal Helper Functions for Cost System ---

const accumulateCosts = (costs, initialReqs = null) => {
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

const checkResources = (actor, reqs, context) => {
    if (actor.currentMp < reqs.mp) return false;
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

const payResources = (actor, reqs, context) => {
    // Pay MP
    if (reqs.mp > 0) {
        actor.currentMp = Math.max(0, actor.currentMp - reqs.mp);
    }
    // Pay HP
    if (reqs.hp > 0) {
        actor.currentHp = Math.max(1, actor.currentHp - reqs.hp);
    }
    // Pay Status Duration
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
    // Pay Items
    for (const [itemId, amount] of Object.entries(reqs.items)) {
        if (context && context.consumeItem) {
            context.consumeItem(itemId, amount);
        }
    }
};

/**
 * 检查技能消耗是否满足
 * 支持 Group 优先级：优先尝试消耗 group 0，其次 group 1...
 * @param {Object} actor 行动者
 * @param {Object} skill 技能定义
 * @param {Object} context 上下文 (包含 inventory 等)
 * @returns {Boolean}
 */
export const checkSkillCost = (actor, skill, context) => {
    // 1. 优先检查结构化的 costs 数组
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

        // 计算公共消耗需求
        const baseReqs = accumulateCosts(commonCosts);

        // 如果没有分组，直接检查公共消耗
        const groupIds = Object.keys(costGroups).map(Number).sort((a, b) => a - b);
        if (groupIds.length === 0) {
            return checkResources(actor, baseReqs, context);
        }

        // 如果有分组，按优先级检查
        // 逻辑：BaseReqs + GroupReqs 必须满足其一
        for (const groupId of groupIds) {
            const groupReqs = accumulateCosts(costGroups[groupId], baseReqs);
            if (checkResources(actor, groupReqs, context)) {
                return true;
            }
        }

        return false;
    }

    // 2. 兼容旧的字符串 cost 格式 (例如 "10 MP")
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
 * 判断角色是否可以使用该技能 (综合判断：消耗、状态限制等)
 * @param {Object} actor 
 * @param {Object} skill 
 * @param {Object} context 
 * @returns {Boolean}
 */
export const canUseSkill = (actor, skill, context) => {
    if (!actor || !skill) return false;

    // 1. 检查死亡状态 (通常死亡不能用技能，除非技能是“死亡时触发”或者特殊技能)
    // 但通常由外部控制行动权。这里假设如果有行动权，只需检查消耗和沉默。

    // 2. 检查消耗
    if (!checkSkillCost(actor, skill, context)) return false;

    // 3. 检查沉默/封印状态 (示例：如果有 Silence 状态且技能是 Magic 类型)
    // 假设 status 效果里有 type: 'silence'，或者 statusID 对应沉默
    // 这里暂时留空，等待状态系统完善
    if (actor.statusEffects) {
        const isSilenced = actor.statusEffects.some(s => {
            // 检查状态定义是否有 silence 效果
            // 这里需要 statusDb，但为了避免循环依赖，或者假设 effect.type === 'silence'
            // 暂时简单处理：如果以后有沉默状态，在这里加判断
            return false;
        });

        if (isSilenced && skill.category === 'skillCategories.magic') {
            return false;
        }
    }

    return true;
};

/**
 * 支付技能消耗
 * @param {Object} actor 行动者
 * @param {Object} skill 技能定义
 * @param {Object} context 上下文
 */
export const paySkillCost = (actor, skill, context) => {
    // 1. 结构化 costs
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

        // 找到第一个满足条件的组进行支付
        for (const groupId of groupIds) {
            const groupReqs = accumulateCosts(costGroups[groupId], baseReqs);
            if (checkResources(actor, groupReqs, context)) {
                payResources(actor, groupReqs, context);
                return; // 支付成功，退出
            }
        }

        // 理论上 checkSkillCost 通过了就不会走到这里，
        // 但如果走到这里说明资源可能在 check 和 pay 之间变化了，或者逻辑异常。
        console.warn("paySkillCost failed to find satisfied cost group despite check passing.");
        return;
    }

    // 2. 兼容字符串格式
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
