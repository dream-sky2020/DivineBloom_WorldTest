import { world } from '@world2d/world';
import { CollisionUtils } from '@world2d/ECSCalculateTool/CollisionUtils';
import { SpatialHashGrid } from '@world2d/ECSCalculateTool/SpatialHashGrid';
import { calculateShapeBounds, checkSweepHit } from '@world2d/ECSCalculateTool/DetectCalcUtils';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { DetectionLayer } from '@components';

type BulletDetectComponent = {
    layerMask?: number;
    ccdEnabled?: boolean;
    ccdMinDistance?: number;
    ccdBuffer?: number;
    resultMode?: 'id' | 'lite';
    results: any[];
    fullResults: any[];
    lastHits?: Set<string>;
    activeHits?: Set<string>;
};

type BulletDetectableComponent = {
    labels?: string[];
    ccdEnabled?: boolean;
    layer?: number;
    lastHits?: Set<string>;
    activeHits?: Set<string>;
};

/**
 * BulletDetectSenseSystem
 * 专门处理 BulletDetect / BulletDetectable。
 */
export const BulletDetectSenseSystem: ISystem & {
    grid: any;
    addedStaticEntities: WeakSet<object>;
    _buildFullResult(logicEntity: IEntity, detectable: any): any;
    _resolveDetectableForTarget(target: IEntity): BulletDetectableComponent | undefined;
    _resolveLogicEntityAndDetectable(target: IEntity): { logicEntity: IEntity | undefined; logicDetectable: BulletDetectableComponent | undefined };
    _prepareDetectableBuffers(targets: any): void;
    _processDetectors(detectors: any): void;
    reset(): void;
} = {
    name: 'bullet-detect-sense',

    grid: new SpatialHashGrid({ x: 0, y: 0, width: 4000, height: 4000 }, 100),
    addedStaticEntities: new WeakSet(),

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

    _resolveDetectableForTarget(target: IEntity): BulletDetectableComponent | undefined {
        return (
            (target as any).bulletDetectable ||
            (target as any).parent?.entity?.bulletDetectable
        );
    },

    _resolveLogicEntityAndDetectable(target: IEntity) {
        const ownDetectable = (target as any).bulletDetectable;
        const logicEntity = ownDetectable ? target : (target as any).parent?.entity;
        if (!logicEntity) return { logicEntity: undefined, logicDetectable: undefined };
        return {
            logicEntity,
            logicDetectable: (logicEntity as any).bulletDetectable
        };
    },

    _prepareDetectableBuffers(targets: any) {
        const processed = new Set<object>();
        for (const target of targets) {
            const t = target as IEntity;
            const detectable = this._resolveDetectableForTarget(t);
            if (!detectable || typeof detectable !== 'object') continue;
            if (processed.has(detectable as object)) continue;
            processed.add(detectable as object);

            if (!(detectable.lastHits instanceof Set)) detectable.lastHits = new Set<string>();
            if (!(detectable.activeHits instanceof Set)) detectable.activeHits = new Set<string>();
            const previousActiveHits = detectable.activeHits;
            detectable.activeHits = detectable.lastHits;
            detectable.lastHits = previousActiveHits;
            detectable.activeHits.clear();
        }
    },

    _processDetectors(detectors: any) {
        for (const entity of detectors) {
            const e = entity as IEntity;
            const detect = (e as any).bulletDetect as BulletDetectComponent | undefined;
            if (!detect) continue;
            const detectorId = String(e.uuid ?? e.id ?? (e as any).__id ?? '');

            if (!(detect.lastHits instanceof Set)) detect.lastHits = new Set<string>();
            if (!(detect.activeHits instanceof Set)) detect.activeHits = new Set<string>();
            const previousActiveHits = detect.activeHits;
            detect.activeHits = detect.lastHits;
            detect.lastHits = previousActiveHits;
            detect.activeHits.clear();

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
            const detectorBounds = calculateShapeBounds(transform, shape);
            const candidates = this.grid.query(detectorBounds);
            const layerMask = detect.layerMask ?? DetectionLayer.ALL;

            for (const target of candidates) {
                const t = target as IEntity;
                if (t === e) continue;

                const detectable = this._resolveDetectableForTarget(t);
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
                    hit = checkSweepHit(prevCenter, currCenter, shape, targetShape, targetTransform, detect.ccdBuffer || 0);
                } else {
                    hit = !!CollisionUtils.checkCollision(proxyEntity, proxyTarget);
                }
                if (!hit) continue;

                const { logicEntity, logicDetectable } = this._resolveLogicEntityAndDetectable(t);
                if (!logicEntity || !logicDetectable) continue;
                if (hitEntitySet.has(logicEntity)) continue;
                hitEntitySet.add(logicEntity);

                const fullResult = this._buildFullResult(logicEntity, logicDetectable);
                fullResults.push(fullResult);
                detect.activeHits.add(fullResult.id);

                if (!(logicDetectable.lastHits instanceof Set)) logicDetectable.lastHits = new Set<string>();
                if (!(logicDetectable.activeHits instanceof Set)) logicDetectable.activeHits = new Set<string>();
                logicDetectable.activeHits.add(detectorId);

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
            const detectable =
                (t as any).bulletDetectable ||
                (t as any).parent?.entity?.bulletDetectable;
            if (!detectable) continue;

            const transform = t.transform;
            const shape = t.shape;
            if (!transform || !shape) continue;

            const bounds = calculateShapeBounds(transform, shape);
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

        const bulletDetectors = world.with('bulletDetect', 'shape', 'transform');
        this._prepareDetectableBuffers(targets);
        this._processDetectors(bulletDetectors);
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
