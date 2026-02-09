import { world } from '@world2d/world';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('WeaponSystem');

const DEG_TO_RAD = Math.PI / 180;

function normalizeDirection(dir: { x: number; y: number }, fallback = { x: 1, y: 0 }) {
    const len = Math.hypot(dir.x, dir.y);
    if (!len) return { ...fallback };
    return { x: dir.x / len, y: dir.y / len };
}

function rotateDirection(dir: { x: number; y: number }, rad: number) {
    if (!rad) return { ...dir };
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
        x: dir.x * cos - dir.y * sin,
        y: dir.x * sin + dir.y * cos
    };
}

function clampToArc(
    dir: { x: number; y: number },
    center: { x: number; y: number },
    halfArcRad: number
) {
    const nDir = normalizeDirection(dir);
    const nCenter = normalizeDirection(center);
    if (halfArcRad <= 0) return nCenter;
    const dot = nDir.x * nCenter.x + nDir.y * nCenter.y;
    const cosLimit = Math.cos(halfArcRad);
    if (dot >= cosLimit) return nDir;
    const cross = nCenter.x * nDir.y - nCenter.y * nDir.x;
    const sign = cross >= 0 ? 1 : -1;
    return rotateDirection(nCenter, sign * halfArcRad);
}

function resolveAttackDirection(
    weapon: any,
    intent: { aimDirection: { x: number; y: number }; facingDirection?: { x: number; y: number } }
) {
    const aimDir = normalizeDirection(intent.aimDirection);
    const facingDir = normalizeDirection(intent.facingDirection || aimDir);
    const mode = weapon.attackMode || 'free';
    const arcDeg = weapon.attackArcDeg ?? 180;
    const halfArc = (Math.max(0, arcDeg) * DEG_TO_RAD) / 2;
    const offsetRad = (weapon.attackAngleOffsetDeg || 0) * DEG_TO_RAD;

    if (mode === 'free') {
        return { allowed: true, dir: rotateDirection(aimDir, offsetRad) };
    }

    const base = mode === 'worldUp'
        ? { x: 0, y: 1 }
        : facingDir;

    const center = rotateDirection(base, offsetRad);
    const clamped = clampToArc(aimDir, center, halfArc);
    const dot = clamped.x * center.x + clamped.y * center.y;
    const cosLimit = Math.cos(halfArc);

    if (weapon.blockIfOutOfRange && dot < cosLimit) {
        return { allowed: false, dir: clamped };
    }

    return { allowed: true, dir: clamped };
}

/**
 * Weapon System
 * 负责处理武器射击逻辑：冷却倒计时、解析射击方向
 */
export const WeaponSystem: ISystem = {
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
                    const resolved = resolveAttackDirection(weapon, e.weaponIntent);
                    weapon.isFiring = resolved.allowed;
                    weapon.fireDirection = resolved.dir;
                } else {
                    weapon.isFiring = false;
                }
            }

        }
    },
};
