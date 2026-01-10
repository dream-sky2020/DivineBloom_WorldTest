import { world } from '@/game/ecs/world'

/**
 * Input Sense System
 * 负责读取硬件输入 (Keyboard/Gamepad) 并记录为原始输入组件 (RawInput)
 * 不涉及游戏逻辑判断，只忠实记录当前帧的输入状态
 * 
 * Target Entities:
 * @property {boolean} input - Tag
 * 
 * Output Component:
 * @property {object} rawInput
 * @property {object} rawInput.axes { x, y }
 * @property {object} rawInput.buttons { interact, run, menu, cancel }
 */

const inputEntities = world.with('input')

export const InputSenseSystem = {
  update(dt, input) {
    for (const entity of inputEntities) {
      // Ensure rawInput component exists
      if (!entity.rawInput) {
        world.addComponent(entity, 'rawInput', {
          axes: { x: 0, y: 0 },
          buttons: { interact: false, run: false, menu: false, cancel: false }
        })
      }

      const raw = entity.rawInput
      const keys = input // 假设 input 提供了类似 phaser/custom 的接口

      // 1. Reset
      raw.axes.x = 0
      raw.axes.y = 0

      // 2. Keyboard Mapping (Hardware Layer)
      if (keys.isDown('KeyW') || keys.isDown('ArrowUp')) raw.axes.y -= 1
      if (keys.isDown('KeyS') || keys.isDown('ArrowDown')) raw.axes.y += 1
      if (keys.isDown('KeyA') || keys.isDown('ArrowLeft')) raw.axes.x -= 1
      if (keys.isDown('KeyD') || keys.isDown('ArrowRight')) raw.axes.x += 1

      // Normalize if needed at raw level? 
      // 通常 RawInput 保持原始值，Intent 层处理归一化，但这里做简单的钳制也是可以的
      // 这里保持纯粹的轴向叠加

      // Buttons
      raw.buttons.run = keys.isDown('ShiftLeft') || keys.isDown('ShiftRight')
      raw.buttons.interact = keys.isDown('Space') || keys.isDown('KeyE') || keys.isDown('Enter')
      raw.buttons.menu = keys.isDown('Escape')
      raw.buttons.cancel = keys.isDown('Escape') || keys.isDown('Backspace')

      // TODO: Add Gamepad Support here
    }
  }
}
