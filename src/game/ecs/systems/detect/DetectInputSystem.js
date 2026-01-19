import { world } from '@/game/ecs/world'
import { createLogger } from '@/utils/logger'

const logger = createLogger('DetectInputSystem')

/**
 * DetectInputSystem
 * 负责处理输入感知逻辑
 * 输出: 更新实体上的 detectInput.isPressed / justPressed
 */
export const DetectInputSystem = {
  update(dt) {
    // 获取玩家实体来读取输入意图 (PlayerIntentSystem 已经处理了原始输入)
    let player = null
    const players = world.with('player', 'playerIntent')
    for (const p of players) {
      player = p
      break
    }

    if (!player) return

    // 获取全局管理实体
    const globalEntity = world.with('globalManager').first
    if (!globalEntity || !globalEntity.inputState) return

    const detectors = world.with('detectInput')

    for (const entity of detectors) {
      const input = entity.detectInput

      // 检查 'Interact' 键
      if (input.keys.includes('Interact')) {
        const wantsToInteract = player.playerIntent.wantsToInteract
        const wasPressed = !!globalEntity.inputState.lastPressed['Interact']

        // [FIXED] 使用全局状态来计算 justPressed，避免切换地图导致的重复触发
        input.justPressed = wantsToInteract && !wasPressed
        input.isPressed = wantsToInteract

        // 更新全局状态 (仅在每帧最后更新一次，或者由各个检测器同步更新)
        // 注意：如果有多个实体检测同一个按键，只要其中一个更新了 global 状态，
        // 后面的实体计算出的 justPressed 可能会受影响。
        // 但由于是在同一个 update 循环内，只要我们在循环外部更新 global 状态即可。
      }
    }

    // 循环结束后同步一次全局输入状态
    globalEntity.inputState.lastPressed['Interact'] = player.playerIntent.wantsToInteract
  }
}
