import type { AssetManager } from '../../resources/AssetManager';
import type { Point, SpriteDefinition } from '../sprites';

export type XY = {
    x: number;
    y: number;
};

export type ViewportLike = {
    width: number;
    height: number;
};

export type CameraLike = XY;

export type RendererLike = {
    ctx: CanvasRenderingContext2D;
    camera: CameraLike;
    width: number;
    height: number;
};

export type AssetManagerLike = AssetManager;

export type RenderDeviceLike = {
    ctx: CanvasRenderingContext2D;
    camera: CameraLike;
    width: number;
    height: number;
    assetManager: AssetManagerLike;
    drawSprite(
        imgOrId: HTMLImageElement | HTMLCanvasElement | string,
        spr: SpriteDefinition,
        pos: Point,
        scale?: number
    ): void;
};

export type CameraControllerLike = {
    setCamera(x: number, y: number): void;
};

export type RenderContext = RenderDeviceLike;

export type TransformLike = XY;

export type SpriteLike = {
    mode?: string;
    visible?: boolean;
    opacity?: number;
    offsetX?: number;
    offsetY?: number;
    width?: number;
    height?: number;
    radius?: number;
    rotation?: number;
    tint?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: CanvasTextAlign;
    id?: string;
    scale?: number;
    tileScale?: number;
};

export type WorldRectLike = {
    x: number;
    y: number;
    w: number;
    h: number;
};
