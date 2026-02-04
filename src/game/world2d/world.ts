import { World } from 'miniplex'

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
}
