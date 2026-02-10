import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { WeaponSense } from '@components';

type NearbyEnemy = {
    id: string;
    entity: IEntity;
    distance: number;
    distanceSq: number;
    direction: { x: number; y: number };
    angle: number;
    priority: number;
    category: 'normal' | 'horde';
};

const DEFAULT_SENSE_RADIUS = 500;
const MIN_SENSE_RADIUS = 80;
const MAX_NEARBY_RESULTS = 32;

function estimateWeaponSenseRadius(entity: IEntity) {
    const weapon = entity.weapon;
    if (!weapon) return DEFAULT_SENSE_RADIUS;

    const bulletSpeed = typeof weapon.bulletSpeed === 'number' ? weapon.bulletSpeed : 0;
    const bulletLifeTime = typeof weapon.bulletLifeTime === 'number' ? weapon.bulletLifeTime : 0;
    const estimatedRange = bulletSpeed * bulletLifeTime;
    return Math.max(MIN_SENSE_RADIUS, estimatedRange || DEFAULT_SENSE_RADIUS);
}

/**
 * WeaponSenseSystem
 * 基于 Monster 组件统一收集怪物，并为武器生成附近敌人列表。
 */
export const WeaponSenseSystem: ISystem = {
    name: 'weapon-sense',

    update(_dt: number) {
        const monsters = world.with('monster', 'transform');
        const weapons = world.with('weapon', 'transform');

        const aliveMonsters: IEntity[] = [];
        for (const entity of monsters) {
            const m = entity as IEntity;
            if (!m.transform) continue;
            if (m.health && typeof m.health.currentHealth === 'number' && m.health.currentHealth <= 0) {
                continue;
            }
            aliveMonsters.push(m);
        }

        for (const entity of weapons) {
            const w = entity as IEntity;
            if (!w.transform) continue;
            if (!w.weaponSense) {
                world.addComponent(w, 'weaponSense', WeaponSense.create());
            }
            const weaponSense = w.weaponSense;
            if (!weaponSense) continue;

            const radius = estimateWeaponSenseRadius(w);
            const radiusSq = radius * radius;
            const wx = w.transform.x;
            const wy = w.transform.y;
            const nearbyEnemies: NearbyEnemy[] = [];

            for (const monster of aliveMonsters) {
                if (monster === w) continue;

                const dx = monster.transform.x - wx;
                const dy = monster.transform.y - wy;
                const distSq = dx * dx + dy * dy;
                if (distSq > radiusSq) continue;

                const distance = Math.sqrt(distSq);
                const dirX = distance > 0 ? dx / distance : 1;
                const dirY = distance > 0 ? dy / distance : 0;
                const idRaw = monster.uuid ?? monster.id ?? monster.__id ?? '';

                nearbyEnemies.push({
                    id: String(idRaw),
                    entity: monster,
                    distance,
                    distanceSq: distSq,
                    direction: { x: dirX, y: dirY },
                    angle: Math.atan2(dy, dx),
                    priority: monster.monster?.priority ?? 1,
                    category: monster.monster?.category ?? 'normal'
                });
            }

            nearbyEnemies.sort((a, b) => {
                if (a.distanceSq !== b.distanceSq) return a.distanceSq - b.distanceSq;
                return b.priority - a.priority;
            });

            weaponSense.nearbyEnemies = nearbyEnemies.slice(0, MAX_NEARBY_RESULTS);
            weaponSense.primaryTarget = weaponSense.nearbyEnemies[0] || null;
            weaponSense.senseRadius = radius;
        }
    }
};
