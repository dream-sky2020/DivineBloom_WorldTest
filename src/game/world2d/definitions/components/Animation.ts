import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const animationSchema = z.object({
  currentState: z.string().default('idle'),
  frameIndex: z.number().default(0),
  timer: z.number().default(0),
  speedMultiplier: z.number().default(1),
  paused: z.boolean().default(false),
  lastSyncedId: z.string().optional()
});

export type AnimationData = z.infer<typeof animationSchema>;

export const Animation: IComponentDefinition<typeof animationSchema, AnimationData> = {
  name: 'Animation',
  schema: animationSchema,
  create(data: string | Partial<AnimationData> = 'idle') {
    const input = typeof data === 'string' ? { currentState: data } : data;
    return animationSchema.parse(input);
  },
  serialize(component) {
    return {
        currentState: component.currentState,
        frameIndex: component.frameIndex,
        timer: component.timer,
        speedMultiplier: component.speedMultiplier,
        paused: component.paused,
        lastSyncedId: component.lastSyncedId
    };
  },
  deserialize(data) {
     if (typeof data === 'string') return this.create(data);
     return this.create(data);
  }
};

export const AnimationSchema = animationSchema;
