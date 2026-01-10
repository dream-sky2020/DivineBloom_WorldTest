import { z } from 'zod';
import { ID, LocalizedStringSchema } from './common.js';

// --- 状态 (Status) Schema ---

const StatusEffectSchema = z.object({
    trigger: z.string(), // "turnStart", "passive", "checkAction"
    type: z.string(), // "damage", "statMod", "stun", "heal"
    value: z.number().optional(),
    scaling: z.string().optional(),
    stat: z.string().optional(), // for statMod
    chance: z.number().optional()
});

export const StatusSchema = z.object({
    id: ID,
    name: LocalizedStringSchema,
    type: z.string(), // "statusTypes.buff"
    icon: z.string().optional(),
    subText: LocalizedStringSchema.optional(),
    description: LocalizedStringSchema.optional(),
    effects: z.array(StatusEffectSchema).optional().default([])
});

