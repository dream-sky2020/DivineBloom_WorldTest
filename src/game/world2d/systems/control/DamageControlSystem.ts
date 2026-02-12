import { createLogger } from '@/utils/logger';
import { IEntity } from '@definitions/interface/IEntity';
import { ISystem } from '@definitions/interface/ISystem';
import { damageQueue, world } from '@world2d/world';

const logger = createLogger('DamageControlSystem');

type TargetDamageAggregate = {
  damage: number;
  hits: number;
};

function indexHealthEntities(): Map<string, IEntity> {
  const map = new Map<string, IEntity>();
  const healthEntities = world.with('health');
  for (const entity of healthEntities) {
    const e = entity as IEntity;
    const idCandidates = [e.id, e.uuid, (e as any).__id];
    for (const id of idCandidates) {
      if (id == null) continue;
      map.set(String(id), e);
    }
  }
  return map;
}

/**
 * DamageControlSystem
 * 消费全局 damageQueue 的 mergedBuckets，并按 targetId 一次性回写 damage/health。
 */
export const DamageControlSystem: ISystem = {
  name: 'damage-control',

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

      // 扣除血量
      entity.health.currentHealth = Math.max(0, (entity.health.currentHealth || 0) - appliedDamage);

      // 更新受伤统计信息 (Health 组件已包含原 Damaged 功能)
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
