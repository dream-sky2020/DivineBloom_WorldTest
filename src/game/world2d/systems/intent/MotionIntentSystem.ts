import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { MotionMode } from '@components';
import { world } from '@world2d/world';

function normalize(x: number, y: number): { x: number; y: number; len: number } {
  const len = Math.hypot(x, y);
  if (!len) return { x: 0, y: 0, len: 0 };
  return { x: x / len, y: y / len, len };
}

function rotateOffset(x: number, y: number, angle: number) {
  if (!angle) return { x, y };
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

function clampSpeed(speed: number, min: number, max: number) {
  return Math.max(min, Math.min(max, speed));
}

/**
 * MotionIntentSystem
 * 根据感知目标和模式，计算期望速度并写入 motion.runtime.desiredVelocity。
 */
export const MotionIntentSystem: ISystem = {
  name: 'motion-intent',

  update(dt: number) {
    const entities = world.with('motion', 'transform');
    for (const entity of entities) {
      const e = entity as IEntity;
      const motion = (e as any).motion;
      if (!motion || !e.transform) continue;
      if (!motion.runtime) motion.runtime = { elapsedTime: 0, pathDirection: 1, initialized: false };

      motion.runtime.elapsedTime = Number(motion.runtime.elapsedTime || 0) + dt;
      let vx = 0;
      let vy = 0;

      if (!motion.enabled) {
        motion.runtime.desiredVelocity = { x: 0, y: 0 };
        continue;
      }

      const mode = motion.mode || MotionMode.NONE;
      const profile = (e as any).motionSteerProfile;
      const speedScale = Math.max(0, Number(profile?.speedScale ?? 1));
      const distanceSpeedScale = Math.max(0, Number(profile?.distanceSpeedScale ?? 1));
      const portalAttractWeight = Math.max(0, Number(profile?.weights?.portalAttract ?? 0));

      const maxSpeed = Math.max(0, Number(motion.maxSpeed || 0)) * speedScale;
      const minSpeed = Math.max(0, Number(motion.minSpeed || 0));
      const stopDistance = Math.max(0, Number(motion.stopDistance || 0));
      const deadZone = Math.max(0, Number(motion.deadZone || 0));
      const deadZoneAxis = motion.deadZoneAxis || { x: 0, y: 0 };
      const distanceSpeedFactor = Number(motion.distanceSpeedFactor || 0) * distanceSpeedScale;

      if (mode === MotionMode.LINE) {
        const dir = normalize(Number(motion.line?.direction?.x || 0), Number(motion.line?.direction?.y || 0));
        const baseSpeed = Number(motion.line?.speed || 0) > 0 ? Number(motion.line.speed) : maxSpeed;
        const speed = clampSpeed(baseSpeed, minSpeed, maxSpeed || baseSpeed);
        vx = dir.x * speed;
        vy = dir.y * speed;
      } else if (mode === MotionMode.PATH) {
        const path = motion.path || {};
        const waypoints = Array.isArray(path.waypoints) ? path.waypoints : [];
        if (waypoints.length > 0) {
          let index = Math.max(0, Math.min(waypoints.length - 1, Number(path.currentIndex || 0)));
          const point = waypoints[index] || { x: e.transform.x, y: e.transform.y };
          let dx = Number(point.x || 0) - e.transform.x;
          let dy = Number(point.y || 0) - e.transform.y;
          const dist = Math.hypot(dx, dy);
          const reachDistance = Math.max(0, Number(path.reachDistance || 0));
          if (dist <= reachDistance) {
            const dir = Number(motion.runtime.pathDirection || 1) >= 0 ? 1 : -1;
            if (path.pingPong) {
              if (index >= waypoints.length - 1) motion.runtime.pathDirection = -1;
              if (index <= 0) motion.runtime.pathDirection = 1;
              index += Number(motion.runtime.pathDirection || dir);
            } else {
              index += 1;
              if (index >= waypoints.length) {
                index = path.loop ? 0 : waypoints.length - 1;
              }
            }
            path.currentIndex = Math.max(0, Math.min(waypoints.length - 1, index));
            const nextPoint = waypoints[path.currentIndex] || point;
            dx = Number(nextPoint.x || 0) - e.transform.x;
            dy = Number(nextPoint.y || 0) - e.transform.y;
          }
          const dir = normalize(dx, dy);
          vx = dir.x * maxSpeed;
          vy = dir.y * maxSpeed;
        }
      } else {
        const hasTarget = !!motion.runtime.hasTarget && motion.runtime.targetPos;
        let targetX = hasTarget ? Number(motion.runtime.targetPos.x || 0) : e.transform.x;
        let targetY = hasTarget ? Number(motion.runtime.targetPos.y || 0) : e.transform.y;

        if (hasTarget && mode === MotionMode.ORBIT) {
          const orbit = motion.orbit || {};
          const sign = orbit.clockwise ? -1 : 1;
          orbit.angle = Number(orbit.angle || 0) + sign * Number(orbit.angularSpeed || 0) * dt;
          const offset = motion.target?.offset || { x: 0, y: 0 };
          const radius = Math.max(0, Number(orbit.radius || 0));
          const baseX = Number(offset.x || 0);
          const baseY = Number(offset.y || 0);
          const sourceX = baseX !== 0 || baseY !== 0 ? baseX : radius;
          const sourceY = baseX !== 0 || baseY !== 0 ? baseY : 0;
          const rotated = rotateOffset(sourceX, sourceY, Number(orbit.angle || 0));
          targetX = Number(motion.runtime.targetPos.x || 0) + rotated.x;
          targetY = Number(motion.runtime.targetPos.y || 0) + rotated.y;
        }

        let dx = targetX - e.transform.x;
        let dy = targetY - e.transform.y;
        if (Math.abs(dx) <= Math.max(deadZone, Number(deadZoneAxis.x || 0))) dx = 0;
        if (Math.abs(dy) <= Math.max(deadZone, Number(deadZoneAxis.y || 0))) dy = 0;
        const dir = normalize(dx, dy);

        if (hasTarget && dir.len > 0.0001) {
          if (dir.len <= stopDistance) {
            vx = 0;
            vy = 0;
          } else {
            const baseSpeed = maxSpeed + dir.len * distanceSpeedFactor;
            const speed = clampSpeed(baseSpeed, minSpeed, Math.max(maxSpeed, baseSpeed));
            vx = dir.x * speed;
            vy = dir.y * speed;
          }
        }
      }

      if (motion.wave?.enabled) {
        const n = normalize(vx, vy);
        if (n.len > 0) {
          const amp = Number(motion.wave.amplitude || 0);
          const freq = Number(motion.wave.frequency || 0);
          const phase = Number(motion.wave.phase || 0);
          const w = Math.sin(motion.runtime.elapsedTime * freq + phase) * amp;
          vx += -n.y * w;
          vy += n.x * w;
        }
      }

      // 融合传送门捷径 steer（由 MotionPortalSenseSystem 提供）
      if (portalAttractWeight > 0) {
        const bestPortal = motion.runtime?.portalSense?.bestPortal;
        if (bestPortal?.pos) {
          const dirPortal = normalize(
            Number(bestPortal.pos.x || 0) - e.transform.x,
            Number(bestPortal.pos.y || 0) - e.transform.y
          );
          if (dirPortal.len > 0.0001) {
            const baseSpeed = Math.max(Math.hypot(vx, vy), maxSpeed);
            const guideVx = dirPortal.x * baseSpeed;
            const guideVy = dirPortal.y * baseSpeed;
            const w = portalAttractWeight;
            vx = (vx + guideVx * w) / (1 + w);
            vy = (vy + guideVy * w) / (1 + w);
          }
        }
      }

      motion.runtime.desiredVelocity = { x: vx, y: vy };
    }
  }
};
