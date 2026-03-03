import type { CameraLike, ViewportLike } from './RenderTypes';

/**
 * Check whether a world-space point intersects current camera viewport.
 */
export function isPointVisible(
    x: number,
    y: number,
    camera: CameraLike,
    viewport: ViewportLike,
    margin: number = 0
): boolean {
    return !(
        x < camera.x - margin ||
        x > camera.x + viewport.width + margin ||
        y < camera.y - margin ||
        y > camera.y + viewport.height + margin
    );
}

export function isCircleVisible(
    x: number,
    y: number,
    radius: number,
    camera: CameraLike,
    viewport: ViewportLike,
    margin: number = 0
): boolean {
    return !(
        x + radius < camera.x - margin ||
        x - radius > camera.x + viewport.width + margin ||
        y + radius < camera.y - margin ||
        y - radius > camera.y + viewport.height + margin
    );
}

export function isRectVisible(
    left: number,
    top: number,
    width: number,
    height: number,
    camera: CameraLike,
    viewport: ViewportLike,
    margin: number = 0
): boolean {
    const right = left + width;
    const bottom = top + height;
    return !(
        right < camera.x - margin ||
        left > camera.x + viewport.width + margin ||
        bottom < camera.y - margin ||
        top > camera.y + viewport.height + margin
    );
}
