import { eventQueue } from '../world'

export const ActionSystem = {
    /**
     * Process events from the event queue
     * @param {object} callbacks - External callbacks (e.g. from Vue/Scene)
     * @param {Function} [callbacks.onEncounter]
     * @param {Function} [callbacks.onSwitchMap]
     * @param {Function} [callbacks.onInteract]
     */
    update(callbacks = {}) {
        const events = eventQueue.drain()

        for (const event of events) {
            switch (event.type) {
                case 'TRIGGER_BATTLE':
                    if (callbacks.onEncounter) {
                        const { battleGroup, uuid } = event.payload
                        callbacks.onEncounter(battleGroup, uuid)
                    }
                    break;

                case 'TRIGGER_MAP_SWITCH':
                    if (callbacks.onSwitchMap) {
                        const { targetMapId, targetEntryId } = event.payload
                        callbacks.onSwitchMap(targetMapId, targetEntryId)
                    }
                    break;

                case 'INTERACT_NPC':
                    if (callbacks.onInteract) {
                        const { interaction } = event.payload
                        callbacks.onInteract(interaction)
                    }
                    break;
            }
        }
    }
}
