import { world } from '../world'

// Query entities needed for interaction
// Note: miniplex queries are live, so we define them once
const players = world.with('player', 'position')
const enemies = world.with('enemy', 'position', 'interaction')

export const InteractionSystem = {
    /**
     * @param {object} params
     * @param {Function} [params.onEncounter]
     * @param {Function} [params.onSwitchMap]
     * @param {Array} [params.portals]
     */
    update({ onEncounter, onSwitchMap, portals }) {
        // 1. Get Player (Assume Single Player for now)
        let player = null
        for (const p of players) {
            player = p
            break
        }
        if (!player) return

        const pPos = player.position

        // 2. Check Portals (Map Switching)
        if (onSwitchMap && portals) {
            // Simple AABB Collision
            // Optimization: Could use spatial hash if many portals, but usually < 5
            for (const portal of portals) {
                if (pPos.x >= portal.x && pPos.x <= portal.x + portal.w &&
                    pPos.y >= portal.y && pPos.y <= portal.y + portal.h) {

                    console.log('Portal Triggered!', portal)
                    onSwitchMap(portal.targetMapId, portal.targetEntryId)
                    return // Trigger only one event per frame
                }
            }
        }

        // 3. Check Encounters (Battle)
        if (onEncounter) {
            const detectionRadius = 40 // Hit box distance

            for (const enemy of enemies) {
                // Skip stunned enemies
                if (enemy.aiState && enemy.aiState.state === 'stunned') continue

                const dx = pPos.x - enemy.position.x
                const dy = pPos.y - enemy.position.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < detectionRadius) {
                    console.log('Encounter triggered!')
                    // Read battle data from component
                    const { battleGroup, uuid } = enemy.interaction
                    onEncounter(battleGroup, uuid)
                    return // Trigger only one battle at a time
                }
            }
        }
    }
}

