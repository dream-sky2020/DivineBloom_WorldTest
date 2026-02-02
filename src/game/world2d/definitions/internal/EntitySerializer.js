import { 
    EnemyEntity, 
    PlayerEntity, 
    NPCEntity, 
    PortalEntity, 
    PortalDestinationEntity, 
    GlobalEntity, 
    DecorationEntity, 
    ObstacleEntity 
} from '@entities'

// 临时实体类型列表（不应该被保存到场景文件中）
const TEMPORARY_ENTITY_TYPES = [
    'bullet',      // 子弹
    'particle',    // 粒子效果
    'vfx',         // 视觉特效
    // 可以根据需要添加更多临时实体类型
]

export const EntitySerializer = {
    serialize(entity) {
        // 过滤掉临时实体（如子弹、粒子等）
        if (TEMPORARY_ENTITY_TYPES.includes(entity.type)) {
            return null
        }
        
        let data = null

        if (entity.type === 'enemy') {
            data = EnemyEntity.serialize(entity)
        } else if (entity.type === 'player') {
            data = PlayerEntity.serialize(entity)
        } else if (entity.type === 'npc') {
            data = NPCEntity.serialize(entity)
        } else if (entity.type === 'portal') {
            data = PortalEntity.serialize(entity)
        } else if (entity.type === 'portal_destination') {
            data = PortalDestinationEntity.serialize(entity)
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

