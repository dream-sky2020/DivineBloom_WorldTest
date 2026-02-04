/**
 * 统一的形状定义
 * 被 Physics 和 Triggers 等组件共用
 */
export enum ShapeType {
  CIRCLE = 'circle',
  AABB = 'aabb',
  OBB = 'obb',         // 旋转矩形
  CAPSULE = 'capsule',
  POINT = 'point'      // 点 (极小圆)
}
