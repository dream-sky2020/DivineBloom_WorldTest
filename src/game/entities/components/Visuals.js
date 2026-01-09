export const Visuals = {
  /**
   * 创建标准 Sprite 组件数据
   * @param {string} id - 资源ID
   * @param {number} [scale=1] - 缩放比例
   * @param {string} [initialState='idle'] - 初始状态
   */
  Sprite(id, scale = 1, initialState = 'idle') {
    return {
      id,
      state: initialState,
      frameIndex: 0,
      timer: 0,
      scale
    }
  }
}
