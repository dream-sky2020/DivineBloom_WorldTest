/**
 * 准备动作上下文（处理能量消耗与倍率）
 */
export const prepareActionContext = (actor, context) => {
    const { log } = context;
    let energyMult = 1.0;

    if (context.energyMult !== undefined) {
        energyMult = context.energyMult;
    } else if ((actor.energy || 0) > 0) {
        energyMult = 1.0 + (actor.energy * 0.5);
        if (log) log('battle.energyConsume', { name: actor.name, energy: actor.energy });
        actor.energy = 0;
    }

    return { ...context, energyMult };
};
