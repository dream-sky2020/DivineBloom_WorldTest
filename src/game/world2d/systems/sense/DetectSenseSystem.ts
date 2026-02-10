import { world } from '@world2d/world';
import { CollisionUtils } from '@world2d/ECSCalculateTool/CollisionUtils';
import { ShapeType } from '@world2d/definitions/enums/Shape';
import { SpatialHashGrid } from '@world2d/ECSCalculateTool/SpatialHashGrid';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { DetectionLayer } from '@components';

type DetectComponentKey = 'portalDetect' | 'bulletDetect';

/**
 * DetectSenseSystem
 * 专门处理 PortalDetect / BulletDetect，使用 layerMask 做过滤。
 */
export const DetectSenseSystem: ISystem & {
    grid: any;
    addedStaticEntities: WeakSet<object>;
    _calculateBounds(transform: any, shape: any): any;
    _getShapeRadius(shape: any): number;
    _checkSweepHit(prevPos: any, currPos: any, detectorShape: any, targetShape: any, targetTransform: any, buffer: number): boolean;
    _processDetectors(detectors: any, detectKey: DetectComponentKey): void;
    _buildFullResult(logicEntity: IEntity, detectable: any): any;
    reset(): void;
} = {
    name: 'detect-sense',

    grid: new SpatialHashGrid({ x: 0, y: 0, width: 4000, height: 4000 }, 100),
    addedStaticEntities: new WeakSet(),

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

    _buildFullResult(logicEntity: IEntity, detectable: any) {
        const idRaw = logicEntity?.uuid ?? logicEntity?.id ?? logicEntity?.__id ?? '';
        const id = String(idRaw);
        return {
            id,
            uuid: logicEntity?.uuid,
            type: logicEntity?.type,
            entity: logicEntity,
            detectable: {
                labels: Array.isArray(detectable?.labels) ? [...detectable.labels] : [],
                ccdEnabled: !!detectable?.ccdEnabled,
                layer: detectable?.layer ?? DetectionLayer.NONE
            }
        };
    },

    _processDetectors(detectors: any, detectKey: DetectComponentKey) {
        for (const entity of detectors) {
            const e = entity as IEntity;
            const detect = (e as any)[detectKey];
            if (!detect) continue;

            detect.results = [];
            const fullResults: any[] = [];
            const hitEntitySet = new Set<any>();

            const shape = e.shape;
            const transform = e.transform;
            if (!shape || !transform) continue;

            const currCenter = {
                x: transform.x + (shape.offsetX || 0),
                y: transform.y + (shape.offsetY || 0)
            };
            const prevCenter = {
                x: (transform.prevX ?? transform.x) + (shape.offsetX || 0),
                y: (transform.prevY ?? transform.y) + (shape.offsetY || 0)
            };
            const moveDist = Math.hypot(currCenter.x - prevCenter.x, currCenter.y - prevCenter.y);
            const useCCD = !!detect.ccdEnabled && moveDist >= (detect.ccdMinDistance || 0);
            const detectorBounds = this._calculateBounds(transform, shape);
            const candidates = this.grid.query(detectorBounds);
            const layerMask = detect.layerMask ?? DetectionLayer.ALL;

            for (const target of candidates) {
                const t = target as IEntity;
                if (t === e) continue;

                const detectable = t.detectable || t.parent?.entity?.detectable;
                if (!detectable) continue;

                if (t.parent && e.parent && t.parent.entity === e.parent.entity) continue;
                if (t.parent && t.parent.entity === e) continue;
                if (e.parent && e.parent.entity === t) continue;

                const targetLayer = detectable.layer ?? DetectionLayer.NONE;
                if ((targetLayer & layerMask) === 0) continue;

                const targetShape = t.shape;
                const targetTransform = t.transform;
                if (!targetShape || !targetTransform) continue;

                const proxyEntity = { transform, shape };
                const proxyTarget = { transform: targetTransform, shape: targetShape };
                const allowCCD = !!detect.ccdEnabled && !!detectable.ccdEnabled;

                let hit = false;
                if (useCCD && allowCCD) {
                    hit = this._checkSweepHit(prevCenter, currCenter, shape, targetShape, targetTransform, detect.ccdBuffer || 0);
                } else {
                    hit = !!CollisionUtils.checkCollision(proxyEntity, proxyTarget);
                }
                if (!hit) continue;

                const logicEntity = t.detectable ? t : t.parent.entity;
                if (hitEntitySet.has(logicEntity)) continue;
                hitEntitySet.add(logicEntity);

                const logicDetectable = logicEntity?.detectable || detectable;
                const fullResult = this._buildFullResult(logicEntity, logicDetectable);
                fullResults.push(fullResult);

                if (detect.resultMode === 'id') {
                    detect.results.push(fullResult.id);
                } else {
                    detect.results.push({
                        id: fullResult.id,
                        uuid: fullResult.uuid,
                        type: fullResult.type,
                        labels: fullResult.detectable.labels
                    });
                }
            }

            detect.fullResults = fullResults;
        }
    },

    update(dt: number) {
        this.grid.clearDynamic();
        const targets = world.with('shape', 'transform');

        for (const target of targets) {
            const t = target as IEntity;
            const detectable = t.detectable || t.parent?.entity?.detectable;
            if (!detectable) continue;

            const transform = t.transform;
            const shape = t.shape;

            if (!transform || !shape) continue;

            const bounds = this._calculateBounds(transform, shape);
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

        const portalDetectors = world.with('portalDetect', 'shape', 'transform');
        const bulletDetectors = world.with('bulletDetect', 'shape', 'transform');
        this._processDetectors(portalDetectors, 'portalDetect');
        this._processDetectors(bulletDetectors, 'bulletDetect');
    },

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
            if (shape.rotation) {
                const r = Math.sqrt(shape.width * shape.width + shape.height * shape.height) / 2;
                hw = r;
                hh = r;
            } else {
                hw = shape.width / 2;
                hh = shape.height / 2;
            }
        } else if (shape.type === ShapeType.CAPSULE) {
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

    reset() {
        this.grid.clearStatic();
        this.grid.clearDynamic();
        this.addedStaticEntities = new WeakSet();
    },

    init(mapData?: any) {
        this.reset();
    }
};
