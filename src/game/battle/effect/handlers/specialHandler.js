export const specialHandler = (effect, target, actor, skill, context, silent) => {
    const { log, partySlots } = context;

    if (effect.type === 'fullRestore') {
        if (partySlots) {
            partySlots.forEach(slot => {
                ['front', 'back'].forEach(pos => {
                    if (slot[pos]) {
                        slot[pos].currentHp = slot[pos].maxHp;
                        slot[pos].currentMp = slot[pos].maxMp;
                        slot[pos].statusEffects = [];
                    }
                });
            });
            if (!silent && log) log('battle.partyRestored');
            return 1;
        }
    }
    return 0;
};
