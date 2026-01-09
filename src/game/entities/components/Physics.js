export const Physics = {
  /**
   * 速度组件
   * @param {number} [x=0] 
   * @param {number} [y=0] 
   */
  Velocity(x = 0, y = 0) {
    return { x, y }
  },

  /**
   * 边界组件 (通常用于地图边界限制)
   * @param {number} [minX=0] 
   * @param {number} [maxX=9999] 
   * @param {number} [minY=0] 
   * @param {number} [maxY=9999] 
   */
  Bounds(minX = 0, maxX = 9999, minY = 0, maxY = 9999) {
    return { minX, maxX, minY, maxY }
  },

  /**
   * 静态刚体 (用于不可移动的物体，如NPC)
   * @param {number} [width=30] 
   * @param {number} [height=30] 
   * @param {number} [radius=15] 
   */
  StaticBody(width = 30, height = 30, radius = 15) {
    return {
      static: true,
      radius,
      width,
      height
    }
  }
}
