import { z } from 'zod';

// --- Visuals Schema Definitions ---

// 1. Sprite 类型 (最常用)
export const VisualSpriteSchema = z.object({
  type: z.literal('sprite').default('sprite'),
  id: z.string(), // 对应资源ID
  state: z.string().default('idle'), // 对应 initialState
  frameIndex: z.number().default(0),
  timer: z.number().default(0),
  scale: z.number().default(1)
});

// 2. Rect 类型 (调试/背景用)
export const VisualRectSchema = z.object({
  type: z.literal('rect').default('rect'),
  width: z.number().default(10),
  height: z.number().default(10),
  color: z.string().default('red')
});

// 3. Vision 类型 (附属组件)
export const VisualVisionSchema = z.object({
  type: z.literal('vision').default('vision')
});

// 4. Visual 组件总类型 (Union)
export const VisualComponentSchema = z.discriminatedUnion('type', [
  VisualSpriteSchema,
  VisualRectSchema,
  VisualVisionSchema
]);

// --- Visuals Factory ---

// Helper function: Fail-safe fallback data generator
// Used when Schema is unavailable or validation fails
function createFallbackSprite(id, scale, initialState) {
  return {
    type: 'sprite',
    id: id || 'error_missing_id',
    state: initialState || 'idle',
    frameIndex: 0,
    timer: 0,
    scale: (typeof scale === 'number') ? scale : 1
  };
}

function createFallbackRect(width, height, color) {
  return {
    type: 'rect',
    width: width || 10,
    height: height || 10,
    color: color || 'red'
  };
}

export const Visuals = {
  /**
   * 创建标准 Sprite 组件数据
   * 所有默认值由 Schema 定义 (Dumb Factory 模式)
   * @param {string} id - 资源ID
   * @param {number} [scale] - 缩放比例
   * @param {string} [initialState] - 初始状态
   */
  Sprite(id, scale, initialState) {
    // 1. 构造“意图”数据 (Raw Intent)
    const rawData = {
      id,
      scale,
      state: initialState
    };

    // 2. Safety Check (Now internal, so less likely to be missing)
    if (!VisualSpriteSchema) {
      console.warn(`[Visuals] VisualSpriteSchema undefined! Using fallback for id: ${id}`);
      return createFallbackSprite(id, scale, initialState);
    }

    // 3. Safe Parse (让 Schema 校验并应用默认值)
    const result = VisualSpriteSchema.safeParse(rawData);

    if (result.success) {
      return result.data;
    } else {
      console.error(`[Visuals] Sprite validation failed for id: ${id}`, result.error);
      return createFallbackSprite(id, scale, initialState);
    }
  },

  /**
   * 创建矩形组件数据 (用于背景/调试)
   * @param {number} width 
   * @param {number} height 
   * @param {string} color 
   */
  Rect(width, height, color) {
    const rawData = { width, height, color };

    if (!VisualRectSchema) {
      return createFallbackRect(width, height, color);
    }

    const result = VisualRectSchema.safeParse(rawData);

    if (result.success) {
      return result.data;
    } else {
      console.error(`[Visuals] Rect validation failed`, result.error);
      return createFallbackRect(width, height, color);
    }
  },

  /**
   * 创建视野指示器组件数据
   * @deprecated Vision rendering is now handled by AIVisionRenderSystem. Do not use.
   */
  Vision() {
    if (!VisualVisionSchema) {
      return { type: 'vision' };
    }

    const result = VisualVisionSchema.safeParse({});

    if (result.success) {
      return result.data;
    } else {
      return { type: 'vision' };
    }
  }
}
