import { getEntityId, IEntity } from '@definitions/interface/IEntity';
import { ISystem } from '@definitions/interface/ISystem';
import { damageQueue, world } from '@world2d/runtime/WorldEcsRuntime';

type DamageDetectRuntime = {
  activeHits?: Set<string>;
  lastHits?: Set<string>;
  fullResults?: any[];
};

type DamageRuntime = {
  sourceId?: string | null;
  amount?: number;
  maxHitCount?: number;
  remainingHitCount?: number;
  damageFalloffPerHit?: number;
  minDamage?: number;
};

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

function resolveTargetId(hitId: string, hitResult: any): string {
  if (typeof hitResult?.id === 'string' && hitResult.id.length > 0) return hitResult.id;
  return hitId;
}

function computeHitDamage(damage: DamageRuntime): number {
  const baseAmount = typeof damage.amount === 'number' ? damage.amount : 0;
  const remaining = Math.max(0, Math.floor(damage.remainingHitCount ?? 0));
  const maxHitCount = Math.max(0, Math.floor(damage.maxHitCount ?? remaining));
  const consumed = Math.max(0, maxHitCount - remaining);
  const falloff = typeof damage.damageFalloffPerHit === 'number' ? damage.damageFalloffPerHit : 0;
  const minDamage = typeof damage.minDamage === 'number' ? damage.minDamage : 0;
  return Math.max(minDamage, baseAmount - consumed * falloff);
}

/**
 * DamageProcessSystem
 * 仅负责把 DamageDetect 的双缓冲命中结果转成 DamageEvent 并写入 damageQueue。
 */
export const DamageProcessSystem: ISystem = {
  name: 'damage-process',
  executionPolicy: ExecutionPolicy.RunningOnly,

  update(_dt: number) {
    const attackers = world.with('damageDetect', 'damage');
    for (const entity of attackers) {
      const attacker = entity as IEntity;
      const detect = attacker.damageDetect as DamageDetectRuntime | undefined;
      const damage = attacker.damage as DamageRuntime | undefined;
      if (!detect || !damage) continue;

      const remaining = Math.max(0, Math.floor(damage.remainingHitCount ?? 0));
      if (remaining <= 0) continue;

      const activeHits = detect.activeHits instanceof Set ? detect.activeHits : new Set<string>();
      const lastHits = detect.lastHits instanceof Set ? detect.lastHits : new Set<string>();
      if (activeHits.size === 0) continue;

      const enteredHits: string[] = [];
      for (const hitId of activeHits) {
        if (!lastHits.has(hitId)) enteredHits.push(hitId);
      }
      if (enteredHits.length === 0) continue;

      const hitResultById = new Map<string, any>();
      if (Array.isArray(detect.fullResults)) {
        for (const hit of detect.fullResults) {
          if (typeof hit?.id === 'string' && hit.id.length > 0) {
            hitResultById.set(hit.id, hit);
          }
        }
      }

      const fallbackSourceId = getEntityId(attacker) || null;
      const sourceId = typeof damage.sourceId === 'string' && damage.sourceId.length > 0
        ? damage.sourceId
        : fallbackSourceId;

      for (const hitId of enteredHits) {
        const currentRemaining = Math.max(0, Math.floor(damage.remainingHitCount ?? 0));
        if (currentRemaining <= 0) break;

        const amount = computeHitDamage(damage);
        if (!(amount > 0)) continue;

        const hitResult = hitResultById.get(hitId);
        const targetId = resolveTargetId(hitId, hitResult);
        if (!targetId) continue;

        const accepted = damageQueue.emit({
          targetId,
          sourceId,
          amount
        });

        if (accepted) {
          damage.remainingHitCount = Math.max(0, currentRemaining - 1);
        }
      }
    }
  }
};
