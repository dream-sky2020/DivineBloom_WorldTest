import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { MotionMode } from '@components';
import { MotionStatus } from '@definitions/enums/MotionStatus';
import { world } from '@world2d/runtime/WorldEcsRuntime';

// --------------------------------------------------------------------------
// Vector Math Helpers
// --------------------------------------------------------------------------
const Vec2 = {
  add: (v1: { x: number; y: number }, v2: { x: number; y: number }) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
  sub: (v1: { x: number; y: number }, v2: { x: number; y: number }) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
  mul: (v: { x: number; y: number }, s: number) => ({ x: v.x * s, y: v.y * s }),
  mag: (v: { x: number; y: number }) => Math.hypot(v.x, v.y),
  normalize: (v: { x: number; y: number }) => {
    const m = Math.hypot(v.x, v.y);
    return m > 0 ? { x: v.x / m, y: v.y / m } : { x: 0, y: 0 };
  },
  dist: (v1: { x: number; y: number }, v2: { x: number; y: number }) => Math.hypot(v1.x - v2.x, v1.y - v2.y),
  limit: (v: { x: number; y: number }, max: number) => {
    const m = Math.hypot(v.x, v.y);
    if (m > max) {
      return { x: (v.x / m) * max, y: (v.y / m) * max };
    }
    return v;
  },
  rotate: (v: { x: number; y: number }, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
  }
};

// --------------------------------------------------------------------------
// Steering Behaviors
// --------------------------------------------------------------------------
const Steer = {
  seek: (currentPos: { x: number; y: number }, targetPos: { x: number; y: number }, maxSpeed: number, currentVel: { x: number; y: number }) => {
    const desired = Vec2.mul(Vec2.normalize(Vec2.sub(targetPos, currentPos)), maxSpeed);
    return Vec2.sub(desired, currentVel);
  },

  arrive: (currentPos: { x: number; y: number }, targetPos: { x: number; y: number }, maxSpeed: number, slowRadius: number, stopRadius: number, currentVel: { x: number; y: number }) => {
    const toTarget = Vec2.sub(targetPos, currentPos);
    const dist = Vec2.mag(toTarget);

    if (dist < stopRadius) return Vec2.sub({ x: 0, y: 0 }, currentVel); // Stop

    let speed = maxSpeed;
    if (dist < slowRadius) {
      speed = maxSpeed * (dist / slowRadius);
    }

    const desired = Vec2.mul(Vec2.normalize(toTarget), speed);
    return Vec2.sub(desired, currentVel);
  },

  separation: (currentPos: { x: number; y: number }, neighbors: IEntity[], separationRadius: number) => {
    let steering = { x: 0, y: 0 };
    let count = 0;

    for (const other of neighbors) {
      if (!other.transform) continue;
      const d = Vec2.dist(currentPos, other.transform);
      if (d > 0 && d < separationRadius) {
        const diff = Vec2.normalize(Vec2.sub(currentPos, other.transform));
        const weight = (separationRadius - d) / separationRadius; // 线性衰减
        steering = Vec2.add(steering, Vec2.mul(diff, weight));
        count++;
      }
    }

    if (count > 0) {
      steering = Vec2.mul(steering, 1 / count);
      steering = Vec2.normalize(steering);
    }
    return steering;
  },

  avoidObstacle: (currentPos: { x: number; y: number }, velocity: { x: number; y: number }, obstacles: IEntity[], lookAhead: number, radius: number) => {
    if (Vec2.mag(velocity) < 1) return { x: 0, y: 0 };

    const normalizedVel = Vec2.normalize(velocity);
    const lookAheadVec = Vec2.mul(normalizedVel, lookAhead);
    const ahead = Vec2.add(currentPos, lookAheadVec);

    let mostThreatening: IEntity | null = null;
    let nearestDist = Infinity;

    for (const obs of obstacles) {
      if (!obs.transform || !obs.shape) continue;

      const obsRadius = (obs.shape.radius || Math.max(obs.shape.width || 0, obs.shape.height || 0) / 2) || 20;
      const collisionRadius = obsRadius + radius * 1.5; // 稍微扩大一点

      // 1. 检查是否在前方
      const toObs = Vec2.sub(obs.transform, currentPos);
      const dot = toObs.x * normalizedVel.x + toObs.y * normalizedVel.y;

      if (dot < 0) continue; // 在背后

      // 2. 检查距离
      const dist = Vec2.mag(toObs);
      if (dist > lookAhead + collisionRadius) continue;

      // 3. 检查是否碰撞（投影距离）
      const projectedDist = Math.abs(toObs.x * -normalizedVel.y + toObs.y * normalizedVel.x);

      if (projectedDist < collisionRadius) {
        if (dist < nearestDist) {
          nearestDist = dist;
          mostThreatening = obs;
        }
      }
    }

    if (mostThreatening && mostThreatening.transform) {
      // 产生侧向力
      const avoidanceForce = Vec2.sub(ahead, mostThreatening.transform);
      return Vec2.normalize(avoidanceForce);
    }

    return { x: 0, y: 0 };
  }
};

