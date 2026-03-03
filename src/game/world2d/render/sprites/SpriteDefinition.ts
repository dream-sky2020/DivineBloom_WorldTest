export interface SpriteDefinition {
    imageId: string;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    ax: number;
    ay: number;
}

export interface Point {
    x: number;
    y: number;
}

/**
 * 精灵定义（支持裁切 + 锚点）
 */
export function makeSprite({
    imageId,
    sx = 0, sy = 0, sw = 0, sh = 0,
    ax = 0.5, ay = 1.0, // anchor 默认脚底（中下）
}: Partial<SpriteDefinition> & { imageId: string }): SpriteDefinition {
    return { imageId, sx, sy, sw, sh, ax, ay };
}
