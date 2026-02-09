import { world } from '@world2d/world';
import { createLogger } from '@/utils/logger';
import { CollisionUtils } from '@world2d/ECSCalculateTool/CollisionUtils';
import { ShapeType } from '@world2d/definitions/enums/Shape';
import { SpatialHashGrid } from '@world2d/ECSCalculateTool/SpatialHashGrid';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('DetectAreaSystem');

/**
 * DetectAreaSystem
 * 负责处理空间感知逻辑 (Area & Projectile)
 */
export const DetectAreaSystem: ISystem & {
    grid: any;
    addedStaticEntities: WeakSet<object>;
    sceneId: string | null;
    _calculateBounds(transform: any, shape: any): any;
    _getShapeRadius(shape: any): number;
    _checkSweepHit(prevPos: any, currPos: any, detectorShape: any, targetShape: any, targetTransform: any, buffer: number): boolean;
    reset(): void;
} = {
    name: 'detect-area',

    // 空间网格
    grid: new SpatialHashGrid({ x: 0, y: 0, width: 4000, height: 4000 }, 100),

    // 追踪已添加的静态实体，避免重复插入
    addedStaticEntities: new WeakSet(),

    // 场景是否重置过 (用于清空静态缓存)
    sceneId: null,

    _getShapeRadius(shape: any): number {
        if (!shape) return 0;
        if (shape.type === ShapeType.CIRCLE || shape.type === ShapeType.POINT) {
            return shape.type === ShapeType.POINT ? 0.1 : (shape.radius || 0);
        }
        if (shape.type === ShapeType.AABB || shape.type === ShapeType.OBB) {
            const w = shape.width || 0;
            const h = shape.height || 0;
            return Math.sqrt(w * w + h * h) / 2;
        }
        if (shape.type === ShapeType.CAPSULE) {
            const p1 = shape.p1 || { x: 0, y: 0 };
            const p2 = shape.p2 || { x: 0, y: 0 };
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            return (shape.radius || 0) + len / 2;
        }
        return 0;
    },

    _checkSweepHit(prevPos: any, currPos: any, detectorShape: any, targetShape: any, targetTransform: any, buffer: number) {
        if (!targetShape || !targetTransform) return false;

        const detectorRadius = this._getShapeRadius(detectorShape) + (buffer || 0);
        const targetCenter = {
            x: targetTransform.x + (targetShape.offsetX || 0),
            y: targetTransform.y + (targetShape.offsetY || 0)
        };

        if (targetShape.type === ShapeType.CIRCLE || targetShape.type === ShapeType.POINT) {
            const radius = (targetShape.type === ShapeType.POINT ? 0.1 : (targetShape.radius || 0)) + detectorRadius;
            return CollisionUtils.checkSegmentCircle(prevPos, currPos, { ...targetCenter, radius });
        }

        if (targetShape.type === ShapeType.AABB) {
            const halfW = (targetShape.width || 0) / 2 + detectorRadius;
            const halfH = (targetShape.height || 0) / 2 + detectorRadius;
            const aabb = {
                minX: targetCenter.x - halfW,
                maxX: targetCenter.x + halfW,
                minY: targetCenter.y - halfH,
                maxY: targetCenter.y + halfH
            };
            return CollisionUtils.checkSegmentAABB(prevPos, currPos, aabb);
        }

        const r = Math.max(targetShape.width || 0, targetShape.height || 0, targetShape.radius || 0) / 2 + detectorRadius;
        return CollisionUtils.checkSegmentCircle(prevPos, currPos, { ...targetCenter, radius: r });
    },

    update(dt: number) {
        // 0. 场景变更检测 (简单起见，如果实体数量变为0或者外部通知，应重置)
        // 这里简单实现：每帧清理动态层
        this.grid.clearDynamic();

        // 1. 准备实体查询
        const detectors = world.with('detectArea', 'shape', 'transform');
        const targets = world.with('shape', 'transform');

        // 2. 更新空间索引 (Targets)
        for (const target of targets) {
            const t = target as IEntity;
            // [Updated] 允许 detectable 组件在父实体上
            const detectable = t.detectable || t.parent?.entity?.detectable;
            if (!detectable) continue;

            const transform = t.transform;
            const shape = t.shape;

            if (!transform || !shape) continue;

            // 计算包围盒
            const bounds = this._calculateBounds(transform, shape);

            // 动静分离策略
            // 如果实体有 velocity 组件且速度不为 0，或者显式标记为 dynamic，则视为动态
            // [Updated] 检查 Parent 是否有 Velocity
            const velocity = t.velocity || (t.parent?.entity?.velocity);
            const type = t.type || (t.parent?.entity?.type);

            const isStatic = !velocity && type === 'obstacle';

            if (isStatic) {
                if (!this.addedStaticEntities.has(t)) {
                    this.grid.insert(t, bounds, true);
                    this.addedStaticEntities.add(t);
                }
            } else {
                this.grid.insert(t, bounds, false);
            }
        }

        // 3. 处理区域探测 (DetectArea)
        for (const entity of detectors) {
            const e = entity as IEntity;
            const detect = e.detectArea;
            detect.results = []; // 重置结果

            const shape = e.shape;
            const transform = e.transform;

            if (!shape || !transform) continue;

            const detectorShape = shape;

            const currCenter = {
                x: transform.x + (detectorShape.offsetX || 0),
                y: transform.y + (detectorShape.offsetY || 0)
            };
            const prevCenter = {
                x: (transform.prevX ?? transform.x) + (detectorShape.offsetX || 0),
                y: (transform.prevY ?? transform.y) + (detectorShape.offsetY || 0)
            };
            const moveDist = Math.hypot(currCenter.x - prevCenter.x, currCenter.y - prevCenter.y);
            const useCCD = !!detect.ccdEnabled && moveDist >= (detect.ccdMinDistance || 0);

            // 构造 Detector 的 Bounds 用于查询网格
            const detectorBounds = this._calculateBounds(transform, detectorShape);

            // 3.1 空间查询：只获取附近的潜在目标
            const candidates = this.grid.query(detectorBounds);

            // 预处理标签集合
            const requiredLabels = Array.isArray(detect.target) ? detect.target : [detect.target];
            const requiredSet = new Set([...requiredLabels, ...(detect.includeTags || [])]);
            const excludeSet = detect.excludeTags ? new Set(detect.excludeTags) : null;

            // 3.2 精确检测
            for (const target of candidates) {
                const t = target as IEntity;
                if (t === e) continue;

                // [Updated] 获取逻辑实体 (拥有 detectable 的那个)
                const detectable = t.detectable || t.parent?.entity?.detectable;
                if (!detectable) continue;

                // 如果是同一个 Parent 下的子实体，也应该忽略
                if (t.parent && e.parent && t.parent.entity === e.parent.entity) continue;
                if (t.parent && t.parent.entity === e) continue;
                if (e.parent && e.parent.entity === t) continue;

                // 标签筛选
                const labels = detectable.labels;
                if (!labels.some((l: string) => requiredSet.has(l))) continue;
                if (excludeSet && labels.some((l: string) => excludeSet.has(l))) continue;

                const targetShape = t.shape;
                const targetTransform = t.transform;

                if (!targetShape || !targetTransform) continue;

                // 碰撞检测 (使用 CollisionUtils 的新统一接口)
                const proxyEntity = { transform: transform, shape: detectorShape };
                const proxyTarget = { transform: targetTransform, shape: targetShape };

                const allowCCD = !!detect.ccdEnabled && !!detectable.ccdEnabled;
                let hit = false;

                if (useCCD && allowCCD) {
                    hit = this._checkSweepHit(prevCenter, currCenter, detectorShape, targetShape, targetTransform, detect.ccdBuffer || 0);
                } else {
                    hit = !!CollisionUtils.checkCollision(proxyEntity, proxyTarget);
                }

                if (hit) {
                    // [Updated] 存入结果的是逻辑实体 (通常是 Root)
                    const logicEntity = t.detectable ? t : t.parent.entity;
                    detect.results.push(logicEntity);
                }
            }

        }

        // DetectProjectile 已废弃，统一由 DetectArea 处理
    },

    /**
     * 辅助函数：计算组件的 AABB 包围盒
     */
    _calculateBounds(transform: any, shape: any) {
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
            const p1 = shape.p1 || { x: 0, y: 0 };
            const p2 = shape.p2 || { x: 0, y: 0 };
            const r = shape.radius || 0;

            const minX = Math.min(p1.x, p2.x) - r;
            const maxX = Math.max(p1.x, p2.x) + r;
            const minY = Math.min(p1.y, p2.y) - r;
            const maxY = Math.max(p1.y, p2.y) + r;

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

    // 外部调用：重置系统状态
    reset() {
        this.grid.clearStatic();
        this.grid.clearDynamic();
        this.addedStaticEntities = new WeakSet();
    },

    // 初始化方法
    init(mapData?: any) {
        // 如果需要基于 mapData 初始化网格，可以在这里做
        this.reset();
    }
};
