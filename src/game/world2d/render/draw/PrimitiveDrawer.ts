import type { Point } from '../sprites';

type PrimitiveRenderDevice = {
    ctx: CanvasRenderingContext2D;
    camera: Point;
};

/**
 * 负责基础图元绘制
 */
export class PrimitiveDrawer {
    private readonly device: PrimitiveRenderDevice;

    constructor(device: PrimitiveRenderDevice) {
        this.device = device;
    }

    drawCircle(x: number, y: number, r: number, color: string) {
        const ctx = this.device.ctx;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x - this.device.camera.x, y - this.device.camera.y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRect(x: number, y: number, w: number, h: number, color: string) {
        const ctx = this.device.ctx;
        ctx.fillStyle = color;
        ctx.fillRect(x - this.device.camera.x, y - this.device.camera.y, w, h);
    }

    drawText(
        text: string,
        x: number,
        y: number,
        font: string = '12px Arial',
        color: string = '#ffffff',
        align: CanvasTextAlign = 'center'
    ) {
        const ctx = this.device.ctx;
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, x - this.device.camera.x, y - this.device.camera.y);
        ctx.restore();
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
        const ctx = this.device.ctx;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (dash.length > 0) ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(x1 - this.device.camera.x, y1 - this.device.camera.y);
        ctx.lineTo(x2 - this.device.camera.x, y2 - this.device.camera.y);
        ctx.stroke();
        ctx.restore();
    }
}
