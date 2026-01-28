/**
 * 检查并执行前排补位
 */
export const handleAutoSwitch = (target, context, silent) => {
    const { log, performSwitch, partySlots } = context;
    if (!performSwitch || !partySlots) return;

    const isDead = target.statusEffects && target.statusEffects.some(s => s.id === 'status_dead');
    if (!isDead) return;

    const slotIndex = partySlots.findIndex(slot => slot.front && slot.front.id === target.id);
    if (slotIndex === -1) return;

    const slot = partySlots[slotIndex];
    const backupAlive = slot.back && !slot.back.statusEffects?.some(s => s.id === 'status_dead');

    if (backupAlive) {
        if (!silent && log) log('battle.fell', { target: target.name, backup: slot.back.name });
        performSwitch(slotIndex);
    }
};
