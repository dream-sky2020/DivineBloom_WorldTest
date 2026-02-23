/**
 * 运动状态枚举
 * 用于描述 Motion 组件当前的执行状态，供 AI 层读取决策。
 */
export enum MotionStatus {
  IDLE = 'idle',           // 静止，无目标或禁用
  MOVING = 'moving',       // 正常移动中
  ARRIVED = 'arrived',     // 已到达目标点（在 stopDistance 内）
  STUCK = 'stuck',         // 受阻（期望移动但长时间无位移）
  BLOCKED = 'blocked',     // 路径被完全阻挡（例如：前方检测到墙壁且无法绕行）
  SEARCHING = 'searching'  // 正在寻路或搜索目标
}
