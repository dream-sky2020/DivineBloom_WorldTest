/**
 * MousePosition Component
 * 
 * 记录鼠标在游戏世界中的坐标位置
 */
export const MousePosition = {
    /**
     * 创建 MousePosition 组件
     * @param {Object} config 配置信息
     * @param {number} config.worldX 鼠标在世界中的 X 坐标
     * @param {number} config.worldY 鼠标在世界中的 Y 坐标
     * @param {number} config.screenX 鼠标在屏幕上的 X 坐标
     * @param {number} config.screenY 鼠标在屏幕上的 Y 坐标
     */
    create({ worldX = 0, worldY = 0, screenX = 0, screenY = 0 } = {}) {
        return {
            worldX,
            worldY,
            screenX,
            screenY
        };
    }
};
