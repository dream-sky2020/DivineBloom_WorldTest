import { World } from 'miniplex'
import { ensureEntityId } from '../definitions/interface/IEntity'
import {
  clearDamageEventBuffer,
  clearFloatingTextBuffer,
  compactDamageEventBuffer,
  createDamageEventBuffer,
  createFloatingTextBuffer,
  drainDamageEventBuffer,
  getActiveFloatingTexts,
  pushDamageEvent,
  pushFloatingText,
  updateFloatingTextBuffer,
  type DamageEventBufferData,
  type DamageEventInput,
  type FloatingTextBufferData,
  type FloatingTextSpawnInput
} from '../definitions/buffers'

// Create the global ECS world
export const world = new World<any>()
const worldRuntime = world as any
const originalWorldAdd = worldRuntime.add.bind(worldRuntime)
worldRuntime.add = (entity: any) => {
  ensureEntityId(entity)
  return originalWorldAdd(entity)
}

// Shared spawn group count cache (spawn group -> entity count)
export const spawnGroupCountMap = new Map<string, number>()

export const worldRuntimeStats = {
  chasingEnemyCount: 0
}

// Dirty flag: when true, ComponentCountSenseSystem rebuilds spawnGroupCountMap
export let shouldUpdateSpawnGroupCountMap = true

export function requestComponentCountRefresh() {
  shouldUpdateSpawnGroupCountMap = true
}

export function setShouldUpdateComponentCountMap(value: boolean) {
  shouldUpdateSpawnGroupCountMap = value
}

export function updateWorldRuntimeStats(patch: Partial<typeof worldRuntimeStats>) {
  Object.assign(worldRuntimeStats, patch)
}

export const damageEventBuffer: DamageEventBufferData = createDamageEventBuffer()
export const floatingTextBuffer: FloatingTextBufferData = createFloatingTextBuffer()

export const damageQueue = {
  _buffer: damageEventBuffer,
  emit(event: DamageEventInput) {
    return pushDamageEvent(this._buffer, event)
  },
  compact(budget?: number) {
    return compactDamageEventBuffer(this._buffer, budget)
  },
  drain() {
    return drainDamageEventBuffer(this._buffer)
  }
}

export const floatingTextQueue = {
  _buffer: floatingTextBuffer,
  emit(input: FloatingTextSpawnInput) {
    return pushFloatingText(this._buffer, input)
  },
  update(dt: number) {
    updateFloatingTextBuffer(this._buffer, dt)
  },
  getActive() {
    return getActiveFloatingTexts(this._buffer)
  },
  clear(nextTick?: number) {
    clearFloatingTextBuffer(this._buffer, nextTick)
  }
}

// Export a helper to clear the world (useful for scene transitions/hot reload)
export function clearWorld() {
  // Modified to preserve Global Entities (marked with globalManager: true)
  const entities = [...world]
  for (const entity of entities) {
    if (!entity.globalManager) {
      world.remove(entity)
    }
  }

  clearDamageEventBuffer(damageEventBuffer)
  clearFloatingTextBuffer(floatingTextBuffer)
  spawnGroupCountMap.clear()
  shouldUpdateSpawnGroupCountMap = true
  worldRuntimeStats.chasingEnemyCount = 0
}
