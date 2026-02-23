import { ISystem } from '@definitions/interface/ISystem';
import {
  spawnGroupCountMap,
  setShouldUpdateComponentCountMap,
  shouldUpdateSpawnGroupCountMap,
  world
} from '@world2d/world';

/**
 * Component Count Sense System
 * 维护 world.ts 中共享的生成分组实体数量缓存。
 */
export const ComponentCountSenseSystem: ISystem = {
  name: 'component-count-sense',

  init() {
    // Ensure first frame builds cache.
    setShouldUpdateComponentCountMap(true);
  },

  update() {
    if (!shouldUpdateSpawnGroupCountMap) return;

    spawnGroupCountMap.clear();

    for (const entity of world.with('spawnMask')) {
      const group = String((entity as any)?.spawnMask?.group || '').trim();
      if (!group) continue;
      const nextCount = (spawnGroupCountMap.get(group) ?? 0) + 1;
      spawnGroupCountMap.set(group, nextCount);
    }

    setShouldUpdateComponentCountMap(false);
  }
};

