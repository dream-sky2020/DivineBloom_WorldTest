import { z } from 'zod';

// --- Triggers Schema Definitions ---

// 1. DetectArea (探测区域)
export const DetectAreaSchema = z.object({
  // System uses 'aabb'
  shape: z.enum(['circle', 'rect', 'aabb']).default('circle'),
  radius: z.number().default(0), // for circle
  // System uses 'size.w' and 'size.h'
  size: z.object({
    w: z.number().default(0),
    h: z.number().default(0)
  }).default({ w: 0, h: 0 }),
  // Ensure offset defaults to {0,0} if missing
  offset: z.object({
    x: z.number().default(0),
    y: z.number().default(0)
  }).default({ x: 0, y: 0 }),

  target: z.union([z.string(), z.array(z.string())]).default('detectable'), // 现在指向 entity.tags 中的标签
  includeTags: z.array(z.string()).default([]),
  excludeTags: z.array(z.string()).default(['ghost']),

  // [NEW] 自定义调试颜色
  debugColor: z.string().optional(),

  // Runtime state (initially empty)
  results: z.array(z.any()).default([])
});

// 2. Trigger (通用触发器)
export const TriggerRuleSchema = z.object({
  type: z.enum(['onEnter', 'onLeave', 'onPress', 'onSight', 'onStay']),
  // Optional flags default to false/undefined logic in System, but let's be explicit where helpful
  requireArea: z.boolean().default(false),
  requireInput: z.boolean().default(false),
  requireEnterOnly: z.boolean().default(false),

  // [NEW] Condition check
  // 'none': 无额外条件
  // 'notStunned': 要求实体未处于晕眩状态 (需要 aiState)
  condition: z.enum(['none', 'notStunned']).default('none')
});

export const TriggerSchema = z.object({
  rules: z.array(TriggerRuleSchema).default([]),
  actions: z.array(z.string()).default([]), // Action IDs e.g. 'BATTLE', 'DIALOGUE'

  // Flattened State Properties
  active: z.boolean().default(true),
  triggered: z.boolean().default(false),
  defaultCooldown: z.number().default(0.5), // 新增：默认冷却时间
  cooldownTimer: z.number().default(0),
  oneShot: z.boolean().default(false),
  oneShotExecuted: z.boolean().default(false),
  wasInside: z.boolean().default(false)
});

// 3. DetectInput (输入检测)
export const DetectInputSchema = z.object({
  keys: z.array(z.string()).default(['Interact']),
  isPressed: z.boolean().default(false),
  justPressed: z.boolean().default(false)
});

// 4. Detectable (被探测组件)
export const DetectableSchema = z.object({
  labels: z.array(z.string()).default([]),
  shape: z.enum(['point', 'circle', 'aabb']).default('point') // 目前默认仅支持点探测
});

// --- Triggers Factory ---

/**
 * Component Factories for Detection and Triggers
 * Pattern: Schema-Driven (Default values handled by Schema)
 */

export const Detectable = (labels = [], shape = 'point') => {
  const config = Array.isArray(labels) ? { labels, shape } : { labels: [labels], shape };
  const result = DetectableSchema.safeParse(config);
  return result.success ? result.data : { labels: [], shape: 'point' };
}

export const DetectArea = (config = {}) => {
  if (!DetectAreaSchema) {
    console.warn('[DetectArea] Schema undefined, using fallback');
    return {
      shape: 'circle',
      radius: 0,
      size: { w: 0, h: 0 },
      offset: { x: 0, y: 0 },
      results: [],
      target: 'actors',
      includeTags: ['player'],
      excludeTags: ['ghost']
    };
  }

  const result = DetectAreaSchema.safeParse(config);

  if (result.success) {
    return result.data;
  } else {
    console.error('[DetectArea] Schema validation failed', result.error);
    // Fallback: ensure minimal valid structure
    return {
      shape: 'circle',
      radius: 0,
      size: { w: 0, h: 0 },
      offset: { x: 0, y: 0 },
      results: [],
      target: 'actors',
      includeTags: ['player'],
      excludeTags: ['ghost']
    };
  }
}

export const DetectInput = (config = {}) => {
  if (!DetectInputSchema) {
    return { keys: ['Interact'], isPressed: false, justPressed: false };
  }

  const result = DetectInputSchema.safeParse(config);

  if (result.success) {
    return result.data;
  } else {
    console.error('[DetectInput] Schema validation failed', result.error);
    // Fallback based on schema defaults
    return {
      keys: ['Interact'],
      isPressed: false,
      justPressed: false
    };
  }
}

export const Trigger = (config = {}) => {
  if (!TriggerSchema) {
    return { rules: [], actions: [], active: true, triggered: false, cooldownTimer: 0 };
  }

  const result = TriggerSchema.safeParse(config);

  if (result.success) {
    return result.data;
  } else {
    console.error('[Trigger] Schema validation failed', result.error);
    // Fallback: Safe empty trigger
    return {
      rules: [],
      actions: [],
      active: true,
      triggered: false,
      cooldownTimer: 0,
      oneShot: false,
      oneShotExecuted: false,
      wasInside: false
    };
  }
}
