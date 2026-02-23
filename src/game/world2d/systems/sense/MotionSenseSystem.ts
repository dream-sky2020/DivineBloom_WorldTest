import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { world } from '@world2d/world';

function resolveEntityByToken(token: string | number): IEntity | null {
  if (token === undefined || token === null || token === '') return null;

  if (token === 'player') {
    const result = world.with('player', 'transform').first;
    return result ? (result as IEntity) : null;
  }

  // 尝试匹配 ID, UUID, Name, Type, Tags
  const entities = world.with('transform');
  for (const entity of entities) {
    const e = entity as any;
    // 使用弱等于 (==) 来匹配 string/number 差异
    if (e.id == token || e.uuid == token || e.name == token || e.type == token) {
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

      // 1. 尝试解析 Entity ID (支持 number 或 string)
      if (targetConfig.entityId !== undefined && targetConfig.entityId !== null) {
        targetEntity = resolveEntityByToken(targetConfig.entityId);
      }
      // 2. 尝试解析 Tag
      else if (typeof targetConfig.tag === 'string' && targetConfig.tag.length > 0) {
        targetEntity = resolveEntityByToken(targetConfig.tag);
      }

      // 3. 获取坐标
      if (targetEntity?.transform) {
        targetX = targetEntity.transform.x;
        targetY = targetEntity.transform.y;
      } else if (targetConfig.position && typeof targetConfig.position.x === 'number' && typeof targetConfig.position.y === 'number') {
        targetX = targetConfig.position.x;
        targetY = targetConfig.position.y;
      }

      // 4. 应用偏移
      if (targetX != null && targetY != null && targetConfig.offset) {
        targetX += Number(targetConfig.offset.x || 0);
        targetY += Number(targetConfig.offset.y || 0);
      }

      // 5. 更新 Runtime
      motion.runtime.hasTarget = targetX != null && targetY != null;
      motion.runtime.targetEntityId = targetEntity
        ? (targetEntity.id ?? (targetEntity as any).uuid ?? (targetEntity as any).__id)
        : null;

      motion.runtime.targetPos = motion.runtime.hasTarget ? { x: targetX, y: targetY } : null;
    }
  }
};
