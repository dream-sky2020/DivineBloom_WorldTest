import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { world } from '@world2d/world';

function resolveEntityByToken(token: string): IEntity | null {
  if (!token) return null;
  if (token === 'player') {
    return world.with('player', 'transform').first as IEntity;
  }

  const entities = world.with('transform');
  for (const entity of entities) {
    const e = entity as any;
    if (e.id === token || e.__id === token || e.uuid === token || e.name === token || e.type === token) {
      return e as IEntity;
    }
    if (Array.isArray(e.tags) && e.tags.includes(token)) {
      return e as IEntity;
    }
  }
  return null;
}

/**
 * MotionSenseSystem
 * 负责确认 Motion 目标实体与目标位置，并写入 motion.runtime。
 */
export const MotionSenseSystem: ISystem = {
  name: 'motion-sense',

  update(_dt: number) {
    const entities = world.with('motion', 'transform');
    for (const entity of entities) {
      const e = entity as IEntity;
      const motion = (e as any).motion;
      if (!motion || !e.transform) continue;

      if (!motion.runtime || typeof motion.runtime !== 'object') {
        motion.runtime = { elapsedTime: 0, pathDirection: 1, initialized: false };
      }

      const targetConfig = motion.target || {};
      let targetEntity: IEntity | null = null;
      let targetX: number | null = null;
      let targetY: number | null = null;

      if (typeof targetConfig.entityId === 'string' && targetConfig.entityId.length > 0) {
        targetEntity = resolveEntityByToken(targetConfig.entityId);
      } else if (typeof targetConfig.tag === 'string' && targetConfig.tag.length > 0) {
        targetEntity = resolveEntityByToken(targetConfig.tag);
      }

      if (targetEntity?.transform) {
        targetX = targetEntity.transform.x;
        targetY = targetEntity.transform.y;
      } else if (targetConfig.position && typeof targetConfig.position.x === 'number' && typeof targetConfig.position.y === 'number') {
        targetX = targetConfig.position.x;
        targetY = targetConfig.position.y;
      }

      if (targetX != null && targetY != null && targetConfig.offset) {
        targetX += Number(targetConfig.offset.x || 0);
        targetY += Number(targetConfig.offset.y || 0);
      }

      motion.runtime.hasTarget = targetX != null && targetY != null;
      motion.runtime.targetEntityId = targetEntity ? String((targetEntity as any).uuid ?? targetEntity.id ?? (targetEntity as any).__id ?? '') : null;
      motion.runtime.targetPos = motion.runtime.hasTarget ? { x: targetX, y: targetY } : null;
    }
  }
};
