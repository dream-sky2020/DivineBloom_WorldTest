import { world } from '@world2d/world';
import { SpriteMode } from '@world2d/definitions/enums/SpriteMode';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('VisualRenderSystem');

/**
 * Sprite Render System
 * 负责渲染：实体 Sprite (角色, 道具等)
 * 层级：中间层 (Layer 20)，需要 Y 轴排序
 */
export const VisualRenderSystem: ISystem & {
    LAYER: number;
    drawVisual(renderer: any, entity: IEntity): void;
    _drawRect(ctx: any, sprite: any, entity: IEntity, x: number, y: number): void;
    _drawCircle(ctx: any, sprite: any, x: number, y: number): void;
    _drawText(ctx: any, sprite: any, x: number, y: number): void;
    _drawRepeat(renderer: any, sprite: any, entity: IEntity, x: number, y: number): void;
    _drawTexture(renderer: any, sprite: any, entity: IEntity, transform: any): void;
} = {
    name: 'visual-render',
    // 定义渲染层级 (Z-Index)
    LAYER: 20,

    update(dt: number) {
        // 目前暂无实时更新逻辑 (如动画更新已移除)
    },

    draw(renderer: any) {
        // 1. 收集实体
        const entities: IEntity[] = [];
        const renderEntities = world.with('transform');

        for (const entity of renderEntities) {
            const e = entity as IEntity;
            if (!e.transform) continue;
            if (!e.sprite && !e.visual) continue;

            entities.push(e);
        }

        // 排序逻辑 (Y-Sort)
        entities.sort((a, b) => {
            const zA = a.zIndex || 0;
            const zB = b.zIndex || 0;
            if (zA !== zB) return zA - zB;
            // 基础层级相同时，按 Y 轴排序
            return (a.transform!.y) - (b.transform!.y);
        });

        const viewW = renderer.width || 9999;
        const viewH = renderer.height || 9999;
        const camera = renderer.camera;
        if (!camera) return;

        const cullMargin = 100;
        const isVisible = (pos: any) => {
            return !(pos.x < camera.x - cullMargin ||
                pos.x > camera.x + viewW + cullMargin ||
                pos.y < camera.y - cullMargin ||
                pos.y > camera.y + viewH + cullMargin);
        };

        for (const entity of entities) {
            if (!isVisible(entity.transform)) continue;
            this.drawVisual(renderer, entity);
        }
    },

    drawVisual(renderer: any, entity: IEntity) {
        const sprite = entity.sprite || entity.visual;
        const { transform } = entity;

        if (!sprite || sprite.visible === false || !transform) return;

        const ctx = renderer.ctx;
        const camera = renderer.camera;
        const drawX = transform.x + (sprite.offsetX || 0) - (camera?.x || 0);
        const drawY = transform.y + (sprite.offsetY || 0) - (camera?.y || 0);

        ctx.save();
        ctx.globalAlpha = sprite.opacity !== undefined ? sprite.opacity : 1.0;

        if (sprite.rotation) {
            ctx.translate(drawX, drawY);
            ctx.rotate(sprite.rotation);
            ctx.translate(-drawX, -drawY);
        }

        switch (sprite.mode) {
            case SpriteMode.RECT:
                this._drawRect(ctx, sprite, entity, drawX, drawY);
                break;
            case SpriteMode.CIRCLE:
                this._drawCircle(ctx, sprite, drawX, drawY);
                break;
            case SpriteMode.TEXT:
                this._drawText(ctx, sprite, drawX, drawY);
                break;
            case SpriteMode.REPEAT:
                this._drawRepeat(renderer, sprite, entity, drawX, drawY);
                break;
            case SpriteMode.TEXTURE:
            default:
                this._drawTexture(renderer, sprite, entity, transform);
                break;
        }

        ctx.restore();
    },

    _drawRect(ctx: any, sprite: any, entity: IEntity, x: number, y: number) {
        const rect = (entity as any).rect || sprite;
        ctx.fillStyle = sprite.tint || rect.color || 'magenta';
        ctx.fillRect(x, y, rect.width || 10, rect.height || 10);
    },

    _drawCircle(ctx: any, sprite: any, x: number, y: number) {
        const radius = sprite.radius || 10;
        ctx.fillStyle = sprite.tint || 'magenta';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    },

    _drawText(ctx: any, sprite: any, x: number, y: number) {
        if (!sprite.text) return;
        ctx.fillStyle = sprite.tint || 'white';
        ctx.font = `${sprite.fontSize || 16}px ${sprite.fontFamily || 'Arial'}`;
        ctx.textAlign = sprite.textAlign || 'center';
        ctx.fillText(sprite.text, x, y);
    },

    _drawRepeat(renderer: any, sprite: any, entity: IEntity, x: number, y: number) {
        if (!sprite.id) return;

        const texture = renderer.assetManager.getTexture(sprite.id);
        if (!texture || !texture.complete) return;

        const ctx = renderer.ctx;
        const rect = (entity as any).rect || sprite;
        const width = rect.width || 100;
        const height = rect.height || 100;

        const pattern = ctx.createPattern(texture, 'repeat');
        if (pattern) {
            ctx.save();
            const matrix = new DOMMatrix();
            const ts = sprite.tileScale || 1.0;
            matrix.translateSelf(x, y).scaleSelf(ts, ts);
            pattern.setTransform(matrix);

            ctx.fillStyle = pattern;
            ctx.fillRect(x, y, width, height);
            ctx.restore();
        }
    },

    _drawTexture(renderer: any, sprite: any, entity: IEntity, transform: any) {
        if (!sprite.id) return;

        const texture = renderer.assetManager.getTexture(sprite.id);
        if (!texture) return;

        const drawPos = {
            x: transform.x + (sprite.offsetX || 0),
            y: transform.y + (sprite.offsetY || 0)
        };

        const scale = sprite.scale !== undefined ? sprite.scale : 1.0;
        
        // 简化版：直接绘制整张贴图，默认居中对齐
        const spriteDef = {
            sx: 0, sy: 0, 
            sw: texture.width, sh: texture.height,
            ax: 0.5, ay: 0.5
        };

        renderer.drawSprite(texture, spriteDef, drawPos, scale);
    }
};
