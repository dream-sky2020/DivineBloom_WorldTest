import type { XY, SpriteLike } from '@world2d/render/core/RenderTypes';

export type WithTransform = { transform: XY };

export type WithSpriteOrVisual = {
    sprite?: SpriteLike;
    visual?: SpriteLike;
};

export type WithAIState = {
    aiState: {
        state: string;
        suspicion?: number;
        facing: XY;
        moveDir?: XY;
        [key: string]: unknown;
    };
};

export type WithShape = {
    shape: {
        type: string;
        offsetX?: number;
        offsetY?: number;
        width?: number;
        height?: number;
        rotation?: number;
        radius?: number;
        p1?: XY;
        p2?: XY;
    };
};

export function hasTransform(entity: unknown): entity is WithTransform {
    if (!entity || typeof entity !== 'object') return false;
    const value = entity as { transform?: Partial<XY> };
    return typeof value.transform?.x === 'number' && typeof value.transform?.y === 'number';
}
