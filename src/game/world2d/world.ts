import { World } from 'miniplex'
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
} from './definitions/buffers'

// Create the global ECS world
export const world = new World<any>()

// Simple Event Queue for ECS
export const eventQueue = {
  _events: [] as { type: string, payload: any }[],
  /**
   * Push an event to the queue
   * @param {string} type 
   * @param {any} payload 
   */
  emit(type: string, payload: any) {
    this._events.push({ type, payload })
  },
  /**
   * Get and clear all events
   * @returns {Array<{type: string, payload: any}>}
   */
  drain() {
    const events = [...this._events]
    this._events = []
    return events
  }
}

export const actionQueue: any[] = []
export const triggerQueue: any[] = []
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

  eventQueue._events = []
  actionQueue.length = 0
  triggerQueue.length = 0
  clearDamageEventBuffer(damageEventBuffer)
  clearFloatingTextBuffer(floatingTextBuffer)
}
