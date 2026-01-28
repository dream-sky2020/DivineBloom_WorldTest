export const statHandler = (effect, target, actor, skill, context, silent) => {
    if (!target || !effect.stat) return 0;
    const { log } = context;

    const statName = effect.stat;
    const pct = Number(effect.value) || 0;

    if (typeof target[statName] === 'number') {
        const increase = Math.floor(target[statName] * pct);
        target[statName] += increase;
        if (!silent && log) log('battle.statBoost', { target: target.name, stat: statName, amount: increase });
        return increase;
    }
    return 0;
};
