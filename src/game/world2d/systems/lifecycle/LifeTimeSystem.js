import { world } from '@world2d/world'
import { createLogger } from '@/utils/logger'

const logger = createLogger('LifeTimeSystem')

/**
 * LifeTime System
 * 负责管理实体的生命周期，自动删除生命周期结束的实体
 * 
 * Required Components:
 * @property {object} lifeTime - 生命周期组件
 * 
 * 工作流程：
 * 1. 每帧减少 lifeTime.currentTime
 * 2. 当 currentTime <= 0 且 autoRemove = true 时
 * 3. 发送 DELETE_ENTITY 命令到 ExecuteSystem
 */

const lifeTimeEntities = world.with('lifeTime')

export const LifeTimeSystem = {
  update(dt) {
    for (const entity of lifeTimeEntities) {
      const lifeTime = entity.lifeTime
      
      // 防御性检查
      if (!lifeTime) continue
      
      // 1. 倒计时
      lifeTime.currentTime -= dt
      
      // 2. 检查是否需要删除
      if (lifeTime.currentTime <= 0 && lifeTime.autoRemove) {
        this.requestRemoval(entity)
      }
    }
  },
  
  /**
   * 请求删除实体
   * @param {Object} entity - 需要删除的实体
   */
  requestRemoval(entity) {
    // 获取全局命令队列
    const globalEntity = world.with('commands').first
    
    if (!globalEntity) {
      // 降级方案：直接删除（不推荐，但保证功能可用）
      logger.warn('Global commands queue not found, removing entity directly', {
        type: entity.type,
        name: entity.name
      })
      world.remove(entity)
      return
    }
    
    // 发送删除命令到 ExecuteSystem
    globalEntity.commands.queue.push({
      type: 'DELETE_ENTITY',
      payload: { entity }
    })
    
    logger.debug(`Requested removal for entity: ${entity.name || entity.type || 'N/A'}`, {
      type: entity.type,
      remainingTime: entity.lifeTime.currentTime
    })
  }
}
