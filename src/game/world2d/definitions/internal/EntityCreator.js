import { 
    PlayerEntity, 
    EnemyEntity, 
    NPCEntity, 
    PortalEntity, 
    PortalDestinationEntity, 
    GlobalEntity, 
    DecorationEntity, 
    ObstacleEntity 
} from '@entities'

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

    createPortalDestination(data) {
        return PortalDestinationEntity.create(data)
    },

    createGlobalManager(data) {
        return GlobalEntity.create(data)
    },

    createDecoration(data) {
        return DecorationEntity.create(data)
    },

    createObstacle(data) {
        return ObstacleEntity.create(data)
    },

    create(engine, type, data, context = {}) {
        if (type === 'enemy') return this.createEnemy(data)

        if (type === 'player') {
            return this.createPlayer({
                x: data.x,
                y: data.y,
                name: data.name,
                scale: data.scale,
                weaponConfig: data.weaponConfig // 传递武器配置
            })
        }

        if (type === 'npc') {
            return this.createNPC({
                x: data.x,
                y: data.y,
                name: data.name,
                config: data.config || {}
            })
        }

        if (type === 'portal') {
            return this.createPortal(data)
        }

        if (type === 'portal_destination') {
            return this.createPortalDestination(data)
        }

        if (type === 'global_manager') {
            return this.createGlobalManager(data)
        }

        if (type === 'decoration') {
            return this.createDecoration(data)
        }

        if (type === 'obstacle') {
            return this.createObstacle(data)
        }
    }
}
