/**
 * Reusable Trigger Component Factories
 * 提供标准化的触发器组件定义，确保所有实体使用一致的数据结构。
 * 对应 TriggerCheckers.js 的逻辑。
 */

export const Triggers = {
  /**
   * 区域触发
   * @param {object} bounds - { x, y, w, h }
   * @param {boolean} [active=true]
   * @param {boolean} [oneshot=false]
   */
  PlayerZone(bounds, active = true, oneshot = false) {
    return {
      type: 'ZONE',
      bounds: bounds || { x: 0, y: 0, w: 0, h: 0 },
      active,
      oneshot
    }
  },

  /**
   * 距离触发 (圆形)
   * @param {number} radius
   * @param {boolean} [active=true]
   * @param {boolean} [oneshot=false]
   */
  PlayerProximity(radius, active = true, oneshot = false) {
    return {
      type: 'PROXIMITY',
      radius: radius || 0,
      active,
      oneshot
    }
  },

  /**
   * 交互触发 (距离 + 按键)
   * @param {number} radius
   * @param {boolean} [active=true]
   * @param {boolean} [oneshot=false]
   */
  PlayerInteract(radius, active = true, oneshot = false) {
    return {
      type: 'INTERACT',
      radius: radius || 0,
      active,
      oneshot
    }
  }
}

