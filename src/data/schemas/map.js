import { z } from 'zod';
import { ID } from './common.js';

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
});

const SpawnerSchema = z.object({
    enemyIds: z.array(ID),
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
    name: z.string().optional(), // Made optional to support village.js
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
    targetMapId: z.string(),
    targetEntryId: z.string()
});

const DecorationSchema = z.object({
    type: z.enum(['rect']), // 目前代码只处理 'rect'
    color: z.string(),
    x: z.number(),
    y: z.number().optional(), // 与 yRatio 二选一
    yRatio: z.number().optional(),
    width: z.number(),
    height: z.number()
});

export const MapSchema = z.object({
    id: z.string(),
    name: z.string(),
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
        groundColor: z.string(),
        decorations: z.array(DecorationSchema).optional()
    }),

    // 实体生成
    spawners: z.array(SpawnerSchema).optional().default([]),
    npcs: z.array(NpcSpawnSchema).optional().default([]),
    portals: z.array(PortalSpawnSchema).optional().default([]),

    spawnPoint: z.object({ x: z.number(), y: z.number() }).optional()
});
