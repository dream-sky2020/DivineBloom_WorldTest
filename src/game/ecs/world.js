import { World } from 'miniplex'

// Create the global ECS world
export const world = new World()

// Export a helper to clear the world (useful for scene transitions/hot reload)
export function clearWorld() {
  world.clear()
}

