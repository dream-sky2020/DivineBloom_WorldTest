import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const aiSensorySchema = z.object({
  distSqToPlayer: z.number().default(Number.POSITIVE_INFINITY),
  playerPos: z.object({
    x: z.number().default(0),
    y: z.number().default(0)
  }).default({ x: 0, y: 0 }),
  hasPlayer: z.boolean().default(false),
  canSeePlayer: z.boolean().default(false),
  suspicion: z.number().default(0),
  senseTimer: z.number().default(0),
  lastBattleResult: z.any().nullable().default(null),
  bestPortal: z.any().nullable().default(null),
  nearbyObstacles: z.array(z.any()).default([])
});

export type AISensoryData = z.infer<typeof aiSensorySchema>;

export const AISensory: IComponentDefinition<typeof aiSensorySchema, AISensoryData> = {
  name: 'AISensory',
  schema: aiSensorySchema,
  create(data: Partial<AISensoryData> = {}) {
    return aiSensorySchema.parse(data);
  },
  serialize(component) {
    return {
      distSqToPlayer: component.distSqToPlayer,
      playerPos: component.playerPos,
      hasPlayer: component.hasPlayer,
      canSeePlayer: component.canSeePlayer,
      suspicion: component.suspicion,
      senseTimer: 0,
      lastBattleResult: null,
      bestPortal: component.bestPortal,
      nearbyObstacles: []
    };
  },
  deserialize(data) {
    return this.create(data);
  }
};

export const AISensorySchema = aiSensorySchema;
