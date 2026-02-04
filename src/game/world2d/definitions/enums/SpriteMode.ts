/**
 * 精灵渲染模式枚举
 */
export enum SpriteMode {
  TEXTURE = 'texture',     // 纹理图片 (默认)
  RECT = 'rect',           // 纯色矩形
  CIRCLE = 'circle',       // 纯色圆形
  NINE_SLICE = 'nine_slice', // 九宫格拉伸图片
  TEXT = 'text',           // 文本渲染
  REPEAT = 'repeat'        // 图片无限平铺 (Tiling)
}
