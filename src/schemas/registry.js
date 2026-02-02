/**
 * Schema 注册表 (Zod Definitions Registry)
 * 用于统一导出所有的 Zod Schema 定义，供业务逻辑和 ECS 组件校验使用。
 * 注意：此处仅导出定义，不包含具体的数据库实例。
 */

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
export * from './resources/tag.js';

// Component Schemas (ECS Components)
export {
    SpriteSchema
} from '@components';

export {
    AnimationSchema
} from '@components';

export {
    DetectAreaSchema,
    TriggerRuleSchema,
    TriggerSchema,
    DetectInputSchema
} from '@components';

export {
    VelocitySchema,
    BoundsSchema,
    ColliderSchema
} from '@components';

export {
    AIConfigSchema,
    AIStateSchema
} from '@components';

export {
    ActionsBattleSchema,
    ActionsDialogueSchema,
    ActionsTeleportSchema
} from '@components';

// 暂时禁用，等待战斗系统实现
// export {
//     BattleResultSchema
// } from '@components';

// Entity Definition Schemas
export {
    PortalEntitySchema
} from '@entities';

export {
    NPCEntitySchema
} from '@entities';

export {
    EnemyEntitySchema
} from '@entities';

export {
    PlayerEntitySchema
} from '@entities';

export {
    BackgroundGroundSchema
} from '@entities';

export {
    DecorationEntitySchema
} from '@entities';

export {
    GlobalEntitySchema
} from '@entities';

export {
    SceneConfigSchema
} from '@components';

export {
    ObstacleEntitySchema
} from '@entities';
