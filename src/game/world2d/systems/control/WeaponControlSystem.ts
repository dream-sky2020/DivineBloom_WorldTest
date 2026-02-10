import { world } from '@world2d/world';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { BulletEntity } from '@entities';

const logger = createLogger('WeaponControlSystem');

function normalizeDirection(dir: { x: number; y: number }, fallback = { x: 1, y: 0 }) {
    const len = Math.hypot(dir.x, dir.y);
    if (!len) return { ...fallback };
    return { x: dir.x / len, y: dir.y / len };
}

/**
 * WeaponControlSystem
 * 根据 weaponIntent 执行发射并直接创建子弹实体。
 */
export const WeaponControlSystem: ISystem = {
    name: 'weapon-control',

    update(dt: number) {
        const weaponEntities = world.with('weapon', 'weaponIntent', 'transform');
        for (const entity of weaponEntities) {
            const e = entity as IEntity;
            const weapon = e.weapon;
            const intent = e.weaponIntent;
            const transform = e.transform;

            if (!weapon || !intent || !transform) {
                logger.error(`Entity "${e.name || e.type || 'N/A'}" missing weapon/weaponIntent/transform`);
                continue;
            }

            if (weapon.cooldown > 0) {
                weapon.cooldown -= dt;
            }

            weapon.isFiring = false;
            if (!intent.fireThisTick || weapon.cooldown > 0) {
                continue;
            }

            const baseDir = normalizeDirection(intent.attackDirection || weapon.fireDirection || { x: 1, y: 0 });
            weapon.fireDirection = baseDir;

            if (weapon.blockIfOutOfRange && !intent.targetId) {
                continue;
            }

            const projectileSpeed = intent.projectileSpeed ?? weapon.bulletSpeed;
            const projectileDamage = intent.projectileDamage ?? weapon.damage;
            const projectileRadius = intent.projectileRadius ?? (weapon.bulletRadius || 2);
            const projectileLifeTime = intent.projectileLifeTime ?? (weapon.bulletLifeTime || 3);
            const offset = 15;

            const projectileList = Array.isArray(intent.projectiles) && intent.projectiles.length > 0
                ? intent.projectiles
                : [{ direction: baseDir, speed: projectileSpeed, angleOffsetDeg: 0 }];

            for (const projectile of projectileList) {
                const dir = normalizeDirection(projectile?.direction || baseDir, baseDir);
                const speed = typeof projectile?.speed === 'number' ? projectile.speed : projectileSpeed;

                BulletEntity.create({
                    x: transform.x + dir.x * offset,
                    y: transform.y + dir.y * offset,
                    velocityX: dir.x * speed,
                    velocityY: dir.y * speed,
                    damage: projectileDamage,
                    color: weapon.bulletColor,
                    radius: projectileRadius,
                    maxLifeTime: projectileLifeTime,
                    spriteId: weapon.bulletSpriteId,
                    spriteScale: weapon.bulletSpriteScale,
                    detectCcdEnabled: weapon.bulletDetectCcdEnabled,
                    detectCcdMinDistance: weapon.bulletDetectCcdMinDistance,
                    detectCcdBuffer: weapon.bulletDetectCcdBuffer,
                    bulletShape: weapon.bulletShape
                });
            }

            weapon.cooldown = weapon.fireRate;
            weapon.isFiring = true;
        }
    }
};
