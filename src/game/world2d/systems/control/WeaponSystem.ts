import { world } from '@world2d/world';
import { BulletEntity } from '@entities';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('WeaponSystem');

/**
 * Weapon System
 * 负责处理武器射击逻辑：冷却倒计时、生成子弹
 */
export const WeaponSystem: ISystem & { fireBullet(shooter: IEntity): void } = {
    name: 'weapon',

    update(dt: number) {
        const weaponEntities = world.with('weapon', 'transform');
        for (const entity of weaponEntities) {
            const e = entity as IEntity;
            const weapon = e.weapon;

            // 防御性检查
            if (!e.transform) {
                logger.error(`Entity "${e.name || e.type || 'N/A'}" has weapon but no transform!`);
                continue;
            }

            // 1. 冷却倒计时
            if (weapon.cooldown > 0) {
                weapon.cooldown -= dt;
            }

            // 2. 同步意图到武器状态（如果有 weaponIntent 组件）
            if (e.weaponIntent) {
                if (e.weaponIntent.wantsToFire) {
                    weapon.isFiring = true;
                    weapon.fireDirection = e.weaponIntent.aimDirection;
                } else {
                    weapon.isFiring = false;
                }
            }

            // 3. 检查是否应该射击
            if (weapon.isFiring && weapon.cooldown <= 0) {
                this.fireBullet(e);
                weapon.cooldown = weapon.fireRate;

                // 调试日志
                logger.debug(`Entity "${e.name || e.type || 'N/A'}" fired! Next shot in ${weapon.fireRate}s`);
            }
        }
    },

    /**
     * 发射子弹
     */
    fireBullet(shooter: IEntity) {
        const { transform, weapon } = shooter;
        const dir = weapon.fireDirection;

        // 归一化方向（防止异常）
        const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        const normalizedDir = length > 0
            ? { x: dir.x / length, y: dir.y / length }
            : { x: 1, y: 0 };

        // 计算子弹初始位置（稍微偏移，避免与射击者碰撞）
        const offset = 15; // 偏移距离
        const bulletX = transform.x + normalizedDir.x * offset;
        const bulletY = transform.y + normalizedDir.y * offset;

        // 生成子弹实体
        const bullet = BulletEntity.create({
            x: bulletX,
            y: bulletY,
            velocityX: normalizedDir.x * weapon.bulletSpeed,
            velocityY: normalizedDir.y * weapon.bulletSpeed,
            damage: weapon.damage,
            color: weapon.bulletColor,
            radius: weapon.bulletRadius || 2,
            maxLifeTime: weapon.bulletLifeTime || 3,
            spriteId: weapon.bulletSpriteId,
            spriteScale: weapon.bulletSpriteScale,
            detectCcdEnabled: weapon.bulletDetectCcdEnabled,
            detectCcdMinDistance: weapon.bulletDetectCcdMinDistance,
            detectCcdBuffer: weapon.bulletDetectCcdBuffer,
            bulletShape: weapon.bulletShape
        }) as IEntity;

        // 记录子弹来源（可选，用于避免击中自己）
        if (bullet) {
            (bullet as any).ownerId = shooter.id || null;
        }

        logger.debug(`Bullet created at (${bulletX.toFixed(1)}, ${bulletY.toFixed(1)}) with velocity (${(normalizedDir.x * weapon.bulletSpeed).toFixed(1)}, ${(normalizedDir.y * weapon.bulletSpeed).toFixed(1)})`);
    }
};
