export const MAX_DAMAGE_EVENTS_PER_TICK = 4096;
export const DEFAULT_SOFT_RAW_LIMIT = 1024;
export const DEFAULT_HARD_RAW_LIMIT = 2048;
export const DEFAULT_MAX_MERGED_BUCKETS = 1024;
export const DEFAULT_COMPACT_BATCH_SIZE = 256;

export type DamageMergeLevel = 0 | 1 | 2 | 3;

export type DamageEventInput = {
  targetId: string;
  sourceId?: string | null;
  amount: number;
  damageType?: string;
  skillId?: string | null;
  tick?: number;
};

export type DamageEventData = {
  targetId: string;
  sourceId: string | null;
  amount: number;
  damageType: string;
  skillId: string | null;
  tick: number;
};

export type DamageMergedBucket = {
  key: string;
  mergeLevel: DamageMergeLevel;
  targetId: string;
  sourceId: string | null;
  damageType: string | null;
  skillId: string | null;
  totalDamage: number;
  hitCount: number;
  firstTick: number;
  lastTick: number;
};

export type DamageEventBufferConfig = {
  softRawLimit: number;
  hardRawLimit: number;
  maxMergedBuckets: number;
  compactBatchSize: number;
};

export type DamageEventBufferData = {
  tick: number;
  rawEvents: DamageEventData[];
  rawReadIndex: number;
  mergedBuckets: DamageMergedBucket[];
  mergedIndexByKey: Record<string, number>;
  droppedEvents: number;
  droppedDamage: number;
  droppedHits: number;
  config: DamageEventBufferConfig;
};

export type DrainDamageEventResult = {
  tick: number;
  mergedBuckets: DamageMergedBucket[];
  droppedEvents: number;
  droppedDamage: number;
  droppedHits: number;
};

function sanitizeConfig(config?: Partial<DamageEventBufferConfig>): DamageEventBufferConfig {
  const softRawLimit = Math.max(64, Math.floor(config?.softRawLimit ?? DEFAULT_SOFT_RAW_LIMIT));
  const hardRawLimit = Math.max(softRawLimit, Math.floor(config?.hardRawLimit ?? DEFAULT_HARD_RAW_LIMIT));
  const maxMergedBuckets = Math.max(64, Math.floor(config?.maxMergedBuckets ?? DEFAULT_MAX_MERGED_BUCKETS));
  const compactBatchSize = Math.max(16, Math.floor(config?.compactBatchSize ?? DEFAULT_COMPACT_BATCH_SIZE));
  return { softRawLimit, hardRawLimit, maxMergedBuckets, compactBatchSize };
}

function getPendingRawCount(buffer: DamageEventBufferData): number {
  return buffer.rawEvents.length - buffer.rawReadIndex;
}

function normalizeDamageEvent(event: DamageEventInput, currentTick: number): DamageEventData | null {
  if (!event || typeof event.targetId !== 'string' || event.targetId.length === 0) return null;
  if (typeof event.amount !== 'number' || !Number.isFinite(event.amount) || event.amount <= 0) return null;

  return {
    targetId: event.targetId,
    sourceId: typeof event.sourceId === 'string' ? event.sourceId : null,
    amount: event.amount,
    damageType: typeof event.damageType === 'string' && event.damageType.length > 0 ? event.damageType : 'physical',
    skillId: typeof event.skillId === 'string' ? event.skillId : null,
    tick: typeof event.tick === 'number' && Number.isFinite(event.tick) ? Math.max(0, Math.floor(event.tick)) : currentTick
  };
}

function buildMergeKey(event: DamageEventData, level: DamageMergeLevel): string {
  switch (level) {
    case 0:
      return `L0|${event.targetId}|${event.sourceId ?? '*'}|${event.damageType}|${event.skillId ?? '*'}`;
    case 1:
      return `L1|${event.targetId}|${event.sourceId ?? '*'}|${event.damageType}|*`;
    case 2:
      return `L2|${event.targetId}|*|${event.damageType}|*`;
    default:
      return `L3|${event.targetId}|*|*|*`;
  }
}

function rebuildMergedIndex(buffer: DamageEventBufferData): void {
  const indexByKey: Record<string, number> = {};
  for (let i = 0; i < buffer.mergedBuckets.length; i++) {
    indexByKey[buffer.mergedBuckets[i].key] = i;
  }
  buffer.mergedIndexByKey = indexByKey;
}

function addToBucket(bucket: DamageMergedBucket, event: DamageEventData): void {
  bucket.totalDamage += event.amount;
  bucket.hitCount += 1;
  if (event.tick < bucket.firstTick) bucket.firstTick = event.tick;
  if (event.tick > bucket.lastTick) bucket.lastTick = event.tick;
}

function collapseTargetBuckets(buffer: DamageEventBufferData, targetId: string): boolean {
  let totalDamage = 0;
  let hitCount = 0;
  let firstTick = Number.MAX_SAFE_INTEGER;
  let lastTick = 0;
  const kept: DamageMergedBucket[] = [];

  for (const bucket of buffer.mergedBuckets) {
    if (bucket.targetId !== targetId) {
      kept.push(bucket);
      continue;
    }
    totalDamage += bucket.totalDamage;
    hitCount += bucket.hitCount;
    if (bucket.firstTick < firstTick) firstTick = bucket.firstTick;
    if (bucket.lastTick > lastTick) lastTick = bucket.lastTick;
  }

  if (hitCount === 0) return false;

  const collapsedKey = `L3|${targetId}|*|*|*`;
  const existingIndex = kept.findIndex((b) => b.key === collapsedKey);
  if (existingIndex >= 0) {
    kept[existingIndex].totalDamage += totalDamage;
    kept[existingIndex].hitCount += hitCount;
    if (firstTick < kept[existingIndex].firstTick) kept[existingIndex].firstTick = firstTick;
    if (lastTick > kept[existingIndex].lastTick) kept[existingIndex].lastTick = lastTick;
  } else {
    kept.push({
      key: collapsedKey,
      mergeLevel: 3,
      targetId,
      sourceId: null,
      damageType: null,
      skillId: null,
      totalDamage,
      hitCount,
      firstTick,
      lastTick
    });
  }

  buffer.mergedBuckets = kept;
  rebuildMergedIndex(buffer);
  return true;
}

