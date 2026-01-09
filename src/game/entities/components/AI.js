export const AI = {
  /**
   * AI 配置组件
   * @param {string} [type='wander'] - AI 类型
   * @param {number} [visionRadius=120] - 视野半径
   * @param {number} [speed=80] - 移动速度
   * @param {object} [extraOptions={}] - 其他高级选项 (visionType, visionAngle, visionProximity, suspicionTime, minYRatio)
   */
  Config(type = 'wander', visionRadius = 120, speed = 80, extraOptions = {}) {
    return {
      type,
      visionRadius,
      speed,
      visionType: extraOptions.visionType || 'circle',
      visionAngle: (extraOptions.visionAngle || 90) * (Math.PI / 180),
      visionProximity: extraOptions.visionProximity || 40,
      suspicionTime: extraOptions.suspicionTime || 0,
      minYRatio: extraOptions.minYRatio || 0.35
    }
  },

  /**
   * AI 状态组件
   * @param {boolean} [isStunned=false] - 是否处于眩晕状态
   * @param {number} [stunnedTimer=0] - 眩晕时间
   * @param {string} [defaultState='wander'] - 默认状态
   */
  State(isStunned = false, stunnedTimer = 0, defaultState = 'wander') {
    return {
      state: isStunned ? 'stunned' : defaultState,
      timer: isStunned ? (stunnedTimer || 3.0) : 0,
      suspicion: 0,
      moveDir: { x: 0, y: 0 },
      facing: { x: 1, y: 0 },
      colorHex: '#eab308', 
      alertAnim: 0,
      starAngle: 0,
      justEntered: true
    }
  }
}
