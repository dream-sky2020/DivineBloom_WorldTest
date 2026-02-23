import { ISystem } from '@definitions/interface/ISystem';
import { world } from '@world2d/world';

export const SpawnerIntentSystem: ISystem = {
  name: 'spawner-intent',

  update() {
    for (const entity of world.with('spawn')) {
      const spawn = (entity as any).spawn;
      if (!spawn) continue;

      const enabled = Boolean(spawn.enabled);
      const isAtLimit = Boolean(spawn.isAtLimit);
      const cooldownReady = Number(spawn.cooldown || 0) <= 0;

      const spawnLimit = Math.max(0, Number(spawn.spawnLimit ?? 0));
      const currentCount = Math.max(0, Number(spawn.currentCount ?? 0));
      const spawnBatchSize = Math.max(1, Math.floor(Number(spawn.spawnBatchSize ?? 1)));
      const remaining = Math.max(0, spawnLimit - currentCount);

      const shouldSpawn = enabled && !isAtLimit && cooldownReady;
      const spawnCount = shouldSpawn ? Math.min(spawnBatchSize, remaining) : 0;

      spawn.shouldSpawnThisTick = spawnCount > 0;
      spawn.spawnCountThisTick = spawnCount;
    }
  }
};

