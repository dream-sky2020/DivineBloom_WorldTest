import { world, eventQueue } from '../world'

// Query entities needed for interaction
const players = world.with('player', 'position')
const enemies = world.with('enemy', 'position', 'interaction')
const npcs = world.with('npc', 'position', 'interaction')

export const InteractionSystem = {
    /**
     * @param {object} params
     * @param {import('@/game/GameEngine').InputManager} [params.input]
     * @param {Function} [params.onEncounter] - Used as a flag to enable battle detection
     * @param {Function} [params.onSwitchMap] - Used as a flag to enable portal detection
     * @param {Function} [params.onInteract] - Used as a flag to enable interaction detection
     * @param {Function} [params.onProximity]
     * @param {Array} [params.portals]
     */
    update({ input, onEncounter, onSwitchMap, onInteract, onProximity, portals }) {
        // 1. Get Player
        let player = null
        for (const p of players) {
            player = p
            break
        }
        if (!player) return

        const pPos = player.position

        // 2. Check Portals (Map Switching)
        if (onSwitchMap && portals) {
            for (const portal of portals) {
                if (pPos.x >= portal.x && pPos.x <= portal.x + portal.w &&
                    pPos.y >= portal.y && pPos.y <= portal.y + portal.h) {

                    console.log('Portal Triggered!', portal)
                    eventQueue.emit('TRIGGER_MAP_SWITCH', {
                        targetMapId: portal.targetMapId,
                        targetEntryId: portal.targetEntryId
                    })
                    return
                }
            }
        }

        // 3. Check Encounters (Battle)
        if (onEncounter) {
            const detectionRadius = 40
            for (const enemy of enemies) {
                if (enemy.aiState && enemy.aiState.state === 'stunned') continue

                const dx = pPos.x - enemy.position.x
                const dy = pPos.y - enemy.position.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < detectionRadius) {
                    const { battleGroup, uuid } = enemy.interaction
                    eventQueue.emit('TRIGGER_BATTLE', { battleGroup, uuid })
                    return
                }
            }
        }

        // 4. Check NPC Interaction
        if (onInteract) {
            let nearestNPC = null
            let minDist = Infinity
            const defaultRange = 60

            for (const npc of npcs) {
                const range = npc.interaction.range || defaultRange
                const dx = pPos.x - npc.position.x
                const dy = pPos.y - npc.position.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist <= range) {
                    if (dist < minDist) {
                        minDist = dist
                        nearestNPC = npc
                    }
                }
            }

            // Proximity callback (for UI prompt)
            // Note: This is a continuous state update (UI hint), not a discrete event, 
            // so keeping it as a direct callback is often cleaner for "active/inactive" states.
            // But we could also emit a 'PROXIMITY_UPDATE' event every frame if we wanted to be strict.
            // For now, let's keep it direct or move it later.
            if (onProximity) {
                onProximity(nearestNPC ? nearestNPC.interaction : null)
            }

            // Interaction Trigger
            if (nearestNPC && input) {
                if (input.isDown('Space') || input.isDown('KeyE') || input.isDown('Enter')) {
                    eventQueue.emit('INTERACT_NPC', { interaction: nearestNPC.interaction })
                }
            }
        }
    }
}
