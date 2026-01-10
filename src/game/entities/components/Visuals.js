export const Visuals = {
  /**
   * 创建标准 Sprite 组件数据
   * @param {string} id - 资源ID
   * @param {number} [scale=1] - 缩放比例
   * @param {string} [initialState='idle'] - 初始状态
   */
  Sprite(id, scale = 1, initialState = 'idle') {
    return {
      type: 'sprite', // Added type
      id,
      state: initialState,
      frameIndex: 0,
      timer: 0,
      scale
    }
  },

  /**
   * 创建矩形组件数据 (用于背景/调试)
   * @param {number} width 
   * @param {number} height 
   * @param {string} color 
   */
  Rect(width, height, color) {
    return {
      type: 'rect',
      width,
      height,
      color
    }
  },

  /**
   * 创建视野指示器组件数据
   * 实际数据从 target 实体获取
   */
  Vision() {
      return {
          type: 'vision'
      }
  }
}
