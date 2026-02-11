import { CollisionUtils } from '@world2d/ECSCalculateTool/CollisionUtils';
import { ShapeType } from '@world2d/definitions/enums/Shape';

export function getShapeRadius(shape: any): number {
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
}

export function checkSweepHit(
    prevPos: any,
    currPos: any,
    detectorShape: any,
    targetShape: any,
    targetTransform: any,
    buffer: number
): boolean {
    if (!targetShape || !targetTransform) return false;

    const detectorRadius = getShapeRadius(detectorShape) + (buffer || 0);
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
}

export function calculateShapeBounds(transform: any, shape: any) {
    if (!shape) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const x = transform.x + (shape.offsetX || 0);
    const y = transform.y + (shape.offsetY || 0);
    let hw = 0;
    let hh = 0;

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
}
