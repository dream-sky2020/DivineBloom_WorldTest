import { world } from '@world2d/world'

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
    // Defensive Check: Input source
    if (!input) {
        // Rarely happens, but prevents crash if engine input is not ready
        // console.warn('[InputSenseSystem] Input source is undefined'); 
        return;
    }

    for (const entity of inputEntities) {
      // Ensure rawInput component exists
      if (!entity.rawInput) {
        world.addComponent(entity, 'rawInput', {
          axes: { x: 0, y: 0 },
          buttons: { interact: false, run: false, menu: false, cancel: false, shop: false, attack: false }
        })
      }

      const raw = entity.rawInput
      
      // Defensive check for raw structure
      if (!raw.axes || !raw.buttons) {
          console.error(`[InputSenseSystem] Invalid rawInput structure on Entity ${entity.id || 'N/A'}`);
          // Re-init
          raw.axes = { x: 0, y: 0 };
          raw.buttons = { interact: false, run: false, menu: false, cancel: false, shop: false, attack: false };
      }

      const keys = input // 假设 input 提供了类似 phaser/custom 的接口

      // 1. Reset
      raw.axes.x = 0
      raw.axes.y = 0

      try {
          // 2. Keyboard Mapping (Hardware Layer)
          // Defensive: Check if keys.isDown is a function
          if (typeof keys.isDown === 'function') {
              if (keys.isDown('KeyW') || keys.isDown('ArrowUp')) raw.axes.y -= 1
              if (keys.isDown('KeyS') || keys.isDown('ArrowDown')) raw.axes.y += 1
              if (keys.isDown('KeyA') || keys.isDown('ArrowLeft')) raw.axes.x -= 1
              if (keys.isDown('KeyD') || keys.isDown('ArrowRight')) raw.axes.x += 1

              // Buttons
              raw.buttons.run = keys.isDown('ShiftLeft') || keys.isDown('ShiftRight')
              raw.buttons.interact = keys.isDown('Space') || keys.isDown('KeyE') || keys.isDown('Enter')
              raw.buttons.menu = keys.isDown('KeyM')
              raw.buttons.cancel = keys.isDown('Escape') || keys.isDown('Backspace')
              raw.buttons.shop = keys.isDown('KeyP') // Let's use P for Shop
              raw.buttons.attack = keys.isDown('KeyJ') || keys.isDown('KeyK') // J/K 键攻击
          } else {
              // Maybe accessing raw properties? Or input interface changed?
              // console.warn('[InputSenseSystem] Input interface mismatch: isDown not found');
          }
      } catch (e) {
          console.error('[InputSenseSystem] Error reading input:', e);
      }

      // TODO: Add Gamepad Support here
    }
  }
}
