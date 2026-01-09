import { World } from 'miniplex'

// Create the global ECS world
export const world = new World()

// Simple Event Queue for ECS
export const eventQueue = {
  _events: [],
  /**
   * Push an event to the queue
   * @param {string} type 
   * @param {any} payload 
   */
  emit(type, payload) {
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

// Export a helper to clear the world (useful for scene transitions/hot reload)
export function clearWorld() {
  world.clear()
  eventQueue._events = []
  actionQueue.length = 0
}

// Inter-System Communication Queue (High Frequency)
// Used by TriggerSystem -> ActionSystem
export const actionQueue = []
