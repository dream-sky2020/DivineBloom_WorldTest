import { world } from '../world'
import { makeSprite } from '@/game/GameEngine'

const renderEntities = world.with('position', 'render')

export const RenderSystem = {
  update(renderer) {
    // 1. Sort by Y position for proper occlusion
    // Note: iterating sets/maps is not ordered, so we might need to copy to array if strict ordering is required.
    // miniplex iterators are not sorted.
    const entities = []
    for (const entity of renderEntities) {
      entities.push(entity)
    }
    
    entities.sort((a, b) => a.position.y - b.position.y)

    // 2. Render Loop
    const imgCache = {} // Simple local cache for texture lookups if needed
    
    // Viewport Culling Calculation
    // Default to large bounds if renderer dimensions are missing
    const viewX = renderer.camera ? renderer.camera.x : 0
    const viewY = renderer.camera ? renderer.camera.y : 0
    const viewW = renderer.width || 99999
    const viewH = renderer.height || 99999
    
    const cullMargin = 150 // Allow some margin for sprites/vision cones
    const cullMinX = viewX - cullMargin
    const cullMaxX = viewX + viewW + cullMargin
    const cullMinY = viewY - cullMargin
    const cullMaxY = viewY + viewH + cullMargin

    for (const entity of entities) {
      const { render, position } = entity
      
      // Simple AABB Culling
      if (position.x < cullMinX || position.x > cullMaxX ||
          position.y < cullMinY || position.y > cullMaxY) {
        continue
      }
      
      // Custom Draw Handler (Hybrid Mode)
      if (render.onDraw) {
        render.onDraw(renderer, entity)
        continue
      }

      // Standard Sprite Rendering
      if (render.spriteId) {
        // Assume texture is preloaded in engine, or handle loading here.
        // For this demo, we assume 'sheet' is the main texture.
        // In a real system, 'render' component should hold textureId.
        const textureId = render.textureId || 'sheet'
        const img = renderer.engine?.textures?.get(textureId)

        if (img) {
            // Reconstruct or use cached sprite definition
            // Ideally, the 'render' component should hold the full sprite object or enough data to make it.
            // Here we use a helper or data from component.
            const spriteDef = render.spriteDef || makeSprite({
                imageId: textureId,
                sx: render.sx || 0, 
                sy: render.sy || 0, 
                sw: render.sw || 32, 
                sh: render.sh || 32,
                ax: render.ax || 0.5, 
                ay: render.ay || 1.0
            })

            renderer.drawSprite(img, spriteDef, position, render.scale || 1)
        } else {
             // Fallback
             renderer.drawCircle(position.x, position.y - 16, 14, '#ef4444')
        }
      }
    }
  }
}
