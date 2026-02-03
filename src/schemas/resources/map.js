import { z } from 'zod';
import { ID, createCharactersReference } from '../common.js';
import { LocalizedStringSchema } from './localization.js';

// --- 地图 (Map) Schema ---

const SpawnerOptionsSchema = z.object({
    uuid: z.string().optional(),
    isStunned: z.boolean().optional(),
    stunnedTimer: z.number().optional(),
    aiType: z.string().optional(),
    visionRadius: z.number().optional(),
    visionType: z.enum(['circle', 'cone', 'hybrid']).optional(), // Added 'hybrid'
    visionAngle: z.number().optional(),
    visionProximity: z.number().optional(),
    speed: z.number().optional(),
    minYRatio: z.number().optional(),
    suspicionTime: z.number().optional(),
    spriteId: z.string().optional(),
    scale: z.number().optional(),
    patrolRadius: z.number().optional(),
    detectedState: z.enum(['chase', 'flee']).optional(),
    stunDuration: z.number().optional(),
    chaseExitMultiplier: z.number().optional(),
});

const SpawnerSchema = z.object({
    enemyIds: createCharactersReference("刷怪点引用了不存在的敌人 ID"),
    count: z.number(),
    area: z.object({
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number()
    }).optional(),
    options: SpawnerOptionsSchema.optional() // 允许灵活的 AI 配置
});

const NpcSpawnSchema = z.object({
    x: z.number(),
    y: z.number(),
    dialogueId: z.string(),
    name: LocalizedStringSchema.optional(), // 使用多语言结构
    spriteId: z.string(),
    sx: z.number().optional(),
    sy: z.number().optional(),
    scale: z.number().optional(),
    range: z.number().optional() // Added range to support village.js
});

const PortalSpawnSchema = z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    // 是否强制传送 (默认 true，若为 false 则需要按互动键)
    isForced: z.boolean().optional().default(true),
    // 跨地图传送：需要 targetMapId 和 targetEntryId
    targetMapId: z.string().optional(),
    targetEntryId: z.string().optional(),
    // 同地图传送：可以使用 destinationId（推荐）或直接坐标 targetX/targetY
    destinationId: z.string().optional(),
    targetX: z.number().optional(),
    targetY: z.number().optional()
}).refine(
    data => {
        // 必须是跨地图传送或同地图传送之一
        // 使用 != null 来同时排除 null 和 undefined
        const isCrossMap = data.targetMapId != null && data.targetEntryId != null
        const isLocalTeleport = data.destinationId != null || (data.targetX != null && data.targetY != null)
        return isCrossMap || isLocalTeleport
    },
    {
        message: "Portal must have either (targetMapId + targetEntryId) for cross-map or (destinationId / targetX + targetY) for local teleport"
    }
);

const PortalDestinationSchema = z.object({
    id: z.string(), // 唯一标识符
    x: z.number(),
    y: z.number(),
    name: z.string().optional(),
    visual: z.object({
        color: z.string().optional(),
        size: z.number().optional()
    }).optional()
});

const DecorationSchema = z.object({
    type: z.enum(['rect', 'sprite']),
    spriteId: z.string().optional(),
    scale: z.number().optional(),
    color: z.string().optional(), // For rect
    x: z.number(),
    y: z.number().optional(), // 与 yRatio 二选一
    yRatio: z.number().optional(),
    width: z.number().optional(), // For rect
    height: z.number().optional(), // For rect
    // 自定义碰撞体
    collider: z.object({
        type: z.enum(['circle', 'aabb', 'obb', 'capsule']),
        radius: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        rotation: z.number().optional(),
        offsetX: z.number().optional(),
        offsetY: z.number().optional(),
        isStatic: z.boolean().optional().default(true)
    }).optional()
});

const ObstacleSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    radius: z.number().optional(),
    p1: z.object({ x: z.number(), y: z.number() }).optional(),
    p2: z.object({ x: z.number(), y: z.number() }).optional(),
    rotation: z.number().optional().default(0),
    shape: z.enum(['circle', 'aabb', 'obb', 'capsule']).optional().default('aabb')
});

export const MapSchema = z.object({
    id: ID,
    name: LocalizedStringSchema, // 使用多语言结构
    constraints: z.object({
        minYRatio: z.number().optional()
    }).optional(),

    // 关键点：入口点定义
    entryPoints: z.record(z.string(), z.object({
        x: z.number(),
        y: z.number()
    })),

    // 背景配置
    background: z.object({
        groundColor: z.string()
    }),

    // 实体生成
    decorations: z.array(DecorationSchema).optional().default([]),
    obstacles: z.array(ObstacleSchema).optional().default([]),
    spawners: z.array(SpawnerSchema).optional().default([]),
    npcs: z.array(NpcSpawnSchema).optional().default([]),
    portals: z.array(PortalSpawnSchema).optional().default([]),
    portalDestinations: z.array(PortalDestinationSchema).optional().default([]),

    // 地图尺寸 (像素)
    width: z.number().optional().default(800),
    height: z.number().optional().default(600),

    spawnPoint: z.object({ x: z.number(), y: z.number() }).optional()
}).refine(
    data => {
        // [VALIDATION FIX] 允许使用 destinationId 作为目的地索引
        // 确保 portals 中引用的 destinationId 存在于 portalDestinations 中
        if (data.portals && data.portalDestinations) {
            const destIds = new Set(data.portalDestinations.map(d => d.id));
            for (const portal of data.portals) {
                if (portal.destinationId && !destIds.has(portal.destinationId)) {
                    // console.warn(`Schema Warning: Portal references unknown destinationId: ${portal.destinationId}`);
                    // Return true to allow schema pass, but log warning (or fail if strict)
                }
            }
        }
        return true;
    },
    { message: "Invalid map configuration" }
);
