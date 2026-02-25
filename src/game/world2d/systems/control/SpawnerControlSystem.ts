import { ISystem } from '@definitions/interface/ISystem';
import { requestComponentCountRefresh, world } from '@world2d/runtime/WorldEcsRuntime';
import { spawnRegistry } from '@world2d/registries/SpawnRegistry';

type XY = { x: number; y: number };

function toNumber(value: any, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getSelfPosition(entity: any): XY {
  return {
    x: toNumber(entity?.transform?.x, 0),
    y: toNumber(entity?.transform?.y, 0)
  };
}

function getTargetPosition(entity: any, fallback: XY): XY {
  const candidates = [
    entity?.motion?.runtime?.targetPos,
    entity?.aiState?.targetPos,
    entity?.targetPos,
    entity?.target?.transform
  ];

  for (const pos of candidates) {
    if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
      return { x: Number(pos.x), y: Number(pos.y) };
    }
  }

  return fallback;
}

function resolveSpawnPosition(entity: any, spawn: any): XY {
  const selfPos = getSelfPosition(entity);
  const mode = spawn?.spawnPosition?.mode || 'self';
  const offsetX = toNumber(spawn?.spawnPosition?.offsetX, 0);
  const offsetY = toNumber(spawn?.spawnPosition?.offsetY, 0);

  if (mode === 'target') {
    return getTargetPosition(entity, selfPos);
  }

  if (mode === 'offset') {
    return {
      x: selfPos.x + offsetX,
      y: selfPos.y + offsetY
    };
  }

  if (mode === 'randomRadius') {
    const radius = Math.max(0, toNumber(spawn?.spawnPosition?.radius, 120));
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;
    return {
      x: selfPos.x + Math.cos(angle) * distance,
      y: selfPos.y + Math.sin(angle) * distance
    };
  }

  if (mode === 'randomRect') {
    const width = Math.max(0, toNumber(spawn?.spawnPosition?.rectWidth, 240));
    const height = Math.max(0, toNumber(spawn?.spawnPosition?.rectHeight, 160));
    return {
      x: selfPos.x + (Math.random() - 0.5) * width,
      y: selfPos.y + (Math.random() - 0.5) * height
    };
  }

  return selfPos;
}

export const SpawnerControlSystem: ISystem = {
  name: 'spawner-control',

  update() {
    for (const entity of world.with('spawn')) {
      const spawn = (entity as any).spawn;
      if (!spawn || !spawn.shouldSpawnThisTick) continue;

      const factory = spawnRegistry.get(String(spawn.spawnEntityId || ''));
      if (!factory) {
        spawn.shouldSpawnThisTick = false;
        spawn.spawnCountThisTick = 0;
        continue;
      }

      const spawnCount = Math.max(1, Math.floor(Number(spawn.spawnCountThisTick ?? 1)));
      let successCount = 0;

      for (let i = 0; i < spawnCount; i++) {
        const position = resolveSpawnPosition(entity, spawn);
        const spawned = factory({
          x: position.x,
          y: position.y,
          params: { ...(spawn.spawnParams || {}) },
          sourceEntity: entity
        });

        if (spawned) {
          const spawnGroup = String(spawn.spawnGroup || '').trim();
          if (spawned.spawnMask && spawnGroup) {
            spawned.spawnMask.group = spawnGroup;
            const sourceSpawnerId = (entity as any)?.id;
            if (sourceSpawnerId != null) {
              spawned.spawnMask.sourceSpawnerId = String(sourceSpawnerId);
            }
          }
          successCount += 1;
        }
      }

      spawn.cooldown = Math.max(0, Number(spawn.spawnInterval || 0));
      spawn.shouldSpawnThisTick = false;
      spawn.spawnCountThisTick = 0;

      if (successCount > 0) {
        requestComponentCountRefresh();
      }
    }
  }
};

