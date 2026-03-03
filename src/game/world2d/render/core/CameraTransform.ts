import type { CameraLike, XY } from './RenderTypes';

/**
 * Convert world-space position to screen-space by camera offset.
 */
export function worldToScreen(pos: XY, camera: CameraLike): XY {
    return {
        x: pos.x - camera.x,
        y: pos.y - camera.y
    };
}

/**
 * Convert screen-space position to world-space by camera offset.
 */
export function screenToWorld(pos: XY, camera: CameraLike): XY {
    return {
        x: pos.x + camera.x,
        y: pos.y + camera.y
    };
}

export function worldToScreenXY(x: number, y: number, camera: CameraLike): XY {
    return {
        x: x - camera.x,
        y: y - camera.y
    };
}
