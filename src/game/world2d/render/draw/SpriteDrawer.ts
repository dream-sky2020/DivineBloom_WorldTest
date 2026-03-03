import type { AssetManager } from '../../resources/AssetManager';
import type { Point, SpriteDefinition } from '../sprites';

type SpriteRenderDevice = {
    ctx: CanvasRenderingContext2D;
    assetManager: AssetManager;
    camera: Point;
};

/**
 * 负责精灵贴图绘制（裁切、锚点、缩放）
 */
export class SpriteDrawer {
    private readonly device: SpriteRenderDevice;

    constructor(device: SpriteRenderDevice) {
        this.device = device;
    }

    drawSprite(
        imgOrId: HTMLImageElement | HTMLCanvasElement | string,
        spr: SpriteDefinition,
        pos: Point,
        scale: number = 1
    ) {
        const ctx = this.device.ctx;
        let img: HTMLImageElement | HTMLCanvasElement | undefined | null;

        // 如果传入的是字符串ID，尝试从资源管理器获取
        if (typeof imgOrId === 'string') {
            img = this.device.assetManager.getTexture(imgOrId);
        } else {
            img = imgOrId;
        }

        if (!img) return;

        const x = pos.x - this.device.camera.x;
        const y = pos.y - this.device.camera.y;

        // Use full image size if sprite width/height is 0 or undefined
        const sw = spr.sw || img.width;
        const sh = spr.sh || img.height;

        // Destination width/height (affected by scale)
        const dw = sw * scale;
        const dh = sh * scale;

        // 对坐标进行取整，防止亚像素渲染导致的模糊和部分毛刺感
        const dx = Math.round(x - dw * spr.ax);
        const dy = Math.round(y - dh * spr.ay);

        // 直接绘制精灵（已移除阴影）
        try {
            ctx.drawImage(img, spr.sx, spr.sy, sw, sh, dx, dy, Math.round(dw), Math.round(dh));
        } catch (e) {
            // ignore draw error (e.g. source height is 0)
        }
    }
}
