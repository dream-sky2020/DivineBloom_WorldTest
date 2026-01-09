/**
 * Trigger Checkers Logic
 * 负责具体的触发条件检测算法
 * 
 * @typedef {Object} CheckerContext
 * @property {object} entity - 触发器实体
 * @property {object} player - 玩家实体
 * @property {number} dt - Delta time
 */

export const TriggerCheckers = {
  /**
   * 区域触发 (矩形)
   */
  ZONE: (entity, player) => {
    const t = entity.trigger
    const bounds = t.bounds || { x: 0, y: 0, w: 0, h: 0 }
    const pPos = player.position
    
    // 计算绝对坐标包围盒
    const left = entity.position.x + bounds.x
    const right = left + bounds.w
    const top = entity.position.y + bounds.y
    const bottom = top + bounds.h

    return (pPos.x >= left && pPos.x <= right &&
            pPos.y >= top && pPos.y <= bottom)
  },

  /**
   * 距离触发 (圆形)
   */
  PROXIMITY: (entity, player) => {
    const t = entity.trigger
    const pPos = player.position
    
    const dx = pPos.x - entity.position.x
    const dy = pPos.y - entity.position.y
    const distSq = dx * dx + dy * dy
    const radiusSq = t.radius * t.radius

    return distSq <= radiusSq
  },

  /**
   * 交互触发 (距离 + 按键)
   */
  INTERACT: (entity, player) => {
    // 1. 先检查距离
    if (!TriggerCheckers.PROXIMITY(entity, player)) return false

    // 2. 再检查按键状态 (PlayerControlSystem 处理过的输入)
    return !!(player.controls && player.controls.interact)
  },

  /**
   * 示例：自定义条件扩展
   * @example trigger: { type: 'CUSTOM', fn: (e, p) => p.hp < 10 }
   */
  CUSTOM: (entity, player) => {
    if (typeof entity.trigger.fn === 'function') {
      return entity.trigger.fn(entity, player)
    }
    return false
  }
}

