import { EditorInteractionSystem } from './EditorInteractionSystem';
import { Visuals } from '@/data/visuals';
import { world } from '@/game/ecs/world';

/**
 * Editor Highlight Render System
 * 在编辑模式下：
 * 1. 为所有实体在中心位置绘制小圆点（Handle）
 * 2. 为选中的实体绘制高亮虚线框
 */
export const EditorHighlightRenderSystem = {
  LAYER: 1001, // 略高于网格

  draw(renderer) {
    const { ctx, camera } = renderer;
    const entities = world.with('position');

    ctx.save();

    // 1. 遍历所有带位置的实体，绘制它们的边界框
    for (const entity of entities) {
      const { x, y } = entity.position;
      const screenX = x - camera.x;
      const screenY = y - camera.y;

      // 剔除屏幕外 (稍微多留一点边距)
      if (screenX < -100 || screenX > renderer.width + 100 || 
          screenY < -100 || screenY > renderer.height + 100) continue;

      const isSelected = entity === EditorInteractionSystem.selectedEntity;
      const isDragging = isSelected && EditorInteractionSystem.isDragging;

      // 确定框体大小和位置
      let w = 32, h = 32, ax = 0.5, ay = 1.0;
      let label = entity.name || entity.type || 'Entity';

      if (entity.visual) {
        const def = Visuals[entity.visual.id];
        if (def) {
          w = (def.layout?.width) || 32;
          h = (def.layout?.height) || 32;
          ax = def.anchor?.x ?? 0.5;
          ay = def.anchor?.y ?? 1.0;
        }
      } else if (entity.detectArea && entity.detectArea.size) {
        w = entity.detectArea.size.w;
        h = entity.detectArea.size.h;
        // 传送门等 detectArea 通常是居中计算 offset
        if (entity.detectArea.offset) {
          const centerX = screenX + entity.detectArea.offset.x;
          const centerY = screenY + entity.detectArea.offset.y;
          this.drawBox(ctx, centerX - w/2, centerY - h/2, w, h, isSelected, isDragging, label, x, y);
          continue;
        }
        ax = 0; ay = 0;
      }

      const left = screenX - w * ax;
      const top = screenY - h * ay;
      this.drawBox(ctx, left, top, w, h, isSelected, isDragging, label, x, y);
    }

    ctx.restore();
  },

  /**
   * 绘制单个实体的辅助框
   */
  drawBox(ctx, x, y, w, h, isSelected, isDragging, label, worldX, worldY) {
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
  }
};
