/**
 * Editor Grid Render System
 * 负责在编辑模式下渲染参考网格
 * 层级：最高层 (Layer 1000)
 */

export const EditorGridRenderSystem = {
  LAYER: 1000,
  
  config: {
    gridSize: 32,
    lineColor: 'rgba(255, 255, 255, 0.2)',
    boldLineColor: 'rgba(255, 255, 255, 0.4)',
    boldEvery: 5,
    show: true
  },

  /**
   * @param {import('@/game/ecs/GameEngine').Renderer2D} renderer 
   */
  draw(renderer) {
    if (!this.config.show) return;

    const { ctx, camera, width, height } = renderer;
    const { gridSize, lineColor, boldLineColor, boldEvery } = this.config;

    ctx.save();
    
    // 转换到相机坐标空间（为了画线方便，我们直接在屏幕上画）
    const offsetX = -(camera.x % gridSize);
    const offsetY = -(camera.y % gridSize);
    
    const startIdxX = Math.floor(camera.x / gridSize);
    const startIdxY = Math.floor(camera.y / gridSize);

    // 绘制垂直线
    for (let x = offsetX; x <= width; x += gridSize) {
      const idx = Math.round((x - offsetX) / gridSize) + startIdxX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.strokeStyle = idx % boldEvery === 0 ? boldLineColor : lineColor;
      ctx.lineWidth = idx % boldEvery === 0 ? 1.5 : 0.5;
      ctx.stroke();
    }

    // 绘制水平线
    for (let y = offsetY; y <= height; y += gridSize) {
      const idx = Math.round((y - offsetY) / gridSize) + startIdxY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = idx % boldEvery === 0 ? boldLineColor : lineColor;
      ctx.lineWidth = idx % boldEvery === 0 ? 1.5 : 0.5;
      ctx.stroke();
    }

    ctx.restore();
  }
};
