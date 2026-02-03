import { world } from '@world2d/world'
import { createLogger } from '@/utils/logger'
import { CollisionUtils } from '@world2d/ECSCalculateTool/CollisionUtils'
import { ShapeType } from '@world2d/definitions/enums/Shape'
import { SpatialHashGrid } from '@world2d/ECSCalculateTool/SpatialHashGrid'

const logger = createLogger('DetectAreaSystem')

/**
 * DetectAreaSystem
 * 负责处理空间感知逻辑 (Area & Projectile)
 * 优化: 空间划分 + GC 优化 + 动静分离 + 射线检测
 */
export const DetectAreaSystem = {
  // 空间网格
  grid: new SpatialHashGrid({ x: 0, y: 0, width: 4000, height: 4000 }, 100),
  
  // 追踪已添加的静态实体，避免重复插入
  addedStaticEntities: new WeakSet(),
  
  // 场景是否重置过 (用于清空静态缓存)
  sceneId: null,

  update(dt) {
    // 0. 场景变更检测 (简单起见，如果实体数量变为0或者外部通知，应重置)
    // 这里简单实现：每帧清理动态层
    this.grid.clearDynamic();

    // 1. 准备实体查询
    // 现在所有参与探测的实体都必须有 transform (由 SyncTransformSystem 保证同步)
    const detectors = world.with('detectArea', 'shape', 'transform');
    const projectiles = world.with('detectProjectile', 'transform');
    // [Updated] targets 查询改为只要有 shape 和 transform 即可，detectable 可能在父实体上
    const targets = world.with('shape', 'transform');

    // 2. 更新空间索引 (Targets)
    for (const target of targets) {
      // [Updated] 允许 detectable 组件在父实体上
      const detectable = target.detectable || target.parent?.entity?.detectable;
      if (!detectable) continue;

      const transform = target.transform;
      const shape = target.shape;
      
      if (!transform || !shape) continue;

      // 计算包围盒
      const bounds = this._calculateBounds(transform, shape);
      
      // 动静分离策略
      // 如果实体有 velocity 组件且速度不为 0，或者显式标记为 dynamic，则视为动态
      // [Updated] 检查 Parent 是否有 Velocity
      const velocity = target.velocity || (target.parent?.entity?.velocity);
      const type = target.type || (target.parent?.entity?.type);
      
      const isStatic = !velocity && type === 'obstacle';

      if (isStatic) {
        if (!this.addedStaticEntities.has(target)) {
          this.grid.insert(target, bounds, true);
          this.addedStaticEntities.add(target);
        }
      } else {
        this.grid.insert(target, bounds, false);
      }
    }

    // 3. 处理区域探测 (DetectArea)
    for (const entity of detectors) {
      const detect = entity.detectArea;
      detect.results = []; // 重置结果

      const shape = entity.shape;
      const transform = entity.transform;

      if (!shape || !transform) continue;

      // 构造 Detector 的 Bounds 用于查询网格
      const detectorBounds = this._calculateBounds(transform, shape);
      
      // 3.1 空间查询：只获取附近的潜在目标
      const candidates = this.grid.query(detectorBounds);

      // 预处理标签集合
      const requiredLabels = Array.isArray(detect.target) ? detect.target : [detect.target];
      const requiredSet = new Set([...requiredLabels, ...(detect.includeTags || [])]);
      const excludeSet = detect.excludeTags ? new Set(detect.excludeTags) : null;

      // 3.2 精确检测
      for (const target of candidates) {
        if (target === entity) continue;
        
        // [Updated] 获取逻辑实体 (拥有 detectable 的那个)
        const detectable = target.detectable || target.parent?.entity?.detectable;
        if (!detectable) continue;

        // 如果是同一个 Parent 下的子实体，也应该忽略
        if (target.parent && entity.parent && target.parent.entity === entity.parent.entity) continue;
        if (target.parent && target.parent.entity === entity) continue;
        if (entity.parent && entity.parent.entity === target) continue;

        // 标签筛选
        const labels = detectable.labels;
        if (!labels.some(l => requiredSet.has(l))) continue;
        if (excludeSet && labels.some(l => excludeSet.has(l))) continue;

        const targetShape = target.shape;
        const targetTransform = target.transform;
        
        if (!targetShape || !targetTransform) continue;

        // 碰撞检测 (使用 CollisionUtils 的新统一接口)
        const proxyEntity = { transform: transform, shape: shape };
        const proxyTarget = { transform: targetTransform, shape: targetShape };

        if (CollisionUtils.checkCollision(proxyEntity, proxyTarget)) {
          // [Updated] 存入结果的是逻辑实体 (通常是 Root)
          const logicEntity = target.detectable ? target : target.parent.entity;
          detect.results.push(logicEntity);
        }
      }
    }

    // 4. 处理投射物检测 (DetectProjectile - CCD)
    for (const entity of projectiles) {
      const proj = entity.detectProjectile;
      const currPos = entity.transform;
      const prevPos = proj.prevPosition || { x: currPos.x, y: currPos.y };
      
      proj.results = [];

      // 构造射线的包围盒
      const minX = Math.min(prevPos.x, currPos.x) - 10; // 稍微扩大一点 buffer
      const minY = Math.min(prevPos.y, currPos.y) - 10;
      const maxX = Math.max(prevPos.x, currPos.x) + 10;
      const maxY = Math.max(prevPos.y, currPos.y) + 10;
      
      const rayBounds = { minX, minY, maxX, maxY };
      const candidates = this.grid.query(rayBounds);

      const requiredLabels = Array.isArray(proj.target) ? proj.target : [proj.target];
      const requiredSet = new Set([...requiredLabels, ...(proj.includeTags || [])]);
      const excludeSet = proj.excludeTags ? new Set(proj.excludeTags) : null;

      for (const target of candidates) {
        if (target === entity) continue;

        // [Updated] 获取逻辑实体
        const detectable = target.detectable || target.parent?.entity?.detectable;
        if (!detectable) continue;

        const labels = detectable.labels;
        if (!labels.some(l => requiredSet.has(l))) continue;
        if (excludeSet && labels.some(l => excludeSet.has(l))) continue;

        // 射线检测
        const tShape = target.shape;
        const tPos = target.transform;
        
        if (!tShape || !tPos) continue;

        // 目标实际位置 (考虑 offset)
        const targetCenter = {
            x: tPos.x + (tShape.offsetX || 0),
            y: tPos.y + (tShape.offsetY || 0)
        };

        let hit = false;

        if (tShape.type === ShapeType.CIRCLE || tShape.type === ShapeType.POINT) {
            const radius = tShape.radius || (tShape.type === ShapeType.POINT ? 0.1 : 0);
            hit = CollisionUtils.checkSegmentCircle(prevPos, currPos, { ...targetCenter, radius });
        } else if (tShape.type === ShapeType.AABB) {
            const aabb = {
                minX: targetCenter.x - tShape.width / 2,
                maxX: targetCenter.x + tShape.width / 2,
                minY: targetCenter.y - tShape.height / 2,
                maxY: targetCenter.y + tShape.height / 2
            };
            hit = CollisionUtils.checkSegmentAABB(prevPos, currPos, aabb);
        } else {
            // 对于复杂形状 (Capsule, OBB)，退化为 AABB 检测或圆形检测
            // 简单处理：使用最大尺寸作为半径检测
            const r = Math.max(tShape.width || 0, tShape.height || 0, tShape.radius || 0);
            hit = CollisionUtils.checkSegmentCircle(prevPos, currPos, { ...targetCenter, radius: r });
        }

        if (hit) {
          // [Updated] 存入结果的是逻辑实体
          const logicEntity = target.detectable ? target : target.parent.entity;
          proj.results.push(logicEntity);
        }
      }

      // 更新上一帧位置
      proj.prevPosition = { x: currPos.x, y: currPos.y };
    }
  },

  /**
   * 辅助函数：计算组件的 AABB 包围盒
   * @param {Object} transform - Transform 组件
   * @param {Object} shape - Shape 数据对象 (SingleShape)
   */
  _calculateBounds(transform, shape) {
    if (!shape) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const x = transform.x + (shape.offsetX || 0);
    const y = transform.y + (shape.offsetY || 0);
    let hw = 0, hh = 0;

    if (shape.type === ShapeType.CIRCLE || shape.type === ShapeType.POINT) {
      const r = shape.radius || (shape.type === ShapeType.POINT ? 0.1 : 0);
      hw = r;
      hh = r;
    } else if (shape.type === ShapeType.AABB || shape.type === ShapeType.OBB) {
        // OBB 粗略估计为外接 AABB (使用对角线或最大边)
        if (shape.rotation) {
            const r = Math.sqrt(shape.width * shape.width + shape.height * shape.height) / 2;
            hw = r;
            hh = r;
        } else {
            hw = shape.width / 2;
            hh = shape.height / 2;
        }
    } else if (shape.type === ShapeType.CAPSULE) {
        // Capsule 包围盒
        // p1, p2 是局部坐标
        const p1 = shape.p1 || {x:0, y:0};
        const p2 = shape.p2 || {x:0, y:0};
        const r = shape.radius || 0;
        
        const minX = Math.min(p1.x, p2.x) - r;
        const maxX = Math.max(p1.x, p2.x) + r;
        const minY = Math.min(p1.y, p2.y) - r;
        const maxY = Math.max(p1.y, p2.y) + r;
        
        // 这里的 x,y 是中心点，我们需要返回的是绝对坐标的 min/max
        return {
            minX: x + minX,
            maxX: x + maxX,
            minY: y + minY,
            maxY: y + maxY
        };
    }

    return {
      minX: x - hw,
      maxX: x + hw,
      minY: y - hh,
      maxY: y + hh
    };
  },
  
  // 外部调用：重置系统状态 (例如切换地图时)
  reset() {
      this.grid.clearStatic();
      this.grid.clearDynamic();
      this.addedStaticEntities = new WeakSet();
  }
}
