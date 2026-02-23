import { ISystem } from '@definitions/interface/ISystem';
import { spawnGroupCountMap, world } from '@world2d/world';

export const SpawnerSenseSystem: ISystem = {
  name: 'spawner-sense',

  update(dt: number = 0) {
    for (const entity of world.with('spawn')) {
      const spawn = (entity as any).spawn;
      if (!spawn) continue;

      const spawnGroup = String(spawn.spawnGroup || '');
      const currentCount = spawnGroupCountMap.get(spawnGroup) ?? 0;
      const spawnLimit = Math.max(0, Number(spawn.spawnLimit ?? 0));

      spawn.currentCount = currentCount;
      spawn.isAtLimit = currentCount >= spawnLimit;
      spawn.cooldown = Math.max(0, Number(spawn.cooldown || 0) - dt);
    }
  }
};

