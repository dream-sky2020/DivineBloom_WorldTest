import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { world } from '@world2d/world';

function approach(current: number, target: number, maxDelta: number): number {
  if (maxDelta <= 0) return target;
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) return target;
  return current + Math.sign(delta) * maxDelta;
}

/**
 * MotionControlSystem
 * 消费 MotionIntent 生成的期望速度，并写回 velocity/transform。
 */
export const MotionControlSystem: ISystem = {
  name: 'motion-control',

  update(dt: number) {
    const entities = world.with('motion', 'transform');
    for (const entity of entities) {
      const e = entity as IEntity;
      const motion = (e as any).motion;
      if (!motion || !e.transform) continue;

      const desired = motion.runtime?.desiredVelocity || { x: 0, y: 0 };
      const desiredX = Number(desired.x || 0);
      const desiredY = Number(desired.y || 0);
      const accel = Math.max(0, Number(motion.acceleration || 0));
      const decel = Math.max(0, Number(motion.deceleration || 0));

      if (e.velocity) {
        const currentX = Number(e.velocity.x || 0);
        const currentY = Number(e.velocity.y || 0);
        const speedingUp = Math.hypot(desiredX, desiredY) > Math.hypot(currentX, currentY);
        const maxDelta = (speedingUp ? accel : decel) * dt;
        e.velocity.x = approach(currentX, desiredX, maxDelta);
        e.velocity.y = approach(currentY, desiredY, maxDelta);
      } else {
        e.transform.prevX = e.transform.x;
        e.transform.prevY = e.transform.y;
        e.transform.x += desiredX * dt;
        e.transform.y += desiredY * dt;
      }
    }
  }
};
