import { world } from '@/game/ecs/world'

/**
 * Input System
 * 负责将硬件输入 (Keyboard) 映射为抽象的控制指令 (Controls Component)
 * 纯粹的输入映射，不包含游戏逻辑
 * 
 * Target Entities:
 * @property {boolean} input - Tag
 * 
 * Output Component:
 * @property {object} controls
 * @property {number} controls.x (-1 to 1)
 * @property {number} controls.y (-1 to 1)
 * @property {boolean} controls.fast
 * @property {boolean} controls.interact
 */

const inputEntities = world.with('input')

export const InputSystem = {
  update(dt, input) {
    for (const entity of inputEntities) {
      const keys = input
      
      // Ensure controls component exists
      if (!entity.controls) {
        entity.controls = { x: 0, y: 0, fast: false, interact: false }
      }
      
      const controls = entity.controls

      // Reset
      controls.x = 0
      controls.y = 0

      // Movement Mapping
      if (keys.isDown('KeyW') || keys.isDown('ArrowUp')) controls.y -= 1
      if (keys.isDown('KeyS') || keys.isDown('ArrowDown')) controls.y += 1
      if (keys.isDown('KeyA') || keys.isDown('ArrowLeft')) controls.x -= 1
      if (keys.isDown('KeyD') || keys.isDown('ArrowRight')) controls.x += 1
      
      // Action Mapping
      controls.fast = keys.isDown('ShiftLeft') || keys.isDown('ShiftRight')
      controls.interact = keys.isDown('Space') || keys.isDown('KeyE') || keys.isDown('Enter')
    }
  }
}
