import { EnemyEntity } from '../definitions/EnemyEntity'
import { PlayerEntity } from '../definitions/PlayerEntity'
import { NPCEntity } from '../definitions/NPCEntity'

export const EntitySerializer = {
    serialize(entity) {
        if (entity.type === 'enemy') {
            return EnemyEntity.serialize(entity)
        }

        if (entity.type === 'player') {
            return PlayerEntity.serialize(entity)
        }

        if (entity.type === 'npc') {
            return NPCEntity.serialize(entity)
        }

        return null
    }
}

