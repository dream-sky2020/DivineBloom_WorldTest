import { world, actionQueue } from '@/game/ecs/world'

/**
 * TriggerSystem
 * 决策核心
 * 输入: DetectArea, DetectInput 的运行时数据
 * 输出: 向 ActionQueue 推送执行请求
 */
export const TriggerSystem = {
  update(dt) {
    const triggers = world.with('trigger')

    for (const entity of triggers) {
      const trigger = entity.trigger
      
      // 1. 状态检查
      if (!trigger.state.active) continue
      if (trigger.state.oneShotExecuted) continue
      if (trigger.state.cooldownTimer > 0) {
        trigger.state.cooldownTimer -= dt
        continue
      }

      // 2. 规则匹配
      let shouldTrigger = false
      
      // 遍历所有规则，通常满足任意一个规则即可触发 (OR 逻辑)，
      // 也可以设计为必须满足所有 (AND 逻辑)，这里暂定为 OR，也就是只要有一个规则通过就执行
      for (const rule of trigger.rules) {
        if (this.checkRule(entity, rule)) {
          shouldTrigger = true
          break
        }
      }

      // 3. 执行决策
      if (shouldTrigger) {
        // 标记状态
        if (trigger.state.oneShot) { // 如果配置了 oneShot (可以在 component 定义中增加这个配置，或者从 rules 推断)
           // 暂时假设 oneShot 是 Trigger 的一部分，或者通过 actions 决定
           // 这里我们简单处理：只要触发了，就看是否需要禁用
        }
        
        // 收集所有 Actions 并推送到队列
        for (const actionType of trigger.actions) {
          actionQueue.push({
            source: entity,
            type: actionType,
            // 可以附带触发目标，例如 detectArea.results[0]
            target: entity.detectArea?.results?.[0] || null
          })
        }
        
        // 处理 OneShot 逻辑 (如果在 TriggerConfig 中有定义)
        // 目前 Trigger 定义里没有显式 oneShot 字段，但在 checkRule 里可能需要 context
        // 我们简单约定：如果 rules 里包含 'onEnter' 且没有后续的持续触发逻辑，通常是一次性的？
        // 不，还是应该在 Trigger 组件数据里加个 oneShot 标记，或者在 Rule 里。
        // 既然 User 没有显式要求 OneShot 字段，我先保留原有的行为：
        // 如果是 BATTLE 通常是 OneShot，如果是 TELEPORT 也是。
        // 让我们在 Trigger 定义中增加 oneShot 字段，或者根据 Action 类型硬编码（不推荐）。
        // 临时方案：所有触发后设置 0.5s cooldown 防止瞬间重复触发
        trigger.state.cooldownTimer = 0.5
      }
    }
  },

  checkRule(entity, rule) {
    const detectArea = entity.detectArea
    const detectInput = entity.detectInput

    switch (rule.type) {
      case 'onEnter':
        // 需要 DetectArea
        // 简单的 onEnter: 只要 results 不为空，且之前是空的 (这就需要上一帧的状态记忆)
        // 或者：只要 results 不为空，并且不在 cooldown 中 (TriggerSystem 已经处理了 cooldown)
        // 严格的 onEnter 需要记录 "prevResults"。
        // 简化版：只要在区域内就触发 (依靠 Cooldown 避免每帧触发)
        // 或者：TriggerState 记录 "wasInside"
        
        if (!detectArea) return false
        const isInside = detectArea.results.length > 0
        
        if (rule.requireEnterOnly) {
           // 真正的 onEnter
           const wasInside = entity.trigger.state.wasInside || false
           entity.trigger.state.wasInside = isInside
           return isInside && !wasInside
        }
        
        return isInside

      case 'onStay':
        if (!detectArea) return false
        return detectArea.results.length > 0

      case 'onPress':
        // 需要 DetectInput
        if (!detectInput) return false
        
        // 如果需要同时在区域内
        if (rule.requireArea) {
          if (!detectArea || detectArea.results.length === 0) return false
        }
        
        return detectInput.justPressed || detectInput.isPressed // 视需求而定，通常交互是 justPressed

      default:
        return false
    }
  }
}
