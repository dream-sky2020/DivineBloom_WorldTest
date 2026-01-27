import { z } from 'zod';

/**
 * 动画组件 (状态存储)
 * 不再存储具体的帧数据，只存储播放状态
 */
export const AnimationComponentSchema = z.object({
  currentState: z.string().default('idle'),
  frameIndex: z.number().default(0),
  timer: z.number().default(0),
  speedMultiplier: z.number().default(1),
  paused: z.boolean().default(false),
  
  // 用于追踪 sprite.id 的变化，实现自动重置
  lastSyncedId: z.string().optional()
});

export const Animation = {
  create(initialState = 'idle') {
    const result = AnimationComponentSchema.safeParse({ currentState: initialState });
    return result.success ? result.data : {
      currentState: initialState,
      frameIndex: 0,
      timer: 0,
      speedMultiplier: 1,
      paused: false
    };
  }
};
