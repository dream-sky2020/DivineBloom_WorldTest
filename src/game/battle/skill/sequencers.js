/**
 * 判断单位是否死亡
 */
const isDead = (u) => u && u.statusEffects && u.statusEffects.some(s => s.id === 'status_dead');

/**
 * 解析连锁技能 (Chain Skill) 的命中序列
 */
export const resolveChainSequence = (skill, initialTarget, allEnemies) => {
    const hits = [];
    const bounceCount = skill.chain || 0;
    const decay = skill.decay || 0.85;
    let multiplier = 1.0;

    const hitIds = new Set();
    let currentTarget = initialTarget;

    if (!currentTarget || isDead(currentTarget)) {
        currentTarget = allEnemies.find(e => !isDead(e));
    }

    for (let i = 0; i < bounceCount; i++) {
        if (!currentTarget) break;

        hitIds.add(currentTarget.uuid);
        hits.push({
            target: currentTarget,
            multiplier: multiplier,
            hitIndex: i + 1
        });

        multiplier *= decay;

        const candidates = allEnemies.filter(e =>
            !isDead(e) && !hitIds.has(e.uuid)
        );

        if (candidates.length === 0) break;
        currentTarget = candidates[Math.floor(Math.random() * candidates.length)];
    }

    return hits;
};

/**
 * 解析随机多次攻击序列 (Random Sequence)
 */
export const resolveRandomSequence = (skill, allEnemies) => {
    const hits = [];
    const count = skill.randomHits || 1;

    for (let i = 0; i < count; i++) {
        const candidates = allEnemies.filter(e => !isDead(e));
        if (candidates.length === 0) break;

        const target = candidates[Math.floor(Math.random() * candidates.length)];
        hits.push({
            target: target,
            hitIndex: i + 1
        });
    }
    return hits;
};
