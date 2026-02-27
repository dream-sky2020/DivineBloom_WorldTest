import { createLogger } from '@/utils/logger';
import { getEntityId, IEntity } from '@definitions/interface/IEntity';
import { ISystem } from '@definitions/interface/ISystem';
import { damageQueue, world } from '@world2d/runtime/WorldEcsRuntime';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

const logger = createLogger('DamageApplySystem');

type TargetDamageAggregate = {
  damage: number;
  hits: number;
};

function indexHealthEntities(): Map<string, IEntity> {
  const map = new Map<string, IEntity>();
  const healthEntities = world.with('health');
  for (const entity of healthEntities) {
    const e = entity as IEntity;
    const id = getEntityId(e);
    if (id) map.set(id, e);
  }
  return map;
}

/**
 * DamageApplySystem
 * 仅负责消费 damageQueue，并把聚合后的伤害应用到实体 Health。
 */
export const DamageApplySystem: ISystem = {
  name: 'damage-apply',
  executionPolicy: ExecutionPolicy.RunningOnly,

  update(_dt: number) {
    const drained = damageQueue.drain();
    if (!drained || !Array.isArray(drained.mergedBuckets) || drained.mergedBuckets.length === 0) {
      return;
    }

    const aggregateByTarget = new Map<string, TargetDamageAggregate>();
    for (const bucket of drained.mergedBuckets) {
      if (!bucket || typeof bucket.targetId !== 'string' || bucket.targetId.length === 0) continue;

      const current = aggregateByTarget.get(bucket.targetId) || { damage: 0, hits: 0 };
      current.damage += bucket.totalDamage || 0;
      current.hits += bucket.hitCount || 0;
      aggregateByTarget.set(bucket.targetId, current);
    }

    if (aggregateByTarget.size === 0) return;

    const healthEntityIndex = indexHealthEntities();
    for (const [targetId, agg] of aggregateByTarget) {
      const entity = healthEntityIndex.get(targetId);
      if (!entity || !entity.health) continue;

      const appliedDamage = Math.max(0, agg.damage);
      const appliedHits = Math.max(0, Math.floor(agg.hits));
      if (appliedDamage <= 0 && appliedHits <= 0) continue;

      entity.health.currentHealth = Math.max(0, (entity.health.currentHealth || 0) - appliedDamage);
      entity.health.totalDamageTaken += appliedDamage;
      entity.health.totalHitCount += appliedHits;
      entity.health.lastDamageAmount = appliedDamage;
      entity.health.lastHitCount = appliedHits;
      entity.health.lastDamageTick = drained.tick;
    }

    if (drained.droppedEvents > 0 || drained.droppedDamage > 0 || drained.droppedHits > 0) {
      logger.warn('Damage buffer dropped part of events after fallback merge', {
        droppedEvents: drained.droppedEvents,
        droppedDamage: drained.droppedDamage,
        droppedHits: drained.droppedHits
      });
    }
  }
};
