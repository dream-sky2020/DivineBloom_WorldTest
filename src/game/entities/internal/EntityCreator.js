import { PlayerEntity } from '../definitions/PlayerEntity'
import { EnemyEntity } from '../definitions/EnemyEntity'
import { NPCEntity } from '../definitions/NPCEntity'
import { PortalEntity } from '../definitions/PortalEntity'

export const EntityCreator = {
    createEnemy(data) {
        return EnemyEntity.create(data)
    },

    createPlayer(data) {
        return PlayerEntity.create(data)
    },

    createNPC(data) {
        return NPCEntity.create(data)
    },

    createPortal(data) {
        return PortalEntity.create(data)
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
