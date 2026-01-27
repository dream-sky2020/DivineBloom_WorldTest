import { z } from 'zod';

export const SpriteComponentSchema = z.object({
  id: z.string(), // 对应资源ID (e.g., 'hero', 'slime')
  scale: z.number().default(1),
  visible: z.boolean().default(true),
  
  // Color properties
  tint: z.string().optional(), // e.g., 'rgba(255,0,0,0.5)'
  opacity: z.number().min(0).max(1).default(1),
  brightness: z.number().default(1),
  contrast: z.number().default(1),
  
  // Offset properties
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  rotation: z.number().default(0), // 弧度
  flipX: z.boolean().default(false),
  flipY: z.boolean().default(false)
});

export const Sprite = {
  create(id, options = {}) {
    const rawData = { 
      id, 
      ...options 
    };
    const result = SpriteComponentSchema.safeParse(rawData);
    if (result.success) {
      return result.data;
    } else {
      console.error(`[Sprite] Validation failed for id: ${id}`, result.error);
      return { 
        id: id || 'error', 
        scale: 1, 
        visible: true,
        opacity: 1,
        brightness: 1,
        contrast: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        flipX: false,
        flipY: false
      };
    }
  }
};

/**
 * 精灵通用属性字段，用于编辑器 Inspector 面板
 */
export const SPRITE_INSPECTOR_FIELDS = [
    { path: 'sprite.visible', label: '显示精灵', type: 'checkbox', group: '精灵 (Sprite)' },
    { path: 'sprite.scale', label: '精灵缩放', type: 'number', props: { step: 0.1, min: 0 }, group: '精灵 (Sprite)' },
    { path: 'sprite.tint', label: '精灵颜色', type: 'color', group: '精灵 (Sprite)' },
    { path: 'sprite.opacity', label: '不透明度', type: 'number', props: { step: 0.1, min: 0, max: 1 }, group: '精灵 (Sprite)' },
    { path: 'sprite.brightness', label: '亮度', type: 'number', props: { step: 0.1, min: 0 }, group: '精灵 (Sprite)' },
    { path: 'sprite.contrast', label: '对比度', type: 'number', props: { step: 0.1, min: 0 }, group: '精灵 (Sprite)' },
    { path: 'sprite.offsetX', label: '偏移 X', type: 'number', group: '精灵 (Sprite)' },
    { path: 'sprite.offsetY', label: '偏移 Y', type: 'number', group: '精灵 (Sprite)' },
    { path: 'sprite.rotation', label: '旋转', type: 'number', tip: '弧度值', props: { step: 0.1 }, group: '精灵 (Sprite)' },
    { path: 'sprite.flipX', label: '水平翻转', type: 'checkbox', group: '精灵 (Sprite)' },
    { path: 'sprite.flipY', label: '垂直翻转', type: 'checkbox', group: '精灵 (Sprite)' }
];
