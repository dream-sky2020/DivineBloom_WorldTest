import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { world } from '@world2d/runtime/WorldEcsRuntime';

// --------------------------------------------------------------------------
// Math Helpers
// --------------------------------------------------------------------------
const MathUtils = {
  lerp: (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t)),

  // 角度差 (最短路径)
  angleDiff: (from: number, to: number) => {
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
  },

  // 角度插值
  lerpAngle: (from: number, to: number, maxDelta: number) => {
    const diff = MathUtils.angleDiff(from, to);
    const clampedDelta = Math.min(Math.abs(diff), maxDelta);
    return from + Math.sign(diff) * clampedDelta;
  },

  approach: (current: number, target: number, maxDelta: number): number => {
    if (maxDelta <= 0) return target;
    const delta = target - current;
    if (Math.abs(delta) <= maxDelta) return target;
    return current + Math.sign(delta) * maxDelta;
  }
};

/**
 * MotionControlSystem
 * 脊髓：负责物理层面的执行，将期望速度转化为实际速度，处理惯性、转向率等物理限制。
 */
export const MotionControlSystem: ISystem = {
  name: 'motion-control',

  update(dt: number) {
    const entities = world.with('motion', 'transform');
    for (const entity of entities) {
      const e = entity as IEntity;
      const motion = (e as any).motion;
      if (!motion || !e.transform) continue;
      const runtime = (motion.runtime && typeof motion.runtime === 'object') ? motion.runtime : (motion.runtime = {});
      const req = runtime.teleportRequest;
      if (req) {
        e.transform.prevX = req.x;
        e.transform.prevY = req.y;
        e.transform.x = req.x;
        e.transform.y = req.y;
        if (!req.keepVelocity && e.velocity) {
          e.velocity.x = 0;
          e.velocity.y = 0;
        }
        runtime.desiredVelocity = { x: 0, y: 0 };
        runtime.teleportRequest = null;
        continue;
      }

      const desired = runtime.desiredVelocity || { x: 0, y: 0 };
      const desiredX = Number(desired.x || 0);
      const desiredY = Number(desired.y || 0);

      const accel = Math.max(0, Number(motion.acceleration || 480));
      const decel = Math.max(0, Number(motion.deceleration || 480));
      const turnRate = Number(motion.turnRate || 9999); // rad/s (9999 means instant)

      if (e.velocity) {
        const currentX = Number(e.velocity.x || 0);
        const currentY = Number(e.velocity.y || 0);

        // 1. 计算当前与期望的速度/角度
        const currentSpeed = Math.hypot(currentX, currentY);
        const currentAngle = Math.atan2(currentY, currentX);

        const desiredSpeed = Math.hypot(desiredX, desiredY);
        const desiredAngle = Math.atan2(desiredY, desiredX);

        // 2. 速度大小控制 (Acceleration / Deceleration)
        // 如果正在加速（目标速度 > 当前速度），使用 accel；否则使用 decel
        const isAccelerating = desiredSpeed > currentSpeed;
        const speedDelta = (isAccelerating ? accel : decel) * dt;
        let newSpeed = MathUtils.approach(currentSpeed, desiredSpeed, speedDelta);

        // 3. 转向控制 (Turn Rate)
        // 只有当有速度时，转向才有意义。如果静止，可以直接设定角度（或者保持）
        let newAngle = currentAngle;
        if (desiredSpeed > 1) { // 只有在有移动意图时才转向
          // 如果当前几乎静止，直接吸附到目标角度（避免原地缓慢旋转）
          if (currentSpeed < 10) {
            newAngle = desiredAngle;
          } else {
            // 如果 turnRate 很大，直接吸附
            if (turnRate >= 999) {
              newAngle = desiredAngle;
            } else {
              // 使用 lerpAngle 进行平滑插值
              const diff = MathUtils.angleDiff(currentAngle, desiredAngle);
              const maxTurn = turnRate * dt;
              if (Math.abs(diff) <= maxTurn) {
                newAngle = desiredAngle;
              } else {
                newAngle = currentAngle + Math.sign(diff) * maxTurn;
              }
            }
          }
        }

        // 4. 合成新速度
        e.velocity.x = Math.cos(newAngle) * newSpeed;
        e.velocity.y = Math.sin(newAngle) * newSpeed;

        // 如果速度极小，直接置零以防抖动
        if (newSpeed < 1) {
          e.velocity.x = 0;
          e.velocity.y = 0;
        }

      } else {
        // 无 Velocity 组件，直接修改 Transform (瞬移/运动学)
        e.transform.prevX = e.transform.x;
        e.transform.prevY = e.transform.y;
        e.transform.x += desiredX * dt;
        e.transform.y += desiredY * dt;
      }
    }
  }
};
