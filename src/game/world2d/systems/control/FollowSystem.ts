import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

function resolveFollowTarget(target: string) {
    if (!target) return null;

    if (target === 'player') {
        return world.with('player', 'transform').first as IEntity;
    }

    const entities = world.with('transform');
    for (const entity of entities) {
        const e = entity as any;
        if (e.id === target || e.__id === target || e.uuid === target || e.name === target || e.type === target) {
            return e as IEntity;
        }
        if (Array.isArray(e.tags) && e.tags.includes(target)) {
            return e as IEntity;
        }
    }

    return null;
}

function rotateOffset(x: number, y: number, angle: number) {
    if (!angle) return { x, y };
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

export const FollowSystem: ISystem = {
    name: 'follow',

    update(dt: number) {
        const followEntities = world.with('follow', 'transform');
        for (const entity of followEntities) {
            const e = entity as IEntity;
            const follow = e.follow;

            if (!follow) continue;
            const target = resolveFollowTarget(follow.target);
            if (!target || !target.transform) continue;

            if (follow.orbitSpeed) {
                follow.orbitAngle = (follow.orbitAngle || 0) + follow.orbitSpeed * dt;
            }

            const offset = follow.offset || { x: 0, y: 0 };
            const angle = follow.orbitAngle || 0;
            const rotated = rotateOffset(offset.x, offset.y, angle);
            const desiredX = target.transform.x + rotated.x;
            const desiredY = target.transform.y + rotated.y;

            const range = follow.range || { x: 0, y: 0 };
            let dx = desiredX - e.transform.x;
            let dy = desiredY - e.transform.y;

            if (range.x > 0 && Math.abs(dx) <= range.x) dx = 0;
            if (range.y > 0 && Math.abs(dy) <= range.y) dy = 0;

            if (dx === 0 && dy === 0) continue;

            const distance = Math.hypot(dx, dy);
            if (distance <= 0.0001) {
                e.transform.prevX = e.transform.x;
                e.transform.prevY = e.transform.y;
                e.transform.x = desiredX;
                e.transform.y = desiredY;
                continue;
            }

            const speed = Math.max(0, (follow.speed || 0) + distance * (follow.linearAccelFactor || 0));
            const step = speed * dt;
            if (step >= distance) {
                e.transform.prevX = e.transform.x;
                e.transform.prevY = e.transform.y;
                e.transform.x = desiredX;
                e.transform.y = desiredY;
            } else if (step > 0) {
                e.transform.prevX = e.transform.x;
                e.transform.prevY = e.transform.y;
                e.transform.x += (dx / distance) * step;
                e.transform.y += (dy / distance) * step;
            }
        }
    }
};
