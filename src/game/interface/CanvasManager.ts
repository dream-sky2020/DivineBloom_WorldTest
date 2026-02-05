// src/game/interface/CanvasManager.ts
export class CanvasManager {
    private canvasId: string;
    private targetWidth: number;
    private targetHeight: number;

    constructor(canvasId: string) {
        this.canvasId = canvasId;
        this.targetWidth = 1920;
        this.targetHeight = 1080;
    }

    /**
     * 计算并应用缩放变换
     */
    resize(): number | undefined {
        const canvas = document.getElementById(this.canvasId);
        const container = canvas?.parentElement;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width;
        const availableHeight = rect.height;
        
        if (availableWidth === 0 || availableHeight === 0) return;

        const scaleX = availableWidth / this.targetWidth;
        const scaleY = availableHeight / this.targetHeight;
        
        let scale = Math.min(scaleX, scaleY);
        scale = scale * 0.98; // 留一点边距

        canvas.style.transform = `scale(${scale})`;
        return scale;
    }
}
