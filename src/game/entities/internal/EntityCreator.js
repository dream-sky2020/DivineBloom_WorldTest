import { PlayerFactory } from './factories/PlayerFactory'
import { EnemyFactory } from './factories/EnemyFactory'
import { NPCFactory } from './factories/NPCFactory'
import { PortalFactory } from './factories/PortalFactory'

export const EntityCreator = {
    createEnemy(data) {
        return EnemyFactory.create(data)
    },

    createPlayer(data) {
        return PlayerFactory.create(data)
    },

    createNPC(data) {
        return NPCFactory.create(data)
    },

    createPortal(data) {
        return PortalFactory.create(data)
    },

    create(engine, type, data, context = {}) {
        if (type === 'enemy') return this.createEnemy(data)

        if (type === 'player') {
            return this.createPlayer({
                x: data.x,
                y: data.y,
                scale: data.scale
            })
        }

        if (type === 'npc') {
            return this.createNPC({
                x: data.x,
                y: data.y,
                config: data.config || {}
            })
        }

        if (type === 'portal') {
            return this.createPortal(data)
        }
    }
}
