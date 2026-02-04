import { AssetManager } from './resources/AssetManager';

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
    return { imageId, sx, sy, sw, sh, ax, ay }
}

/**
 * 统一绘制（Canvas2D）
 */
export class Renderer2D {
    ctx: CanvasRenderingContext2D;
    assetManager: AssetManager;
    camera: Point;
    clearColor: string;
    width: number;
    height: number;

    constructor(ctx: CanvasRenderingContext2D, assetManager: AssetManager) {
        this.ctx = ctx
        this.assetManager = assetManager
        this.camera = { x: 0, y: 0 }
        this.clearColor = '#dbeafe'
        this.width = 0
        this.height = 0
    }

    setCamera(x: number, y: number) {
        this.camera.x = x
        this.camera.y = y
    }

    begin(w: number, h: number) {
        this.width = w
        this.height = h
        const ctx = this.ctx
        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = this.clearColor
        ctx.fillRect(0, 0, w, h)

        // 启用高质量图像平滑，减少缩放时的毛刺感
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
    }

    /**
     * 绘制精灵
     */
    drawSprite(imgOrId: HTMLImageElement | HTMLCanvasElement | string, spr: SpriteDefinition, pos: Point, scale: number = 1) {
        const ctx = this.ctx
        let img: HTMLImageElement | HTMLCanvasElement | undefined | null;

        // 如果传入的是字符串ID，尝试从资源管理器获取
        if (typeof imgOrId === 'string') {
            img = this.assetManager.getTexture(imgOrId)
        } else {
            img = imgOrId;
        }

        if (!img) return

        const x = pos.x - this.camera.x
        const y = pos.y - this.camera.y

        // Use full image size if sprite width/height is 0 or undefined
        const sw = spr.sw || img.width
        const sh = spr.sh || img.height

        // Destination width/height (affected by scale)
        const dw = sw * scale
        const dh = sh * scale

        // 对坐标进行取整，防止亚像素渲染导致的模糊和部分毛刺感
        const dx = Math.round(x - dw * spr.ax)
        const dy = Math.round(y - dh * spr.ay)

        // 直接绘制精灵（已移除阴影）
        try {
            ctx.drawImage(img, spr.sx, spr.sy, sw, sh, dx, dy, Math.round(dw), Math.round(dh))
        } catch (e) {
            // ignore draw error (e.g. source height is 0)
        }
    }

    // 辅助绘图方法
    drawCircle(x: number, y: number, r: number, color: string) {
        const ctx = this.ctx
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x - this.camera.x, y - this.camera.y, r, 0, Math.PI * 2)
        ctx.fill()
    }

    drawRect(x: number, y: number, w: number, h: number, color: string) {
        const ctx = this.ctx
        ctx.fillStyle = color
        ctx.fillRect(x - this.camera.x, y - this.camera.y, w, h)
    }

    drawText(text: string, x: number, y: number, font: string = '12px Arial', color: string = '#ffffff', align: CanvasTextAlign = 'center') {
        const ctx = this.ctx
        ctx.save()
        ctx.font = font
        ctx.fillStyle = color
        ctx.textAlign = align
        ctx.fillText(text, x - this.camera.x, y - this.camera.y)
        ctx.restore()
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: string = '#ffffff', width: number = 1, dash: number[] = []) {
        const ctx = this.ctx
        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = width
        if (dash.length > 0) ctx.setLineDash(dash)
        ctx.beginPath()
        ctx.moveTo(x1 - this.camera.x, y1 - this.camera.y)
        ctx.lineTo(x2 - this.camera.x, y2 - this.camera.y)
        ctx.stroke()
        ctx.restore()
    }
}
