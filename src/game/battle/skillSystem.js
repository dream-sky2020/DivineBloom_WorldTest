// src/game/battle/skillSystem.js

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

