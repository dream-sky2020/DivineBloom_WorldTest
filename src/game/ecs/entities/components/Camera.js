/**
 * Camera Component Definition
 */
export const Camera = {
  /**
   * @param {object} params
   * @param {number} [params.x]
   * @param {number} [params.y]
   * @param {number} [params.lerp] 缓动系数 (0-1), 1 为即时跟随
   * @param {boolean} [params.useBounds] 是否应用边界限制
   * @param {object} [params.deadZone] 死区设置 { width, height }
   */
  create({ x = 0, y = 0, lerp = 0.1, useBounds = true, deadZone = { width: 100, height: 100 } } = {}) {
    return {
      x,
      y,
      targetX: x,
      targetY: y,
      lerp,
      useBounds,
      deadZone,
      // 目标实体引用 (通常是玩家)
      targetEntity: null
    }
  }
}
