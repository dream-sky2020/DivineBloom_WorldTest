import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

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

function resolveOwnerEntity(weaponEntity: IEntity): IEntity | null {
    const ownerTarget = (weaponEntity as any).motion?.target?.entityId;
    if (!ownerTarget) return null;

    const players = world.with('player', 'transform');
    for (const entity of players) {
        const p = entity as IEntity;
        if (
            ownerTarget === 'player'
            || ownerTarget === p.id
            || ownerTarget === (p as any).__id
            || ownerTarget === (p as any).uuid
            || ownerTarget === p.name
            || ownerTarget === p.type
        ) {
            return p;
        }
    }

    return null;
}

/**
 * WeaponIntentSystem
 * 基于输入与感知结果生成武器意图。
 */
export const WeaponIntentSystem: ISystem & {
    autoAttackEnabled: boolean;
    lastFacingDirection: { x: number; y: number };
} = {
    name: 'weapon-intent',
    autoAttackEnabled: false,
    lastFacingDirection: { x: 1, y: 0 },

    update(_dt: number) {
        const globalEntity = world.with('globalManager', 'mousePosition').first as IEntity | undefined;
        const player = world.with('player', 'rawInput', 'transform').first as IEntity | undefined;
        const rawButtons = player?.rawInput?.buttons || {};
        const rawAxes = player?.rawInput?.axes || { x: 0, y: 0 };

        if (rawButtons.autoAttackEnable) this.autoAttackEnabled = true;
        if (rawButtons.autoAttackDisable) this.autoAttackEnabled = false;

        const manualAttack = !!rawButtons.attack;
        const ownerMove = {
            x: typeof rawAxes.x === 'number' ? rawAxes.x : 0,
            y: typeof rawAxes.y === 'number' ? rawAxes.y : 0
        };
        if (ownerMove.x !== 0 || ownerMove.y !== 0) {
            this.lastFacingDirection = normalizeDirection(ownerMove, this.lastFacingDirection);
        }

        const weaponEntities = world.with('weapon', 'weaponIntent', 'weaponSense', 'transform');
        for (const entity of weaponEntities) {
            const weaponEntity = entity as IEntity;
            const weapon = weaponEntity.weapon;
            const intent = weaponEntity.weaponIntent;
            const weaponSense = weaponEntity.weaponSense;
            if (!weapon || !intent || !weaponSense || !weaponEntity.transform) continue;

            const owner = resolveOwnerEntity(weaponEntity);
            const ownerTransform = owner?.transform || weaponEntity.transform;
            const mousePos = globalEntity?.mousePosition;

            const primaryTarget = weaponSense.primaryTarget || null;
            const hasTarget = !!primaryTarget?.entity?.transform;

            let desiredDirection = { ...this.lastFacingDirection };
            if (manualAttack && mousePos && ownerTransform) {
                desiredDirection = normalizeDirection({
                    x: mousePos.worldX - ownerTransform.x,
                    y: mousePos.worldY - ownerTransform.y
                }, this.lastFacingDirection);
            } else if (hasTarget && primaryTarget.direction) {
                desiredDirection = normalizeDirection(primaryTarget.direction, this.lastFacingDirection);
            }

            const shouldFireByInput = manualAttack || this.autoAttackEnabled;
            const shouldFireByTarget = manualAttack || hasTarget;
            const shouldFire = shouldFireByInput && shouldFireByTarget;
            const fireThisTick = shouldFire && weapon.cooldown <= 0;

            const projectileCount = Math.max(1, Math.floor(weapon.projectileCount ?? 1));
            const projectileSpreadDeg = weapon.projectileSpreadDeg ?? 0;
            const spreadStepDeg = projectileCount > 1 ? (projectileSpreadDeg / (projectileCount - 1)) : 0;
            const startDeg = projectileCount > 1 ? (-projectileSpreadDeg / 2) : 0;

            const projectiles: Array<{ direction: { x: number; y: number }; speed: number; angleOffsetDeg: number }> = [];
            for (let i = 0; i < projectileCount; i++) {
                const offsetDeg = startDeg + i * spreadStepDeg;
                const offsetRad = offsetDeg * DEG_TO_RAD;
                projectiles.push({
                    direction: normalizeDirection(rotateDirection(desiredDirection, offsetRad), desiredDirection),
                    speed: weapon.bulletSpeed,
                    angleOffsetDeg: offsetDeg
                });
            }

            intent.shouldFire = shouldFire;
            intent.fireThisTick = fireThisTick;
            intent.sourceMode = manualAttack ? 'manual' : (this.autoAttackEnabled ? 'auto' : 'idle');
            intent.targetId = primaryTarget?.id ? String(primaryTarget.id) : null;
            intent.attackDirection = desiredDirection;
            intent.aimAngle = Math.atan2(desiredDirection.y, desiredDirection.x);
            intent.projectileSpeed = weapon.bulletSpeed;
            intent.projectileCount = projectileCount;
            intent.projectileDamage = weapon.damage;
            intent.projectileLifeTime = weapon.bulletLifeTime;
            intent.projectileRadius = weapon.bulletRadius;
            intent.projectileSpreadDeg = projectileSpreadDeg;
            intent.projectiles = projectiles;
        }
    }
};
