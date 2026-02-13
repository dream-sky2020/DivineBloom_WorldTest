/**
 * 通用运动模式枚举
 * 用于 Motion 组件切换不同移动行为。
 */
export enum MotionMode {
  NONE = 'none',
  LINE = 'line',
  FOLLOW = 'follow',
  STEER_FOLLOW = 'steer_follow',
  HOMING = 'homing',
  ORBIT = 'orbit',
  PATH = 'path',
  WAVE = 'wave'
}
