import { world } from '@world2d/world'
import { BulletEntity } from '@entities'
import { createLogger } from '@/utils/logger'

const logger = createLogger('WeaponSystem')

/**
 * Weapon System
 * 负责处理武器射击逻辑：冷却倒计时、生成子弹
 * 
 * Required Components:
 * @property {object} weapon - 武器组件
 * @property {object} position - 位置组件
 * 
 * Optional Components:
 * @property {object} weaponIntent - 武器意图（用于接收射击指令）
 */

const weaponEntities = world.with('weapon', 'position')

export const WeaponSystem = {
  update(dt) {
    for (const entity of weaponEntities) {
      const weapon = entity.weapon
      
      // 防御性检查
      if (!entity.position) {
        logger.error(`Entity "${entity.name || entity.type || 'N/A'}" has weapon but no position!`)
        continue
      }
      
      // 1. 冷却倒计时
      if (weapon.cooldown > 0) {
        weapon.cooldown -= dt
      }
      
      // 2. 同步意图到武器状态（如果有 weaponIntent 组件）
      if (entity.weaponIntent) {
        if (entity.weaponIntent.wantsToFire) {
          weapon.isFiring = true
          weapon.fireDirection = entity.weaponIntent.aimDirection
        } else {
          weapon.isFiring = false
        }
      }
      
      // 3. 检查是否应该射击
      if (weapon.isFiring && weapon.cooldown <= 0) {
        this.fireBullet(entity)
        weapon.cooldown = weapon.fireRate
        
        // 调试日志
        logger.debug(`Entity "${entity.name || entity.type || 'N/A'}" fired! Next shot in ${weapon.fireRate}s`)
      }
    }
  },
  
  /**
   * 发射子弹
   * @param {Object} shooter - 射击者实体
   */
  fireBullet(shooter) {
    const { position, weapon } = shooter
    const dir = weapon.fireDirection
    
    // 归一化方向（防止异常）
    const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
    const normalizedDir = length > 0 
      ? { x: dir.x / length, y: dir.y / length }
      : { x: 1, y: 0 }
    
    // 计算子弹初始位置（稍微偏移，避免与射击者碰撞）
    const offset = 15 // 偏移距离
    const bulletX = position.x + normalizedDir.x * offset
    const bulletY = position.y + normalizedDir.y * offset
    
    // 生成子弹实体
    const bullet = BulletEntity.create({
      x: bulletX,
      y: bulletY,
      velocityX: normalizedDir.x * weapon.bulletSpeed,
      velocityY: normalizedDir.y * weapon.bulletSpeed,
      damage: weapon.damage,
      color: weapon.bulletColor,
      radius: weapon.bulletRadius || 2,
      maxLifeTime: weapon.bulletLifeTime || 3
    })
    
    // 记录子弹来源（可选，用于避免击中自己）
    if (bullet) {
      bullet.ownerId = shooter.id || null
    }
    
    logger.debug(`Bullet created at (${bulletX.toFixed(1)}, ${bulletY.toFixed(1)}) with velocity (${(normalizedDir.x * weapon.bulletSpeed).toFixed(1)}, ${(normalizedDir.y * weapon.bulletSpeed).toFixed(1)})`)
  }
}
