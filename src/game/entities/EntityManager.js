import { EntityCreator } from './internal/EntityCreator'
import { EntitySerializer } from './internal/EntitySerializer'

/**
 * 实体管理器 (Facade)
 * 统一管理实体的创建和序列化，外部只需调用此文件
 */
export const EntityManager = {
    // --- Creation ---
    create: EntityCreator.create.bind(EntityCreator),
    createPlayer: EntityCreator.createPlayer.bind(EntityCreator),
    createEnemy: EntityCreator.createEnemy.bind(EntityCreator),
    createNPC: EntityCreator.createNPC.bind(EntityCreator),
    createPortal: EntityCreator.createPortal.bind(EntityCreator),

    // --- Serialization ---
    serialize: EntitySerializer.serialize.bind(EntitySerializer)
}
