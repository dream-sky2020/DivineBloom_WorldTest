import type { AssetManager } from '../../resources/AssetManager';
import { PrimitiveDrawer, SpriteDrawer } from '../draw';
import type { Point, SpriteDefinition } from '../sprites';

/**
 * 统一绘制设备（Canvas2D）
 */
export class CanvasRenderDevice {
    ctx: CanvasRenderingContext2D;
    assetManager: AssetManager;
    camera: Point;
    clearColor: string;
    width: number;
    height: number;

    private readonly spriteDrawer: SpriteDrawer;
    private readonly primitiveDrawer: PrimitiveDrawer;

    constructor(ctx: CanvasRenderingContext2D, assetManager: AssetManager) {
        this.ctx = ctx;
        this.assetManager = assetManager;
        this.camera = { x: 0, y: 0 };
        this.clearColor = '#dbeafe';
        this.width = 0;
        this.height = 0;

        this.spriteDrawer = new SpriteDrawer(this);
        this.primitiveDrawer = new PrimitiveDrawer(this);
    }

    setCamera(x: number, y: number) {
        this.camera.x = x;
        this.camera.y = y;
    }

    begin(w: number, h: number) {
        this.width = w;
        this.height = h;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = this.clearColor;
        ctx.fillRect(0, 0, w, h);

        // 启用高质量图像平滑，减少缩放时的毛刺感
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }

    drawSprite(
        imgOrId: HTMLImageElement | HTMLCanvasElement | string,
        spr: SpriteDefinition,
        pos: Point,
        scale: number = 1
    ) {
        this.spriteDrawer.drawSprite(imgOrId, spr, pos, scale);
    }

    drawCircle(x: number, y: number, r: number, color: string) {
        this.primitiveDrawer.drawCircle(x, y, r, color);
    }

    drawRect(x: number, y: number, w: number, h: number, color: string) {
        this.primitiveDrawer.drawRect(x, y, w, h, color);
    }

    drawText(
        text: string,
        x: number,
        y: number,
        font: string = '12px Arial',
        color: string = '#ffffff',
        align: CanvasTextAlign = 'center'
    ) {
        this.primitiveDrawer.drawText(text, x, y, font, color, align);
    }

    drawLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string = '#ffffff',
        width: number = 1,
        dash: number[] = []
    ) {
        this.primitiveDrawer.drawLine(x1, y1, x2, y2, color, width, dash);
    }
}
