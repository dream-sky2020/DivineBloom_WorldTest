import { world } from '@/game/ecs/world'

/**
 * DetectAreaSystem
 * 负责处理空间感知逻辑
 * 输出: 更新实体上的 detectArea.results
 */
export const DetectAreaSystem = {
  update(dt) {
    // 1. 获取所有具有 DetectArea 的实体
    const detectors = world.with('detectArea', 'position')

    // 2. 获取潜在目标 (目前主要优化为只检测玩家，后续可扩展)
    // 优化：如果 target 是 'player'，我们只需要获取玩家实体
    let player = null
    const players = world.with('player', 'position')
    for (const p of players) {
      player = p
      break
    }

    for (const entity of detectors) {
      const detect = entity.detectArea
      detect.results = [] // 重置结果

      // 目前只实现对 Player 的检测
      if (detect.target === 'player' || detect.includeTags.includes('player')) {
        if (player && this.checkCollision(entity, player, detect)) {
          // Debug Log for Portal Trigger
          if (entity.type === 'portal') {
            console.log(`[DetectArea] Portal Triggered! Player: (${player.position.x}, ${player.position.y}), Portal Center: (${entity.position.x + detect.offset.x}, ${entity.position.y + detect.offset.y})`)
          }
          detect.results.push(player)
        }
      }

      // TODO: 如果 target 是 'actors'，则需要遍历所有 actors 并进行筛选
    }
  },

  checkCollision(detectorEntity, targetEntity, config) {
    const dPos = detectorEntity.position
    const tPos = targetEntity.position

    // 计算检测中心点 (加上偏移)
    const centerX = dPos.x + (config.offset?.x || 0)
    const centerY = dPos.y + (config.offset?.y || 0)

    if (config.shape === 'circle') {
      const dx = tPos.x - centerX
      const dy = tPos.y - centerY
      const distSq = dx * dx + dy * dy
      const radiusSq = config.radius * config.radius
      return distSq <= radiusSq
    }
    else if (config.shape === 'aabb') {
      // 简单的 AABB 检测
      // 假设 target 也是一个点或者小的矩形，这里简化为检测 target 中心点是否在区域内
      // 如果需要更精确的 AABB vs AABB，需要获取 target 的 bounds

      const halfW = (config.size?.w || 0) / 2
      const halfH = (config.size?.h || 0) / 2

      const left = centerX // 这里假设 size 定义的是从中心向外的扩展？或者 size 就是 w/h
      // 通常 AABB 定义为 center + half extents 或者 top-left + size
      // 鉴于编辑器习惯，假设 offset 是中心偏移

      // 修正：如果 offset 是中心，那么：
      const minX = centerX - halfW
      const maxX = centerX + halfW
      const minY = centerY - halfH
      const maxY = centerY + halfH

      return tPos.x >= minX && tPos.x <= maxX &&
        tPos.y >= minY && tPos.y <= maxY
    }

    return false
  }
}