/**
 * MotionIntentSystem
 * 小脑：负责感知环境，计算合力，输出期望速度。
 */
export const MotionIntentSystem: ISystem = {
  name: 'motion-intent',

  update(dt: number) {
    const entities = Array.from(world.with('motion', 'transform'));
    // 简单优化：只获取一次静态障碍物列表
    const obstacles = Array.from(world.with('collider')).filter((e: any) => e.collider?.isStatic);

    for (const entity of entities) {
      const e = entity as IEntity;
      const motion = (e as any).motion;
      const transform = e.transform;

      if (!motion || !transform) continue;

      // ----------------------------------------------------------------------
      // 1. 初始化与预处理
      // ----------------------------------------------------------------------
      if (!motion.runtime || typeof motion.runtime !== 'object') {
        motion.runtime = {
          elapsedTime: 0,
          pathDirection: 1,
          initialized: false,
          status: MotionStatus.IDLE,
          statusTime: 0,
          stuckTimer: 0,
          desiredVelocity: { x: 0, y: 0 },
          currentSpeed: 0
        };
      }

      motion.runtime.elapsedTime += dt;
      const profile = (e as any).motionSteerProfile;
      const weights = profile?.weights || {};
      const sensing = profile?.sensing || {};

      const maxSpeed = (motion.maxSpeed || 100) * (profile?.speedScale || 1);
      const currentVel = e.velocity || { x: 0, y: 0 };
      const currentPos = { x: transform.x, y: transform.y };

      if (!motion.enabled) {
        updateStatus(motion, MotionStatus.IDLE, dt);
        motion.runtime.desiredVelocity = { x: 0, y: 0 };
        continue;
      }

      // ----------------------------------------------------------------------
      // 2. 目标解析 (Resolution) - 确定 TargetPos
      // ----------------------------------------------------------------------
      const mode = motion.mode || MotionMode.NONE;
      let targetPos: { x: number; y: number } | null = null;
      let stopDist = motion.stopDistance || 5;

      if (mode === MotionMode.FOLLOW || mode === MotionMode.STEER_FOLLOW) {
        if (motion.runtime.hasTarget && motion.runtime.targetPos) {
          targetPos = motion.runtime.targetPos;
        }
      }
      else if (mode === MotionMode.ORBIT) {
        if (motion.runtime.hasTarget && motion.runtime.targetPos) {
          const orbit = motion.orbit || {};
          const sign = orbit.clockwise ? -1 : 1;
          orbit.angle = (orbit.angle || 0) + sign * (orbit.angularSpeed || 0) * dt;

          const center = motion.runtime.targetPos;
          const radius = orbit.radius || 50;
          const offset = Vec2.rotate({ x: radius, y: 0 }, orbit.angle);
          targetPos = Vec2.add(center, offset);
          stopDist = 2; // Orbit 需要精确到达
        }
      }
      else if (mode === MotionMode.PATH) {
        const path = motion.path || {};
        const waypoints = path.waypoints || [];
        if (waypoints.length > 0) {
          let index = path.currentIndex || 0;
          let point = waypoints[index];
          const dist = Vec2.dist(currentPos, point);

          if (dist <= (path.reachDistance || 10)) {
            // Reached waypoint, next
            const dir = motion.runtime.pathDirection || 1;
            if (path.pingPong) {
              if (index >= waypoints.length - 1) motion.runtime.pathDirection = -1;
              if (index <= 0) motion.runtime.pathDirection = 1;
              index += motion.runtime.pathDirection;
            } else {
              index++;
              if (index >= waypoints.length) index = path.loop ? 0 : waypoints.length - 1;
            }
            path.currentIndex = index;
            point = waypoints[index];
          }
          targetPos = point;
          stopDist = path.reachDistance || 5;
        }
      }
      else if (mode === MotionMode.LINE) {
        // 直线模式不需要 targetPos，直接设置方向
      }

      // ----------------------------------------------------------------------
      // 3. 计算转向力 (Steering Forces)
      // ----------------------------------------------------------------------
      let totalForce = { x: 0, y: 0 };
      const separationRadius = sensing.separationRadius || 50;
      const avoidDist = sensing.obstacleCheckDistance || 100;

      // A. Separation (分离) - 总是生效以保持个体距离
      if ((weights.separation || 0) > 0) {
        const sepForce = Steer.separation(currentPos, entities as IEntity[], separationRadius);
        totalForce = Vec2.add(totalForce, Vec2.mul(sepForce, weights.separation * maxSpeed));
      }

      // B. Obstacle Avoidance (避障)
      if ((weights.avoidObstacle || 0) > 0) {
        const avoidForce = Steer.avoidObstacle(currentPos, currentVel, obstacles as IEntity[], avoidDist, (e as any).shape?.radius || 15);
        totalForce = Vec2.add(totalForce, Vec2.mul(avoidForce, weights.avoidObstacle * maxSpeed * 3));
      }

      // C. Target Steering (寻路/抵达)
      let targetForce = { x: 0, y: 0 };

      // C.1 传送门吸引 (Shortcuts)
      const portalAttractWeight = weights.portalAttract || 0;
      if (portalAttractWeight > 0 && motion.runtime.portalSense?.bestPortal?.pos) {
        const portalPos = motion.runtime.portalSense.bestPortal.pos;
        const portalForce = Steer.seek(currentPos, portalPos, maxSpeed, currentVel);
        targetForce = Vec2.add(targetForce, Vec2.mul(portalForce, portalAttractWeight));
      }

      // C.2 主目标
      if (mode === MotionMode.LINE) {
        updateStatus(motion, MotionStatus.MOVING, dt);
        const dir = motion.line?.direction || { x: 1, y: 0 };
        const desired = Vec2.mul(Vec2.normalize(dir), motion.line?.speed || maxSpeed);
        const force = Vec2.sub(desired, currentVel);
        targetForce = Vec2.add(targetForce, force);
      }
      else if (targetPos) {
        const dist = Vec2.dist(currentPos, targetPos);
        if (dist <= stopDist) {
          updateStatus(motion, MotionStatus.ARRIVED, dt);
          // Arrived: slow down to stop
          targetForce = Vec2.sub({ x: 0, y: 0 }, currentVel);
        } else {
          updateStatus(motion, MotionStatus.MOVING, dt);
          const force = Steer.arrive(currentPos, targetPos, maxSpeed, stopDist + 100, stopDist, currentVel);
          targetForce = Vec2.add(targetForce, Vec2.mul(force, weights.arrive || 1));
        }
      } else {
        // No target
        if (mode !== MotionMode.NONE) {
          updateStatus(motion, MotionStatus.IDLE, dt);
        }
      }

      totalForce = Vec2.add(totalForce, targetForce);

      // ----------------------------------------------------------------------
      // 4. 物理积分与输出 (Integration)
      // ----------------------------------------------------------------------
      const maxForce = (motion.steer?.maxForce || 600);
      totalForce = Vec2.limit(totalForce, maxForce);

      // Desired Velocity for next frame
      let newVelocity = Vec2.add(currentVel, Vec2.mul(totalForce, dt));
      newVelocity = Vec2.limit(newVelocity, maxSpeed);

      // ----------------------------------------------------------------------
      // 5. 状态检测 (Stuck Detection)
      // ----------------------------------------------------------------------
      if (motion.runtime.status === MotionStatus.MOVING) {
        const actualMoveDist = Vec2.dist(currentPos, motion.runtime.lastPosition || currentPos);
        const expectedSpeed = Vec2.mag(newVelocity);

        // 如果期望速度很大，但实际移动距离很小 -> 卡住了
        if (expectedSpeed > maxSpeed * 0.2 && actualMoveDist < expectedSpeed * dt * 0.1) {
          motion.runtime.stuckTimer += dt;
          if (motion.runtime.stuckTimer > 0.5) {
            updateStatus(motion, MotionStatus.STUCK, dt);
          }
        } else {
          motion.runtime.stuckTimer = 0;
          if (motion.runtime.status === MotionStatus.STUCK) {
            updateStatus(motion, MotionStatus.MOVING, dt);
          }
        }
      }

      motion.runtime.lastPosition = { ...currentPos };
      motion.runtime.desiredVelocity = newVelocity;
      motion.runtime.currentSpeed = Vec2.mag(currentVel);
    }
  }
};

function updateStatus(motion: any, newStatus: MotionStatus, dt: number) {
  if (motion.runtime.status !== newStatus) {
    motion.runtime.status = newStatus;
    motion.runtime.statusTime = 0;
  } else {
    motion.runtime.statusTime += dt;
  }
}
