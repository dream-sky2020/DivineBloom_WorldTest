import { z } from 'zod';
import { ID } from './common.js';

// --- 序列化后的实体快照 (Serialized Entity Snapshots) ---

// 对应 PlayerEntity.serialize()
export const SavedPlayerSchema = z.object({
    x: z.number(),
    y: z.number(),
    scale: z.number()
});

// 对应 EnemyEntity.serialize()
export const SavedEnemySchema = z.object({
    x: z.number(),
    y: z.number(),
    // 修正：battleGroup 是一个对象数组，每个对象包含 id
    battleGroup: z.array(z.object({ id: ID })),
    options: z.object({
        uuid: z.string(),
        isStunned: z.boolean(),
        stunnedTimer: z.number(),
        aiType: z.string(),
        visionRadius: z.number(),
        visionType: z.string(), // 保持 string 以兼容
        visionAngle: z.number(),
        visionProximity: z.number(),
        speed: z.number(),
        minYRatio: z.number().optional(),
        suspicionTime: z.number(),
        spriteId: z.string(),
        scale: z.number()
    })
});

// 对应 NPCEntity.serialize()
export const SavedNPCSchema = z.object({
    x: z.number(),
    y: z.number(),
    config: z.object({
        dialogueId: z.string(),
        range: z.number().optional(), // Match map schema updates
        spriteId: z.string(),
        scale: z.number()
    })
});

// 对应 PortalEntity.serialize()
export const SavedPortalSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    targetMapId: z.string(),
    targetEntryId: z.string()
});

// 对应 DecorationEntity.serialize()
export const SavedDecorationSchema = z.object({
    x: z.number(),
    y: z.number(),
    name: z.string().optional(),
    config: z.object({
        spriteId: z.string().optional(),
        scale: z.number().optional(),
        zIndex: z.number().optional(),
        rect: z.object({
            width: z.number(),
            height: z.number(),
            color: z.string()
        }).optional(),
        collider: z.object({
            type: z.string(),
            radius: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            rotation: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
            isStatic: z.boolean().optional()
        }).optional()
    }).optional()
});

// 对应 ObstacleEntity.serialize()
export const SavedObstacleSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    radius: z.number().optional(),
    p1: z.object({ x: z.number(), y: z.number() }).optional(),
    p2: z.object({ x: z.number(), y: z.number() }).optional(),
    rotation: z.number().optional(),
    shape: z.string()
});

/**
 * 包装后的实体存储项
 * 明确区分 type 和 data，解决 "各讲各的" 问题
 */
export const SavedEntityItemSchema = z.object({
    type: z.enum(['player', 'enemy', 'npc', 'portal', 'decoration', 'obstacle']),
    data: z.union([
        SavedPlayerSchema, 
        SavedEnemySchema, 
        SavedNPCSchema, 
        SavedPortalSchema,
        SavedDecorationSchema,
        SavedObstacleSchema
    ])
});

// --- 地图运行时状态 (Map Runtime State) ---
// 对应 worldStore.currentMapState
export const MapSaveStateSchema = z.object({
    isInitialized: z.boolean().optional(), // Add optional because sometimes we just save entities
    entities: z.array(SavedEntityItemSchema)
});
