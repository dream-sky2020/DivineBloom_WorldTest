import { world } from '@/game/ecs/world'
import { createLogger } from '@/utils/logger'

const logger = createLogger('DetectAreaSystem')

/**
 * DetectAreaSystem
 * 负责处理空间感知逻辑
 * 输出: 更新实体上的 detectArea.results
 */
export const DetectAreaSystem = {
  update(dt) {
    // 1. 获取所有具有 DetectArea 的实体
    const detectors = world.with('detectArea', 'position')

    // 2. 缓存所有具有特定标签的目标集合 (例如 player, enemy)
    const players = world.with('player', 'position')
    const enemies = world.with('enemy', 'position')

    for (const entity of detectors) {
      // Defensive Check
      if (!entity.detectArea) {
        logger.warn(`Entity ${entity.id || 'N/A'} missing detectArea component!`);
        continue;
      }

      const detect = entity.detectArea
      detect.results = [] // 重置结果

      // Defensive Check for required arrays (ensure safe fallback if schema failed)
      if (!detect.includeTags) detect.includeTags = [];
      if (!detect.results) detect.results = [];

      // 获取需要检测的目标标签列表
      const targetTags = Array.isArray(detect.target) ? detect.target : [detect.target];
      
      // 合并 includeTags
      const allTags = new Set([...targetTags, ...detect.includeTags]);

      // 检测所有符合标签的目标
      if (allTags.has('player')) {
          for (const player of players) {
              if (this.checkCollision(entity, player, detect)) {
                  detect.results.push(player);
              }
          }
      }

      if (allTags.has('enemy')) {
          for (const enemy of enemies) {
              if (this.checkCollision(entity, enemy, detect)) {
                  detect.results.push(enemy);
              }
          }
      }

      // TODO: 未来可扩展对其他类型（如 npc, interactive）的检测
    }
  },

  checkCollision(detectorEntity, targetEntity, config) {
    // Type Guards & Defensive Checks
    if (!detectorEntity.position) {
      logger.error(`Detector entity missing position! ID: ${detectorEntity.id}`);
      return false;
    }
    if (!targetEntity.position) {
      logger.error(`Target entity missing position! ID: ${targetEntity.id}`);
      return false;
    }
    if (!config) {
      logger.error(`Missing config for checkCollision!`);
      return false;
    }

    const dPos = detectorEntity.position
    const tPos = targetEntity.position

    // 计算检测中心点 (加上偏移)
    const centerX = dPos.x + (config.offset?.x || 0)
    const centerY = dPos.y + (config.offset?.y || 0)

    if (config.shape === 'circle') {
      const dx = tPos.x - centerX
      const dy = tPos.y - centerY
      const distSq = dx * dx + dy * dy
      const radiusSq = (config.radius || 0) * (config.radius || 0)

      return distSq <= radiusSq
    }
    else if (config.shape === 'aabb' || config.shape === 'rect') { // Support both aabb and rect
      // 简单的 AABB 检测
      const halfW = (config.size?.w || 0) / 2
      const halfH = (config.size?.h || 0) / 2

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
