export * from './common.js';
export * from './save.js';
export * from './effects.js';
export * from './config.js';

// Resource Schemas (Static Game Data)
export * from './resources/character.js';
export * from './resources/item.js';
export * from './resources/skill.js';
export * from './resources/status.js';
export * from './resources/map.js';

// Component Schemas (ECS Components)
// Re-export Schemas from component files to maintain backward compatibility for imports
export {
    VisualSpriteSchema,
    VisualRectSchema,
    VisualVisionSchema,
    VisualComponentSchema
} from '@/game/ecs/entities/components/Visuals.js';

export {
    DetectAreaSchema,
    TriggerRuleSchema,
    TriggerSchema,
    DetectInputSchema
} from '@/game/ecs/entities/components/Triggers.js';

export {
    PhysicsVelocitySchema,
    PhysicsBoundsSchema,
    ColliderSchema
} from '@/game/ecs/entities/components/Physics.js';

export {
    AIConfigSchema,
    AIStateSchema
} from '@/game/ecs/entities/components/AI.js';

export {
    ActionBattleSchema,
    ActionDialogueSchema,
    ActionTeleportSchema
} from '@/game/ecs/entities/components/Actions.js';

export {
    BattleResultSchema
} from '@/game/ecs/entities/components/BattleResult.js';


// Entity Definition Schemas
export {
    PortalEntitySchema
} from '@/game/ecs/entities/definitions/PortalEntity.js';

export {
    NPCEntitySchema
} from '@/game/ecs/entities/definitions/NPCEntity.js';

export {
    EnemyEntitySchema
} from '@/game/ecs/entities/definitions/EnemyEntity.js';

export {
    PlayerEntitySchema
} from '@/game/ecs/entities/definitions/PlayerEntity.js';

export {
    BackgroundGroundSchema
} from '@/game/ecs/entities/definitions/BackgroundEntity.js';

export {
    DecorationEntitySchema
} from '@/game/ecs/entities/definitions/DecorationEntity.js';

export {
    GlobalEntitySchema
} from '@/game/ecs/entities/definitions/GlobalEntity.js';

export {
    SceneConfigSchema
} from '@/game/ecs/entities/components/SceneConfig.js';

export {
    ObstacleEntitySchema
} from '@/game/ecs/entities/definitions/ObstacleEntity.js';