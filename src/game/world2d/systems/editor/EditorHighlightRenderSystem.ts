import { EditorInteractionSystem } from './EditorInteractionSystem';
import { world } from '@world2d/world';
import { editorManager } from '../../../editor/core/EditorCore';
import { toRaw } from 'vue';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * Editor Highlight Render System
 * 在编辑模式下：
 * 1. 为所有实体在中心位置绘制小圆点（Handle）
 * 2. 为选中的实体绘制高亮虚线框
 */
export const EditorHighlightRenderSystem: ISystem & { LAYER: number } = {
    name: 'editor-highlight-render',
    LAYER: 1001, // 略高于网格

    draw(renderer: any) {
        const { ctx, camera } = renderer;
        const entities = world;

        // 获取当前选中的实体 (原始对象)
        const selectedEntity = toRaw(editorManager.selectedEntity);

        ctx.save();

        for (const entity of entities) {
            const rawEntity = toRaw(entity) as IEntity;
            const isSelected = rawEntity === selectedEntity;
            const isDragging = isSelected && EditorInteractionSystem.isDragging;

            // 如果没有位置，只在选中时特殊处理
            if (!rawEntity.transform) {
                if (isSelected && (rawEntity as any).globalManager) {
                    // 全局管理实体在选中时，在左上角绘制一个固定标识
                    this._drawGlobalIndicator(ctx, isDragging);
                }
                continue;
            }

            // 使用统一的边界计算逻辑
            const bounds = EditorInteractionSystem.getEntityBounds(rawEntity);
            if (!bounds) continue;

            const screenX = bounds.left - camera.x;
            const screenY = bounds.top - camera.y;

            // 剔除屏幕外 (稍微多留一点边距)
            const viewW = renderer.width || 2000;
            const viewH = renderer.height || 2000;

            if (screenX < -500 || screenX > viewW + 500 ||
                screenY < -500 || screenY > viewH + 500) continue;

            let label = rawEntity.name || rawEntity.type || 'Entity';
            this._drawBox(ctx, screenX, screenY, bounds.w, bounds.h, isSelected, isDragging, label, rawEntity.transform.x, rawEntity.transform.y);
        }

        ctx.restore();
    },

    /**
     * 绘制单个实体的辅助框
     */
    _drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isSelected: boolean, isDragging: boolean, label: string, worldX: number, worldY: number) {
        ctx.beginPath();

        // 设置颜色和样式：强调可见度
        if (isDragging) {
            ctx.strokeStyle = '#f97316'; // 橙色 (拖拽)
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
        } else if (isSelected) {
            ctx.strokeStyle = '#facc15'; // 亮黄色 (选中)
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
        } else {
            // 普通状态：使用高对比度的青蓝色，实线，半透明
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)'; // cyan-400
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
        }

        ctx.strokeRect(x, y, w, h);

        // 填充一个极淡的背景色，增加点击感和可见度
        ctx.fillStyle = isSelected || isDragging ? 'rgba(250, 204, 21, 0.1)' : 'rgba(34, 211, 238, 0.05)';
        ctx.fillRect(x, y, w, h);

        // 绘制文字标签 (全部显示)
        ctx.fillStyle = isDragging ? '#f97316' : (isSelected ? '#facc15' : 'rgba(255, 255, 255, 0.9)');
        ctx.font = 'bold 11px Arial';
        // 在方块上方绘制 ID/类型
        const text = `${label}`;
        const posText = `(${Math.round(worldX)}, ${Math.round(worldY)})`;

        // 简单的文字背景，防止文字在复杂背景下看不清
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y - 14, textWidth + 4, 14);

        ctx.fillStyle = isDragging ? '#fb923c' : (isSelected ? '#fde047' : '#ffffff');
        ctx.fillText(text, x + 2, y - 3);

        // 只有选中或拖拽时额外显示坐标
        if (isSelected || isDragging) {
            ctx.fillText(posText, x + 2, y + h + 12);
        }
    },

    /**
     * 绘制全局管理实体的标识（固定在左上角区域）
     */
    _drawGlobalIndicator(ctx: CanvasRenderingContext2D, isDragging: boolean) {
        const x = 20, y = 20, w = 120, h = 40;

        ctx.setTransform(1, 0, 0, 1, 0, 0); // 取消相机变换，绘制在固定位置

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = isDragging ? '#f97316' : '#facc15';
        ctx.lineWidth = 2;

        // 绘制背景
        this._roundRect(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.stroke();

        // 绘制文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GLOBAL MANAGER', x + w / 2, y + 25);

        // 恢复之前的变换（如果有的话）
        // 注意：caller 应该在 restore() 之前处理好 transform
    },

    /**
     * 绘制圆角矩形辅助函数
     */
    _roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
};
