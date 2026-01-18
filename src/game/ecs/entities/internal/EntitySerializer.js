import { EnemyEntity } from '../definitions/EnemyEntity'
import { PlayerEntity } from '../definitions/PlayerEntity'
import { NPCEntity } from '../definitions/NPCEntity'
import { PortalEntity } from '../definitions/PortalEntity'
import { GlobalEntity } from '../definitions/GlobalEntity'
import { DecorationEntity } from '../definitions/DecorationEntity'
import { ObstacleEntity } from '../definitions/ObstacleEntity'

export const EntitySerializer = {
    serialize(entity) {
        let data = null

        if (entity.type === 'enemy') {
            data = EnemyEntity.serialize(entity)
        } else if (entity.type === 'player') {
            data = PlayerEntity.serialize(entity)
        } else if (entity.type === 'npc') {
            data = NPCEntity.serialize(entity)
        } else if (entity.type === 'portal') {
            data = PortalEntity.serialize(entity)
        } else if (entity.type === 'global_manager') {
            data = GlobalEntity.serialize(entity)
        } else if (entity.type === 'decoration') {
            data = DecorationEntity.serialize(entity)
        } else if (entity.type === 'obstacle') {
            data = ObstacleEntity.serialize(entity)
        }

        if (data) {
            return {
                type: entity.type,
                data: data
            }
        }

        return null
    }
}

