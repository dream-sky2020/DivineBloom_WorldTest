import { world } from '../world'

// Query entities needed for interaction
const players = world.with('player', 'position')
const enemies = world.with('enemy', 'position', 'interaction')
const npcs = world.with('npc', 'position', 'interaction')

export const InteractionSystem = {
    /**
     * @param {object} params
     * @param {import('@/game/GameEngine').InputManager} [params.input]
     * @param {Function} [params.onEncounter]
     * @param {Function} [params.onSwitchMap]
     * @param {Function} [params.onInteract]
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
                    onSwitchMap(portal.targetMapId, portal.targetEntryId)
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
                    onEncounter(battleGroup, uuid)
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
            if (onProximity) {
                onProximity(nearestNPC ? nearestNPC.interaction : null)
            }

            // Interaction Trigger
            if (nearestNPC && input) {
                // Check keys with simple debounce or justPressed check
                // Since we don't have isJustPressed implemented in InputManager yet, 
                // we rely on the game loop stopping (gameEngine.stop()) immediately after interaction to prevent multi-trigger
                if (input.isDown('Space') || input.isDown('KeyE') || input.isDown('Enter')) {
                    onInteract(nearestNPC.interaction)
                }
            }
        }
    }
}
