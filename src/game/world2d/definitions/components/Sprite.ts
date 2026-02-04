import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { SpriteMode } from '../enums/SpriteMode';

const spriteSchema = z.object({
  id: z.string(),
  mode: z.nativeEnum(SpriteMode).default(SpriteMode.TEXTURE),
  scale: z.number().default(1),
  visible: z.boolean().default(true),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  tileScale: z.number().default(1),
  tint: z.string().optional(),
  opacity: z.number().min(0).max(1).default(1),
  brightness: z.number().default(1),
  contrast: z.number().default(1),
  text: z.string().optional(),
  fontSize: z.number().default(16),
  fontFamily: z.string().default('Arial'),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  rotation: z.number().default(0),
  flipX: z.boolean().default(false),
  flipY: z.boolean().default(false)
});

export type SpriteData = z.infer<typeof spriteSchema>;

export const Sprite: IComponentDefinition<typeof spriteSchema, SpriteData> = {
  name: 'Sprite',
  schema: spriteSchema,
  create(id: string | Partial<SpriteData>, options: Partial<SpriteData> = {}) {
     let rawData: any;
     if (typeof id === 'string') {
         rawData = { id, ...options };
     } else {
         rawData = { ...id, ...options };
     }

     // 兼容性处理
     if (!rawData.mode && rawData.id === 'rect') {
         rawData.mode = SpriteMode.RECT;
     }
     
     // 如果 id 是 undefined（例如只传了 options），需要确保 id 存在，或者 schema 允许 optional id
     // 根据原始 schema, id 是必须的。如果用户直接传 { mode: 'rect', ... } 没有 id，会失败。
     // 原始 create(id, options) 强制 id。
     if (!rawData.id) rawData.id = 'unknown';

     return spriteSchema.parse(rawData);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data.id, data);
  },
  inspectorFields: [
    { path: 'sprite.mode', label: '渲染模式', type: 'select', options: Object.values(SpriteMode), group: '精灵 (Sprite)' },
    { path: 'sprite.visible', label: '显示精灵', type: 'checkbox', group: '精灵 (Sprite)' },
    { path: 'sprite.scale', label: '精灵缩放', type: 'number', props: { step: 0.1, min: 0 }, group: '精灵 (Sprite)' },
    { path: 'sprite.width', label: '宽度', type: 'number', props: { min: 0 }, group: '尺寸', visibleIf: 'sprite.mode !== "texture"' },
    { path: 'sprite.height', label: '高度', type: 'number', props: { min: 0 }, group: '尺寸', visibleIf: 'sprite.mode !== "texture" && sprite.mode !== "circle"' },
    { path: 'sprite.tileScale', label: '平铺缩放', type: 'number', props: { step: 0.1, min: 0.1 }, group: '精灵 (Sprite)', visibleIf: 'sprite.mode === "repeat"' },
    { path: 'sprite.radius', label: '半径', type: 'number', props: { min: 0 }, group: '尺寸', visibleIf: 'sprite.mode === "circle"' },
    { path: 'sprite.tint', label: '精灵颜色/色调', type: 'color', group: '精灵 (Sprite)' },
    { path: 'sprite.opacity', label: '不透明度', type: 'number', props: { step: 0.1, min: 0, max: 1 }, group: '精灵 (Sprite)' },
    { path: 'sprite.text', label: '文本内容', type: 'text', group: '文本', visibleIf: 'sprite.mode === "text"' },
    { path: 'sprite.fontSize', label: '字体大小', type: 'number', group: '文本', visibleIf: 'sprite.mode === "text"' },
    { path: 'sprite.offsetX', label: '偏移 X', type: 'number', group: '精灵 (Sprite)' },
    { path: 'sprite.offsetY', label: '偏移 Y', type: 'number', group: '精灵 (Sprite)' },
    { path: 'sprite.rotation', label: '旋转', type: 'number', tip: '弧度值', props: { step: 0.1 }, group: '精灵 (Sprite)' },
    { path: 'sprite.flipX', label: '水平翻转', type: 'checkbox', group: '精灵 (Sprite)' },
    { path: 'sprite.flipY', label: '垂直翻转', type: 'checkbox', group: '精灵 (Sprite)' }
  ]
};

export const SpriteSchema = spriteSchema;
export const SPRITE_INSPECTOR_FIELDS = Sprite.inspectorFields;