function mergeEventWithFallback(buffer: DamageEventBufferData, event: DamageEventData): boolean {
  for (let level: DamageMergeLevel = 0; level <= 3; level = (level + 1) as DamageMergeLevel) {
    const key = buildMergeKey(event, level);
    const index = buffer.mergedIndexByKey[key];
    if (index != null) {
      addToBucket(buffer.mergedBuckets[index], event);
      return true;
    }

    if (buffer.mergedBuckets.length < buffer.config.maxMergedBuckets) {
      buffer.mergedIndexByKey[key] = buffer.mergedBuckets.length;
      buffer.mergedBuckets.push({
        key,
        mergeLevel: level,
        targetId: event.targetId,
        sourceId: level <= 1 ? event.sourceId : null,
        damageType: level <= 2 ? event.damageType : null,
        skillId: level === 0 ? event.skillId : null,
        totalDamage: event.amount,
        hitCount: 1,
        firstTick: event.tick,
        lastTick: event.tick
      });
      return true;
    }
  }

  if (collapseTargetBuckets(buffer, event.targetId)) {
    const coarseKey = buildMergeKey(event, 3);
    const coarseIndex = buffer.mergedIndexByKey[coarseKey];
    if (coarseIndex != null) {
      addToBucket(buffer.mergedBuckets[coarseIndex], event);
      return true;
    }
  }

  buffer.droppedEvents += 1;
  buffer.droppedDamage += event.amount;
  buffer.droppedHits += 1;
  return false;
}

export function createDamageEventBuffer(data?: {
  tick?: number;
  config?: Partial<DamageEventBufferConfig>;
}): DamageEventBufferData {
  return {
    tick: Math.max(0, Math.floor(data?.tick ?? 0)),
    rawEvents: [],
    rawReadIndex: 0,
    mergedBuckets: [],
    mergedIndexByKey: {},
    droppedEvents: 0,
    droppedDamage: 0,
    droppedHits: 0,
    config: sanitizeConfig(data?.config)
  };
}

export function clearDamageEventBuffer(buffer: DamageEventBufferData, nextTick?: number): void {
  buffer.rawEvents.length = 0;
  buffer.rawReadIndex = 0;
  buffer.mergedBuckets.length = 0;
  buffer.mergedIndexByKey = {};
  buffer.droppedEvents = 0;
  buffer.droppedDamage = 0;
  buffer.droppedHits = 0;
  if (typeof nextTick === 'number') {
    buffer.tick = Math.max(0, Math.floor(nextTick));
  }
}

export function compactDamageEventBuffer(
  buffer: DamageEventBufferData,
  budget = DEFAULT_COMPACT_BATCH_SIZE
): number {
  if (budget <= 0) return 0;
  let processed = 0;
  const end = Math.min(buffer.rawEvents.length, buffer.rawReadIndex + budget);

  while (buffer.rawReadIndex < end) {
    const event = buffer.rawEvents[buffer.rawReadIndex];
    buffer.rawReadIndex += 1;
    processed += 1;
    mergeEventWithFallback(buffer, event);
  }

  // Avoid keeping an always-growing array after partial compaction.
  if (buffer.rawReadIndex === buffer.rawEvents.length) {
    buffer.rawEvents.length = 0;
    buffer.rawReadIndex = 0;
  } else if (buffer.rawReadIndex >= 256 && buffer.rawReadIndex * 2 >= buffer.rawEvents.length) {
    buffer.rawEvents = buffer.rawEvents.slice(buffer.rawReadIndex);
    buffer.rawReadIndex = 0;
  }

  return processed;
}

export function pushDamageEvent(
  buffer: DamageEventBufferData,
  eventInput: DamageEventInput
): boolean {
  const event = normalizeDamageEvent(eventInput, buffer.tick);
  if (!event) return false;

  if (getPendingRawCount(buffer) >= buffer.config.hardRawLimit) {
    compactDamageEventBuffer(buffer, buffer.config.compactBatchSize * 2);
  }

  if (getPendingRawCount(buffer) >= buffer.config.hardRawLimit) {
    // Raw queue is still full, merge directly as an emergency path.
    return mergeEventWithFallback(buffer, event);
  }

  buffer.rawEvents.push(event);

  if (getPendingRawCount(buffer) >= buffer.config.softRawLimit) {
    compactDamageEventBuffer(buffer, buffer.config.compactBatchSize);
  }

  return true;
}

export function drainDamageEventBuffer(buffer: DamageEventBufferData): DrainDamageEventResult {
  // Compact all pending raw events before draining.
  const pending = getPendingRawCount(buffer);
  if (pending > 0) {
    compactDamageEventBuffer(buffer, pending);
    while (getPendingRawCount(buffer) > 0) {
      compactDamageEventBuffer(buffer, buffer.config.compactBatchSize);
    }
  }

  const result: DrainDamageEventResult = {
    tick: buffer.tick,
    mergedBuckets: buffer.mergedBuckets.map((bucket) => ({ ...bucket })),
    droppedEvents: buffer.droppedEvents,
    droppedDamage: buffer.droppedDamage,
    droppedHits: buffer.droppedHits
  };

  clearDamageEventBuffer(buffer, buffer.tick + 1);
  return result;
}
