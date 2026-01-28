import { itemsDb } from '@schema/items';
import * as TargetSystem from '../targetSystem';
import * as EffectSystem from '../effectSystem';

export const handleItemEffect = (itemId, targetId, actor, context) => {
    const item = itemsDb[itemId];
    if (!item || !item.effects) return;
    
    const { partySlots, enemies } = context;

    const targets = TargetSystem.resolveTargets({
        partySlots,
        enemies,
        actor,
        targetId
    }, item.targetType);

    targets.forEach(target => {
        item.effects.forEach(effect => {
            EffectSystem.processEffect(effect, target, actor, null, context);
        });
    });
};
